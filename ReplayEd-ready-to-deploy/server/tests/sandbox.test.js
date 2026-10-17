import { test, describe } from 'node:test';
import assert from 'node:assert';
import { runLocalCode } from '../src/sandbox/localRunner.js';
import { runHiddenTests } from '../src/sandbox/testRunner.js';

describe('Code Sandbox & Hostile Attack Containment', () => {
  test('executes normal code and returns stdout correctly', async () => {
    const code = `console.log("Hello from Sandbox");`;
    const res = await runLocalCode({ code, lang: 'javascript', timeLimit: 3000 });
    assert.strictEqual(res.exitCode, 0);
    assert.strictEqual(res.stdout, 'Hello from Sandbox');
    assert.strictEqual(res.timedOut, false);
  });

  test('contains infinite loop attack with 1000ms timeout', async () => {
    const infiniteLoopCode = `while(true) {}`;
    const startTime = Date.now();
    const res = await runLocalCode({ code: infiniteLoopCode, lang: 'javascript', timeLimit: 1000 });
    const elapsed = Date.now() - startTime;

    assert.strictEqual(res.timedOut, true);
    assert.strictEqual(res.exitCode, 124);
    assert.ok(elapsed >= 900 && elapsed <= 2500, `Execution elapsed: ${elapsed}ms`);
  });

  test('runs hidden tests and never leaks test inputs to results', async () => {
    const question = {
      hiddenTests: [
        { stdin: '4', expectedStdout: 'Even' },
        { stdin: '7', expectedStdout: 'Odd' },
      ],
    };

    const studentCode = `
      const fs = require('fs');
      const n = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
      console.log(n % 2 === 0 ? 'Even' : 'Odd');
    `;

    const outcome = await runHiddenTests(question, studentCode, 'javascript');
    assert.strictEqual(outcome.passed, true);
    assert.strictEqual(outcome.results.length, 2);
    assert.strictEqual(outcome.results[0].ok, true);
    assert.strictEqual(outcome.results[1].ok, true);

    // Verify privacy: neither stdin nor expectedStdout are in results
    assert.strictEqual(outcome.results[0].stdin, undefined);
    assert.strictEqual(outcome.results[0].expectedStdout, undefined);
  });
});
