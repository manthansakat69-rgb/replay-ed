import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { User, Exam, Session, Concept, Question, Mastery, Attempt, SessionEvents, Signal } from '../db/models.js';
import { updateMastery } from '../../bkt.js';
import { chooseNext, getDifficultyForMastery } from '../../adaptive.js';
import { evaluateViolationsAndWarnings, computeSignals } from '../integrity/signals.js';
import { runHiddenTests } from '../sandbox/testRunner.js';
import { generateAndVerifyQuestion } from '../sandbox/questionGenerator.js';
import { generateExplainQuestions, gradeExplainAnswer } from '../llm/explainService.js';
import { createRateLimiter } from '../core/rateLimiter.js';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  AuthenticationError,
} from '../core/errors.js';

export const apiRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'replayed_jwt_super_secret_key_2026';
const MAX_WARNINGS = parseInt(process.env.MAX_WARNINGS || '3', 10);

const codeRateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 25 });
const eventsRateLimiter = createRateLimiter({ windowMs: 10000, maxRequests: 60 });

// =========================================================================
// 1. AUTHENTICATION
// =========================================================================
const loginSchema = z.object({
  email: z.string().min(1, 'Email or Student ID is required'),
  password: z.string().optional(),
  role: z.string().optional().default('student'),
});

apiRouter.post('/auth/login', async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors.map((e) => e.message).join(', '));
    }

    const { email, role } = parseResult.data;

    let user = await User.findOne({
      $or: [{ email }, { studentId: email }, { id: email }],
    });

    if (!user) {
      // Demo fallback / auto-provision demo credentials
      const isStudent = role === 'student';
      const id = isStudent ? `s_${Date.now()}` : `t_${Date.now()}`;
      user = await User.create({
        id,
        name: email.includes('@') ? email.split('@')[0] : email,
        email: email.includes('@') ? email : `${email.toLowerCase()}@replayed.edu`,
        role: role || 'student',
        studentId: isStudent ? (!email.includes('@') ? email : 'STU-2026-042') : null,
        cohort: 'Batch 2026-A',
        status: 'Active',
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        batch: user.cohort,
      },
    });
  } catch (err) {
    next(err);
  }
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.string().optional().default('student'),
  studentId: z.string().optional(),
  batch: z.string().optional().default('Batch 2026-A'),
});

apiRouter.post('/auth/register', async (req, res, next) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors.map((e) => e.message).join(', '));
    }

    const { name, email, role, studentId, batch } = parseResult.data;
    const existing = await User.findOne({ email });
    if (existing) {
      throw new ValidationError('User with this email already exists');
    }

    const id = `usr_${Date.now()}`;
    const user = await User.create({
      id,
      name,
      email,
      role,
      studentId: role === 'student' ? (studentId || `STU-${Date.now().toString().slice(-4)}`) : null,
      cohort: batch,
      status: 'Active',
    });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        batch: user.cohort,
      },
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 2. EXAM CONFIGURATION & SESSION MANAGEMENT
// =========================================================================
apiRouter.get('/exams/:id', async (req, res, next) => {
  try {
    const examId = req.params.id;
    let exam = await Exam.findOne({ id: examId });

    if (!exam) {
      exam = {
        id: examId,
        title: 'Adaptive Computer Science & Systems Assessment',
        durationMinutes: 45,
        maxWarnings: MAX_WARNINGS,
        rules: [
          'Fullscreen mode is strictly enforced during the examination.',
          'Tab visibility and browser focus changes are tracked and logged in the integrity stream.',
          'Webcam facial presence is continuously monitored (no video uploaded).',
          'Clipboard paste and drop actions in the code editor are blocked and reported.',
        ],
        totalQuestions: 12,
      };
    }

    return res.json(exam);
  } catch (err) {
    next(err);
  }
});

const startExamSchema = z.object({
  studentId: z.string().optional().default('s1'),
});

apiRouter.post('/exams/:id/start', async (req, res, next) => {
  try {
    const examId = req.params.id;
    const parseResult = startExamSchema.safeParse(req.body);
    const studentId = parseResult.success ? parseResult.data.studentId : 's1';

    let exam = await Exam.findOne({ id: examId });
    const durationMinutes = exam?.durationMinutes || 45;
    const maxWarn = exam?.maxWarnings || MAX_WARNINGS;

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const session = await Session.create({
      id: sessionId,
      examId,
      studentId,
      startedAt,
      endsAt,
      maxWarnings: maxWarn,
      warningCount: 0,
      status: 'in_progress',
      lastWarningTimeByType: {},
      answers: [],
    });

    // Initialize session events document
    await SessionEvents.create({
      sessionId,
      attemptId: sessionId,
      events: [],
    });

    return res.json({
      sessionId: session.id,
      startedAt: session.startedAt,
      endsAt: session.endsAt,
      maxWarnings: session.maxWarnings,
    });
  } catch (err) {
    next(err);
  }
});

const submitExamSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  studentId: z.string().optional(),
  finalCode: z.string().optional(),
  answers: z.array(z.any()).optional(),
});

apiRouter.post('/exams/:id/submit', async (req, res, next) => {
  try {
    const parseResult = submitExamSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors.map((e) => e.message).join(', '));
    }

    const { sessionId, finalCode, answers } = parseResult.data;
    const session = await Session.findOne({ id: sessionId });

    if (!session) {
      throw new NotFoundError(`Session "${sessionId}" not found.`);
    }

    const now = new Date();
    const sessionEndsAt = new Date(session.endsAt);

    // Final submit; reject if past endsAt (server clock)
    if (now.getTime() > sessionEndsAt.getTime() + 5000) {
      throw new ForbiddenError(
        'Submission rejected: Examination deadline has passed according to the server clock.'
      );
    }

    session.status = 'submitted';
    if (answers && Array.isArray(answers)) {
      session.answers = answers;
    }
    await session.save();

    return res.json({
      success: true,
      sessionId: session.id,
      status: session.status,
      submittedAt: now.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 3. ADAPTIVE LEARNING & BKT ENGINE
// =========================================================================
apiRouter.get('/next-question', async (req, res, next) => {
  try {
    const studentId = req.query.studentId || 's1';
    const target = req.query.target || undefined;

    const [conceptsList, questionsList, masteryRows, solvedAttempts] = await Promise.all([
      Concept.find({}),
      Question.find({ verified: true }),
      Mastery.find({ studentId }),
      Attempt.find({ studentId }),
    ]);

    const masteryMap = {};
    for (const m of masteryRows) {
      masteryMap[m.conceptId] = m.pKnown;
    }

    const solvedIds = new Set(
      solvedAttempts.filter((a) => a.correct).map((a) => a.questionId)
    );

    const questionPayload = await chooseNext(masteryMap, target, {
      concepts: conceptsList,
      questions: questionsList,
      solvedIds,
    });

    return res.json(questionPayload);
  } catch (err) {
    next(err);
  }
});

const answerSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
  questionId: z.string().min(1, 'questionId is required'),
  correct: z.boolean().optional(),
  selectedIndex: z.number().int().min(0).optional(),
  code: z.string().optional(),
  sessionId: z.string().optional(),
});

apiRouter.post('/answer', async (req, res, next) => {
  try {
    const parseResult = answerSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors.map((e) => e.message).join(', '));
    }

    const { studentId, questionId, correct, selectedIndex, code, sessionId } = parseResult.data;

    // Server-side security check if sessionId is provided
    if (sessionId) {
      const session = await Session.findOne({ id: sessionId });
      if (session) {
        if (session.status === 'locked_for_review') {
          throw new ForbiddenError('Session is locked for human review. No further answers accepted.');
        }
        if (session.status === 'submitted') {
          throw new ForbiddenError('Session already submitted. No further answers accepted.');
        }
        if (new Date() > new Date(session.endsAt)) {
          throw new ForbiddenError('Assessment deadline exceeded.');
        }
      }
    }

    const question = await Question.findOne({ id: questionId });
    if (!question) {
      throw new NotFoundError(`Question "${questionId}" was not found.`);
    }

    let isCorrect = false;
    if (correct !== undefined) {
      isCorrect = Boolean(correct);
    } else if (selectedIndex !== undefined) {
      isCorrect = question.answerIndex === selectedIndex;
    }

    // Save attempt record
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await Attempt.create({
      id: attemptId,
      studentId,
      questionId,
      correct: isCorrect,
      code: code || null,
      submittedAt: new Date(),
    });

    // Update BKT mastery for this concept
    const existingMastery = await Mastery.findOne({ studentId, conceptId: question.conceptId });
    const currentP = existingMastery ? existingMastery.pKnown : 0.3;
    const nextP = updateMastery(currentP, isCorrect);

    await Mastery.findOneAndUpdate(
      { studentId, conceptId: question.conceptId },
      { pKnown: nextP, updatedAt: new Date().toISOString() },
      { upsert: true }
    );

    // If session provided, log answer to session
    if (sessionId) {
      const session = await Session.findOne({ id: sessionId });
      if (session) {
        session.answers.push({
          questionId,
          conceptId: question.conceptId,
          isCorrect,
          answeredAt: new Date().toISOString(),
        });
        await session.save();
      }
    }

    // Retrieve all updated masteries for the student
    const allMasteryRows = await Mastery.find({ studentId });
    const masteryMap = {};
    for (const m of allMasteryRows) {
      masteryMap[m.conceptId] = m.pKnown;
    }

    // Get next question
    const [conceptsList, questionsList, solvedAttempts] = await Promise.all([
      Concept.find({}),
      Question.find({ verified: true }),
      Attempt.find({ studentId }),
    ]);
    const solvedIds = new Set(
      solvedAttempts.filter((a) => a.correct).map((a) => a.questionId)
    );

    const nextQuestion = await chooseNext(masteryMap, null, {
      concepts: conceptsList,
      questions: questionsList,
      solvedIds,
    });

    return res.json({
      mastery: masteryMap,
      next: nextQuestion,
      correct: isCorrect,
      attemptId,
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 4. CODE SANDBOX & HOSTILE CONTAINMENT
// =========================================================================
const codeRunSchema = z.object({
  questionId: z.string().min(1, 'questionId is required'),
  code: z.string().min(1, 'code is required'),
  lang: z.string().optional().default('javascript'),
  studentId: z.string().optional().default('s1'),
});

apiRouter.post('/code/run', codeRateLimiter, async (req, res, next) => {
  try {
    const parseResult = codeRunSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors.map((e) => e.message).join(', '));
    }

    const { questionId, code, lang, studentId } = parseResult.data;
    const question = await Question.findOne({ id: questionId });
    if (!question) {
      throw new NotFoundError(`Question "${questionId}" was not found.`);
    }

    // Execute code in sandbox
    const testOutcome = await runHiddenTests(question, code, lang);

    // Save attempt
    const attemptId = `att_run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await Attempt.create({
      id: attemptId,
      studentId,
      questionId,
      correct: testOutcome.passed,
      code,
      submittedAt: new Date(),
      runResult: {
        passed: testOutcome.passed,
        results: testOutcome.results,
      },
    });

    // Update BKT mastery
    const existingMastery = await Mastery.findOne({ studentId, conceptId: question.conceptId });
    const currentP = existingMastery ? existingMastery.pKnown : 0.3;
    const nextP = updateMastery(currentP, testOutcome.passed);
    await Mastery.findOneAndUpdate(
      { studentId, conceptId: question.conceptId },
      { pKnown: nextP, updatedAt: new Date().toISOString() },
      { upsert: true }
    );

    return res.json({
      passed: testOutcome.passed,
      results: testOutcome.results,
      error: testOutcome.error,
      attemptId,
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 5. EVENT LOGGING & 3-WARNING SYSTEM
// =========================================================================
const eventItemSchema = z.object({
  t: z.number().int().min(0, 't must be non-negative integer ms since start'),
  type: z.string().min(1, 'event type is required'),
  data: z.any().optional(),
});

const eventsBatchSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  events: z.array(eventItemSchema).min(1, 'events array must not be empty'),
});

apiRouter.post('/events', eventsRateLimiter, async (req, res, next) => {
  try {
    const parseResult = eventsBatchSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors.map((e) => e.message).join(', '));
    }

    const { sessionId, events } = parseResult.data;
    const session = await Session.findOne({ id: sessionId });

    if (!session) {
      throw new NotFoundError(`Session "${sessionId}" was not found.`);
    }

    // Server-side security checks
    const now = new Date();
    const sessionEndsAt = new Date(session.endsAt);

    if (now.getTime() > sessionEndsAt.getTime()) {
      return res.json({
        warningCount: session.warningCount,
        maxWarnings: session.maxWarnings,
        message: 'Assessment deadline has concluded. Events ignored.',
        status: session.status,
        flaggedForReview: session.status === 'locked_for_review',
      });
    }

    if (session.status === 'locked_for_review') {
      return res.json({
        warningCount: session.warningCount,
        maxWarnings: session.maxWarnings,
        message: 'Session flagged for human review. Assessment locked.',
        status: 'locked_for_review',
        flaggedForReview: true,
      });
    }

    // Ingest events
    let sessionEvents = await SessionEvents.findOne({ sessionId });
    if (!sessionEvents) {
      sessionEvents = await SessionEvents.create({ sessionId, events: [] });
    }
    sessionEvents.events.push(...events);
    await sessionEvents.save();

    // Evaluate 3-warning system with 10s debouncing
    const warningOutcome = evaluateViolationsAndWarnings(session, events, session.maxWarnings || MAX_WARNINGS);

    // If max warnings reached: auto-submit and lock session
    if (warningOutcome.flaggedForReview) {
      session.status = 'locked_for_review';
    }
    await session.save();

    // Compute integrity signals from complete event stream
    const computedSignals = computeSignals(sessionEvents.events);
    await Signal.deleteMany({ sessionId });
    if (computedSignals.length > 0) {
      await Signal.insertMany(
        computedSignals.map((s) => ({
          sessionId,
          type: s.type,
          at: s.at,
          severity: s.severity,
          note: s.note,
        }))
      );
    }

    return res.json({
      warningCount: warningOutcome.warningCount,
      maxWarnings: warningOutcome.maxWarnings,
      message: warningOutcome.message,
      status: session.status,
      flaggedForReview: warningOutcome.flaggedForReview,
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 6. REPLAY & INTEGRITY SIGNALS INSPECTION
// =========================================================================
apiRouter.get('/attempt/:id/replay', async (req, res, next) => {
  try {
    const id = req.params.id;
    const [sessionEvents, signals] = await Promise.all([
      SessionEvents.findOne({ sessionId: id }),
      Signal.find({ sessionId: id }),
    ]);

    const events = sessionEvents ? sessionEvents.events : [];

    return res.json({
      events,
      signals: signals || [],
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 7. STUDENT MASTERY & TRAINER BATCH OVERVIEW
// =========================================================================
apiRouter.get('/student/:id/mastery', async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const masteryRows = await Mastery.find({ studentId });
    const masteryMap = {};
    for (const m of masteryRows) {
      masteryMap[m.conceptId] = m.pKnown;
    }
    return res.json(masteryMap);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/trainer/batch', async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' });
    const [allMastery, allSessions, signalsList] = await Promise.all([
      Mastery.find({}),
      Session.find({}),
      Signal.find({}),
    ]);
    const masteryByStudent = {};
    for (const m of allMastery) {
      if (!masteryByStudent[m.studentId]) masteryByStudent[m.studentId] = {};
      masteryByStudent[m.studentId][m.conceptId] = m.pKnown;
    }

    const sessionsByStudent = {};
    for (const s of allSessions) {
      if (!sessionsByStudent[s.studentId]) sessionsByStudent[s.studentId] = [];
      sessionsByStudent[s.studentId].push(s);
    }

    const summary = students.map((stu) => {
      const stuMastery = masteryByStudent[stu.id] || masteryByStudent[stu.studentId] || {};
      const scores = Object.values(stuMastery);
      const avgMastery = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(3)) : 0.3;

      const weakConcepts = Object.entries(stuMastery)
        .filter(([_, p]) => p < 0.6)
        .map(([conceptId, p]) => ({ conceptId, pKnown: p }));

      const stuSessions = sessionsByStudent[stu.id] || sessionsByStudent[stu.studentId] || [];
      const flaggedSessions = stuSessions.filter(
        (s) => s.status === 'locked_for_review' || s.warningCount > 0
      ).map((s) => ({
        sessionId: s.id,
        status: s.status,
        warningCount: s.warningCount,
        maxWarnings: s.maxWarnings,
        signals: signalsList.filter((sig) => sig.sessionId === s.id),
      }));

      return {
        studentId: stu.studentId || stu.id,
        name: stu.name,
        batch: stu.cohort || 'Batch 2026-A',
        masterySummary: stuMastery,
        avgMastery,
        weakConcepts,
        flaggedSessions,
        integrityStatus: flaggedSessions.length > 0 ? 'flagged for human review' : 'verified genuine',
      };
    });

    return res.json(summary);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 8. CODE EXPLANATION (VIVA) VIA CLAUDE API
// =========================================================================
const explainGenerateSchema = z.object({
  attemptId: z.string().optional(),
  code: z.string().optional(),
  questionPrompt: z.string().optional(),
});

apiRouter.post('/explain/generate', async (req, res, next) => {
  try {
    const parseResult = explainGenerateSchema.safeParse(req.body);
    const { attemptId, code, questionPrompt } = parseResult.success ? parseResult.data : {};
    const questions = await generateExplainQuestions(attemptId, code, questionPrompt);
    return res.json({ questions });
  } catch (err) {
    next(err);
  }
});

const explainJudgeSchema = z.object({
  attemptId: z.string().optional(),
  question: z.string().min(1, 'question is required'),
  answer: z.string().min(1, 'answer is required'),
});

apiRouter.post('/explain/judge', async (req, res, next) => {
  try {
    const parseResult = explainJudgeSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors.map((e) => e.message).join(', '));
    }

    const { attemptId, question, answer } = parseResult.data;
    const outcome = await gradeExplainAnswer({ attemptId, question, answer });
    return res.json(outcome);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 9. ADMIN QUESTION GENERATION WITH VERIFICATION
// =========================================================================
const adminGenQuestionSchema = z.object({
  conceptId: z.string().min(1, 'conceptId is required'),
  difficulty: z.coerce.number().int().min(1).max(3).optional().default(1),
});

apiRouter.post('/admin/generate-question', async (req, res, next) => {
  try {
    const parseResult = adminGenQuestionSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors.map((e) => e.message).join(', '));
    }

    const { conceptId, difficulty } = parseResult.data;
    const result = await generateAndVerifyQuestion(conceptId, difficulty);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});
