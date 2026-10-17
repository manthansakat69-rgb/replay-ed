import { test, describe } from 'node:test';
import assert from 'node:assert';
import { update, computePosterior, updateMastery, DEFAULT_BKT_PARAMS } from '../bkt.js';

describe('Bayesian Knowledge Tracing (BKT) Engine', () => {
  test('correct response increases mastery probability', () => {
    const pInit = 0.3;
    const nextP = update(pInit, true);
    assert.ok(nextP > pInit, `Expected ${nextP} > ${pInit}`);
    assert.strictEqual(Math.round(nextP * 1000) / 1000, 0.71);
  });

  test('incorrect response decreases mastery probability', () => {
    const pInit = 0.6;
    const nextP = update(pInit, false);
    assert.ok(nextP < pInit, `Expected ${nextP} < ${pInit}`);
    assert.strictEqual(Math.round(nextP * 1000) / 1000, 0.284);
  });

  test('repeated correct responses converge towards 1.0 (clamped at 0.999)', () => {
    let p = 0.3;
    for (let i = 0; i < 10; i++) {
      p = update(p, true);
    }
    assert.ok(p >= 0.99);
    assert.ok(p <= 0.999);
  });

  test('repeated incorrect responses drop towards lower bound without becoming negative', () => {
    let p = 0.8;
    for (let i = 0; i < 6; i++) {
      p = update(p, false);
    }
    assert.ok(p < 0.25);
    assert.ok(p >= 0.001);
  });

  test('updateMastery alias conforms to STEP 2 interface', () => {
    const p = updateMastery(0.5, true);
    assert.ok(p > 0.5);
  });
});
