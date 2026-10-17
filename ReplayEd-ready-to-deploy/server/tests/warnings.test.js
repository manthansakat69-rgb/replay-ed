import { test, describe } from 'node:test';
import assert from 'node:assert';
import { evaluateViolationsAndWarnings } from '../src/integrity/signals.js';

describe('Proctoring 3-Warning Engine & Debounce System', () => {
  test('single violation increases warning count', () => {
    const session = { warningCount: 0, status: 'in_progress', lastWarningTimeByType: {} };
    const events = [{ t: 1000, type: 'tab_hidden' }];

    const result = evaluateViolationsAndWarnings(session, events, 3);
    assert.strictEqual(result.warningCount, 1);
    assert.strictEqual(session.warningCount, 1);
    assert.strictEqual(result.flaggedForReview, false);
    assert.ok(result.message.includes('Warning 1 of 3'));
  });

  test('debounces identical violation within 10 seconds (10,000ms)', () => {
    const session = { warningCount: 0, status: 'in_progress', lastWarningTimeByType: {} };
    const events = [
      { t: 1000, type: 'tab_hidden' },
      { t: 3000, type: 'tab_hidden' },  // +2s: ignored by debounce
      { t: 6000, type: 'tab_hidden' },  // +5s: ignored by debounce
      { t: 12000, type: 'tab_hidden' }, // +11s: valid! counts as warning 2
    ];

    const result = evaluateViolationsAndWarnings(session, events, 3);
    assert.strictEqual(result.warningCount, 2);
    assert.strictEqual(result.newViolations.length, 2);
  });

  test('distinct violation types are tracked independently', () => {
    const session = { warningCount: 0, status: 'in_progress', lastWarningTimeByType: {} };
    const events = [
      { t: 1000, type: 'tab_hidden' },
      { t: 2000, type: 'fullscreen_exit' }, // different violation type: allowed
    ];

    const result = evaluateViolationsAndWarnings(session, events, 3);
    assert.strictEqual(result.warningCount, 2);
  });

  test('ordinary window_blur is not counted toward warnings', () => {
    const session = { warningCount: 0, status: 'in_progress', lastWarningTimeByType: {} };
    const events = [
      { t: 1000, type: 'window_blur' },
      { t: 2000, type: 'window_blur' },
    ];

    const result = evaluateViolationsAndWarnings(session, events, 3);
    assert.strictEqual(result.warningCount, 0);
  });

  test('face_missing only counts if sustained for over 5 seconds', () => {
    const session = { warningCount: 0, status: 'in_progress', lastWarningTimeByType: {} };
    // Brief glance: 2 seconds -> should NOT trigger warning
    const briefGlance = [{ t: 1000, type: 'face_missing', data: { durationMs: 2000 } }];
    const res1 = evaluateViolationsAndWarnings(session, briefGlance, 3);
    assert.strictEqual(res1.warningCount, 0);

    // Sustained absence: 6 seconds -> DOES trigger warning
    const sustainedAbsence = [{ t: 15000, type: 'face_missing', data: { durationMs: 6000 } }];
    const res2 = evaluateViolationsAndWarnings(session, sustainedAbsence, 3);
    assert.strictEqual(res2.warningCount, 1);
  });

  test('locks session and flags for human review at 3 warnings', () => {
    const session = { warningCount: 2, status: 'in_progress', lastWarningTimeByType: {} };
    const events = [{ t: 30000, type: 'fullscreen_exit' }];

    const result = evaluateViolationsAndWarnings(session, events, 3);
    assert.strictEqual(result.warningCount, 3);
    assert.strictEqual(result.status, 'locked_for_review');
    assert.strictEqual(result.flaggedForReview, true);
    assert.ok(result.message.includes('flagged for human review'));
    // Ensures neutral language is maintained
    assert.ok(!result.message.toLowerCase().includes('cheat'));
  });
});
