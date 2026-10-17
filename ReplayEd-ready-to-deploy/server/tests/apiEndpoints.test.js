import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { app } from '../server.js';

let server;
let baseUrl;

before(async () => {
  // Wait for server to bind to a dynamic test port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('Full API Contract Integration Tests', () => {
  let token = '';
  let sessionId = '';
  let currentQuestionId = '';

  test('POST /api/auth/login authenticates student demo user and returns JWT', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@replayed.edu', role: 'student' }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.role, 'student');
    token = data.token;
  });

  test('GET /api/exams/:id retrieves exam configuration', async () => {
    const res = await fetch(`${baseUrl}/exams/exam_ds_algo_01`);
    assert.strictEqual(res.status, 200);
    const exam = await res.json();
    assert.strictEqual(exam.id, 'exam_ds_algo_01');
    assert.strictEqual(exam.durationMinutes, 45);
    assert.strictEqual(exam.maxWarnings, 3);
  });

  test('POST /api/exams/:id/start creates session with timer and warning configuration', async () => {
    const res = await fetch(`${baseUrl}/exams/exam_ds_algo_01/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 's1' }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.sessionId);
    assert.ok(data.startedAt);
    assert.ok(data.endsAt);
    assert.strictEqual(data.maxWarnings, 3);
    sessionId = data.sessionId;
  });

  test('GET /api/next-question returns adaptive question with explanation reason', async () => {
    const res = await fetch(`${baseUrl}/next-question?studentId=s1&target=loops`);
    assert.strictEqual(res.status, 200);
    const question = await res.json();
    assert.ok(question.questionId);
    assert.ok(question.conceptId);
    assert.ok(question.prompt);
    assert.ok(question.reason);
    currentQuestionId = question.questionId;
  });

  test('POST /api/answer updates BKT mastery and returns next question', async () => {
    const res = await fetch(`${baseUrl}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 's1',
        questionId: currentQuestionId,
        correct: true,
        sessionId,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.mastery);
    assert.strictEqual(typeof data.mastery, 'object');
    assert.ok(data.next);
    assert.ok(data.next.questionId);
  });

  test('POST /api/code/run executes code in sandbox and returns test results', async () => {
    const res = await fetch(`${baseUrl}/code/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: 'q_var_code_1',
        code: `const fs = require('fs'); const n = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10); console.log(n % 2 === 0 ? "Even" : "Odd");`,
        lang: 'javascript',
        studentId: 's1',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.passed, true);
    assert.ok(Array.isArray(data.results));
    assert.strictEqual(data.results[0].ok, true);
  });

  test('POST /api/events logs proctoring batch and evaluates warning system', async () => {
    const res = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        events: [
          { t: 1000, type: 'key', data: { key: 'a' } },
          { t: 2000, type: 'tab_hidden' },
        ],
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.warningCount, 1);
    assert.strictEqual(data.maxWarnings, 3);
    assert.ok(data.message.includes('Warning 1 of 3'));
  });

  test('GET /api/attempt/:id/replay retrieves recorded events and integrity signals', async () => {
    const res = await fetch(`${baseUrl}/attempt/${sessionId}/replay`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.events));
    assert.ok(data.events.length >= 2);
    assert.ok(Array.isArray(data.signals));
  });

  test('GET /api/student/:id/mastery returns student per-concept mastery', async () => {
    const res = await fetch(`${baseUrl}/student/s1/mastery`);
    assert.strictEqual(res.status, 200);
    const mastery = await res.json();
    assert.ok(typeof mastery === 'object');
  });

  test('GET /api/trainer/batch returns all students summary and flagged sessions', async () => {
    const res = await fetch(`${baseUrl}/trainer/batch`);
    assert.strictEqual(res.status, 200);
    const summary = await res.json();
    assert.ok(Array.isArray(summary));
    assert.ok(summary.length > 0);
    assert.ok(summary[0].name);
    assert.ok(summary[0].masterySummary);
  });

  test('POST /api/explain/generate returns viva conceptual questions', async () => {
    const res = await fetch(`${baseUrl}/explain/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: `class LRUCache { constructor() {} }`,
        questionPrompt: `Design LRU Cache with O(1) operations`,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.questions));
    assert.ok(data.questions.length >= 2);
  });

  test('POST /api/explain/judge evaluates student explanation and scores 0-10', async () => {
    const res = await fetch(`${baseUrl}/explain/judge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: `What is the time complexity of the eviction step?`,
        answer: `Eviction is O(1) because we maintain head and tail pointers on a doubly linked list and remove the least recently used node in constant time without iterating.`,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.score === 'number');
    assert.ok(data.score >= 0 && data.score <= 10);
    assert.ok(data.feedback);
  });

  test('POST /api/exams/:id/submit submits exam and marks session submitted', async () => {
    const res = await fetch(`${baseUrl}/exams/exam_ds_algo_01/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        finalCode: 'const x = 1;',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.status, 'submitted');
  });
});
