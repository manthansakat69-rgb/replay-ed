import dotenv from 'dotenv';
import { initDb } from '../db/db.js';
import { Concept, Question, User, Exam, Mastery, Session, Attempt, SessionEvents, Signal } from '../db/models.js';
import { conceptsData, questionsData, usersData, examsData } from './seedData.js';

dotenv.config();

export async function runSeed() {
  console.log('[Seed] Initializing database...');
  await initDb();

  console.log('[Seed] Seeding concepts (12 concepts)...');
  await Concept.deleteMany({});
  await Concept.insertMany(conceptsData);

  console.log(`[Seed] Seeding questions (${questionsData.length} questions, >= 3 per concept)...`);
  await Question.deleteMany({});
  await Question.insertMany(questionsData);

  console.log(`[Seed] Seeding demo users (${usersData.length} users: student, trainer, admin)...`);
  await User.deleteMany({});
  await User.insertMany(usersData);

  console.log(`[Seed] Seeding exams (${examsData.length} exams)...`);
  await Exam.deleteMany({});
  await Exam.insertMany(examsData);

  // Seed baseline mastery for student s1 (Alex Chen)
  console.log('[Seed] Seeding baseline mastery records for demo student s1...');
  await Mastery.deleteMany({ studentId: 's1' });
  const demoMastery = [
    { studentId: 's1', conceptId: 'variables', pKnown: 0.95 },
    { studentId: 's1', conceptId: 'loops', pKnown: 0.88 },
    { studentId: 's1', conceptId: 'functions', pKnown: 0.72 },
    { studentId: 's1', conceptId: 'oop_basics', pKnown: 0.65 },
    { studentId: 's1', conceptId: 'inheritance', pKnown: 0.52 },
    { studentId: 's1', conceptId: 'interfaces', pKnown: 0.35 },
  ];
  for (const m of demoMastery) {
    await Mastery.findOneAndUpdate({ studentId: m.studentId, conceptId: m.conceptId }, m, { upsert: true });
  }

  // Seed demo sessions, attempts, events & integrity signals for replay
  console.log('[Seed] Seeding demo sessions, events, and integrity signals...');
  await Session.deleteMany({});
  await Attempt.deleteMany({});
  await SessionEvents.deleteMany({});
  await Signal.deleteMany({});

  const now = Date.now();
  await Session.insertMany([
    {
      id: 'sess_demo_alex',
      examId: 'exam_ds_algo_01',
      studentId: 's1',
      startedAt: new Date(now - 15 * 60 * 1000),
      endsAt: new Date(now + 30 * 60 * 1000),
      maxWarnings: 3,
      warningCount: 0,
      status: 'submitted',
    },
    {
      id: 'sess_demo_maya',
      examId: 'exam_ds_algo_01',
      studentId: 's2',
      startedAt: new Date(now - 10 * 60 * 1000),
      endsAt: new Date(now + 35 * 60 * 1000),
      maxWarnings: 3,
      warningCount: 1,
      status: 'in_progress',
    },
  ]);

  await Attempt.insertMany([
    {
      id: 'attempt_demo_01',
      studentId: 's1',
      sessionId: 'sess_demo_alex',
      questionId: 'q_var_code_1',
      correct: true,
      code: 'function solve() { return 42; }',
      submittedAt: new Date(now - 2 * 60 * 1000),
    },
    {
      id: 'attempt_demo_02',
      studentId: 's2',
      sessionId: 'sess_demo_maya',
      questionId: 'q_loop_code_1',
      correct: false,
      code: 'function solve() { /* partially pasted */ }',
      submittedAt: new Date(now - 1 * 60 * 1000),
    },
  ]);

  await SessionEvents.insertMany([
    {
      sessionId: 'sess_demo_alex',
      attemptId: 'attempt_demo_01',
      events: [
        { t: 1000, type: 'key', data: { key: 'c', len: 1 } },
        { t: 1150, type: 'key', data: { key: 'l', len: 2 } },
        { t: 1300, type: 'key', data: { key: 'a', len: 3 } },
        { t: 1450, type: 'key', data: { key: 's', len: 4 } },
        { t: 1600, type: 'key', data: { key: 's', len: 5 } },
        { t: 60000, type: 'run', data: { lang: 'javascript' } },
        { t: 120000, type: 'run', data: { lang: 'javascript' } },
      ],
    },
    {
      sessionId: 'sess_demo_maya',
      attemptId: 'attempt_demo_02',
      events: [
        { t: 2000, type: 'tab_hidden', data: {} },
        { t: 5000, type: 'tab_visible', data: {} },
        { t: 6200, type: 'paste_attempt_blocked', data: { charCount: 380 } },
        { t: 8000, type: 'fullscreen_exit', data: {} },
      ],
    },
  ]);

  await Signal.insertMany([
    {
      sessionId: 'sess_demo_alex',
      attemptId: 'attempt_demo_01',
      type: 'even_typing_no_deletions',
      at: 45000,
      severity: 'low',
      note: 'Consistent typing rhythm maintained across problem initialization.',
    },
    {
      sessionId: 'sess_demo_maya',
      attemptId: 'attempt_demo_02',
      type: 'paste_after_tab_switch',
      at: 6200,
      severity: 'high',
      note: 'Paste attempt intercepted 1.2s after returning to tab (380 characters).',
    },
    {
      sessionId: 'sess_demo_maya',
      attemptId: 'attempt_demo_02',
      type: 'large_paste_attempt',
      at: 6200,
      severity: 'high',
      note: 'Attempted single insertion of 380 characters.',
    },
  ]);

  console.log('[Seed] Database seeding completed successfully.');
}

// Execute directly if run via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed()
    .then(() => {
      console.log('Seed finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
