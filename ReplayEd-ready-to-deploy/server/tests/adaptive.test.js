import { test, describe } from 'node:test';
import assert from 'node:assert';
import { chooseNext, getDifficultyForMastery, getTransitivePrerequisites } from '../adaptive.js';

describe('Adaptive Concept Selector & Prerequisite Traversal', () => {
  const mockConcepts = [
    { id: 'c_var', name: 'Variables', prerequisites: [] },
    { id: 'c_loops', name: 'Loops', prerequisites: ['c_var'] },
    { id: 'c_func', name: 'Functions', prerequisites: ['c_var'] },
    { id: 'c_oop', name: 'OOP Basics', prerequisites: ['c_var', 'c_func'] },
  ];

  const mockQuestions = [
    { id: 'q1', conceptId: 'c_var', difficulty: 1, type: 'mcq', prompt: 'Var Q1', options: ['A', 'B'] },
    { id: 'q2', conceptId: 'c_var', difficulty: 2, type: 'mcq', prompt: 'Var Q2', options: ['A', 'B'] },
    { id: 'q3', conceptId: 'c_var', difficulty: 3, type: 'mcq', prompt: 'Var Q3', options: ['A', 'B'] },
    { id: 'q4', conceptId: 'c_func', difficulty: 1, type: 'mcq', prompt: 'Func Q1', options: ['A', 'B'] },
    { id: 'q5', conceptId: 'c_oop', difficulty: 2, type: 'mcq', prompt: 'OOP Q1', options: ['A', 'B'] },
  ];

  test('maps BKT mastery probability to difficulty 1, 2, or 3', () => {
    assert.strictEqual(getDifficultyForMastery(0.2), 1);
    assert.strictEqual(getDifficultyForMastery(0.39), 1);
    assert.strictEqual(getDifficultyForMastery(0.4), 2);
    assert.strictEqual(getDifficultyForMastery(0.69), 2);
    assert.strictEqual(getDifficultyForMastery(0.7), 3);
    assert.strictEqual(getDifficultyForMastery(0.95), 3);
  });

  test('BFS prerequisite traversal correctly detects transitive ancestors', () => {
    const conceptMap = new Map(mockConcepts.map((c) => [c.id, c]));
    const prereqs = getTransitivePrerequisites('c_oop', conceptMap);
    const prereqIds = prereqs.map((p) => p.id);
    assert.ok(prereqIds.includes('c_var'));
    assert.ok(prereqIds.includes('c_func'));
  });

  test('routes student to weak prerequisite if prerequisite mastery < 0.6', async () => {
    const mastery = {
      c_oop: 0.75,
      c_var: 0.35, // weak prerequisite (< 0.6)
      c_func: 0.8,
    };

    const nextQ = await chooseNext(mastery, 'c_oop', {
      concepts: mockConcepts,
      questions: mockQuestions,
    });

    assert.strictEqual(nextQ.conceptId, 'c_var');
    assert.ok(nextQ.reason.includes('weak in Variables'));
  });

  test('returns target concept directly if all prerequisites are mastered >= 0.6', async () => {
    const mastery = {
      c_oop: 0.5,
      c_var: 0.85,
      c_func: 0.9,
    };

    const nextQ = await chooseNext(mastery, 'c_oop', {
      concepts: mockConcepts,
      questions: mockQuestions,
    });

    assert.strictEqual(nextQ.conceptId, 'c_oop');
    assert.strictEqual(nextQ.questionId, 'q5');
    assert.ok(nextQ.reason.includes('OOP Basics'));
  });
});
