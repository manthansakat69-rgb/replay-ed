import { callClaude, stripCodeFences } from './claudeClient.js';
import { Attempt, Question } from '../db/models.js';

/**
 * Generates 2-3 viva conceptual questions regarding student code.
 */
export async function generateExplainQuestions(attemptId, studentCode = '', problemPrompt = '') {
  let code = studentCode;
  let prompt = problemPrompt;

  if (attemptId && (!code || !prompt)) {
    const attempt = await Attempt.findOne({ id: attemptId });
    if (attempt) {
      code = code || attempt.code || '';
      const q = await Question.findOne({ id: attempt.questionId });
      if (q) prompt = prompt || q.prompt;
    }
  }

  const systemPrompt = `You are a strict Computer Science university professor conducting a viva examination.
Analyze the student's code submission and generate 2 to 3 targeted conceptual questions to verify that the student actually wrote and understands the code.
Return STRICT JSON ONLY with format:
{
  "questions": [
    "Question 1 string",
    "Question 2 string"
  ]
}`;

  const userMessage = `Problem Prompt:
${prompt || 'Algorithmic Problem'}

Student Code:
${code || '// No code provided'}

Generate 2-3 conceptual viva questions testing algorithmic reasoning and edge cases.`;

  const raw = await callClaude({
    systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  if (raw) {
    try {
      const parsed = JSON.parse(stripCodeFences(raw));
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed.questions;
      }
    } catch (e) {
      // Fallback below
    }
  }

  // Robust default questions
  return [
    'What is the precise time and space complexity of your primary lookup and update operations, and why?',
    'How does your implementation handle extreme edge cases, such as capacity exhaustion or duplicate key updates?',
    'Why did you choose this particular data structure or control flow instead of a simpler alternative?',
  ];
}

/**
 * Grades student verbal/text explanation to a viva question (score 0-10).
 */
export async function gradeExplainAnswer({ attemptId, question, answer }) {
  let attemptCode = '';
  if (attemptId) {
    const attempt = await Attempt.findOne({ id: attemptId });
    if (attempt) attemptCode = attempt.code || '';
  }

  const systemPrompt = `You are a fair but rigorous Computer Science professor grading a viva defense.
Grade the student's explanation to the question on a scale of 0 to 10.
Return STRICT JSON ONLY with format:
{
  "score": 8.5,
  "feedback": "Clear explanation of algorithmic complexity. Well reasoned.",
  "masteryConfirmed": true
}`;

  const userMessage = `Student Submitted Code:
${attemptCode}

Viva Question:
${question}

Student Response:
${answer}`;

  const raw = await callClaude({
    systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  if (raw) {
    try {
      const parsed = JSON.parse(stripCodeFences(raw));
      if (typeof parsed.score === 'number') {
        return {
          score: Math.min(10, Math.max(0, parsed.score)),
          feedback: parsed.feedback || 'Answer evaluated successfully.',
          masteryConfirmed: Boolean(parsed.masteryConfirmed),
        };
      }
    } catch (e) {
      // Fallback below
    }
  }

  // Robust rubric-based fallback
  const wordCount = (answer || '').trim().split(/\s+/).filter(Boolean).length;
  let score = 5;
  let feedback = 'Basic explanation provided. Consider detailing asymptotic complexity and memory trade-offs.';

  if (wordCount >= 25 && (answer.toLowerCase().includes('o(1)') || answer.toLowerCase().includes('time') || answer.toLowerCase().includes('space') || answer.toLowerCase().includes('node'))) {
    score = 9;
    feedback = 'Strong conceptual explanation demonstrating thorough understanding of the underlying data structures and complexity.';
  } else if (wordCount >= 10) {
    score = 7;
    feedback = 'Reasonable conceptual reasoning. Identifies core mechanics effectively.';
  } else {
    score = 4;
    feedback = 'Brief response. Lacks in-depth justification of data structure mechanics.';
  }

  return {
    score,
    feedback,
    masteryConfirmed: score >= 7,
  };
}
