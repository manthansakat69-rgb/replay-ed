import { runCode } from './runner.js';

/**
 * Runs code against a question's hidden tests.
 * Never exposes hidden test inputs or expected outputs to the client.
 *
 * @param {object} question - Question document containing hiddenTests
 * @param {string} code - Submitted source code
 * @param {string} [lang='javascript'] - Language
 * @param {function} [customRunner=runCode] - Custom runner override
 * @returns {Promise<{ passed: boolean, results: Array<{ test: number, ok: boolean }>, error?: string }>}
 */
export async function runHiddenTests(question, code, lang = 'javascript', customRunner = runCode) {
  const hiddenTests = question.hiddenTests || [];

  if (hiddenTests.length === 0) {
    const runRes = await customRunner({ code, lang, stdin: '', timeLimit: 5000 });
    const passed = runRes.exitCode === 0 && !runRes.timedOut;
    return {
      passed,
      results: [{ test: 1, ok: passed }],
      error: runRes.timedOut ? 'Time limit exceeded' : (passed ? undefined : (runRes.stderr || 'Execution failed')),
    };
  }

  const results = [];
  let allPassed = true;
  let overallError;

  for (let i = 0; i < hiddenTests.length; i++) {
    const testCase = hiddenTests[i];
    const testNumber = i + 1;

    try {
      const runResult = await customRunner({
        code,
        lang,
        stdin: testCase.stdin || '',
        timeLimit: 5000,
      });

      if (runResult.timedOut) {
        results.push({ test: testNumber, ok: false });
        allPassed = false;
        overallError = 'Time limit exceeded on test case';
        continue;
      }

      if (runResult.exitCode !== 0) {
        results.push({ test: testNumber, ok: false });
        allPassed = false;
        if (!overallError) overallError = runResult.stderr || 'Runtime error encountered';
        continue;
      }

      const actual = runResult.stdout.replace(/\r\n/g, '\n').trim();
      const expected = (testCase.expectedStdout || '').replace(/\r\n/g, '\n').trim();

      const ok = actual === expected;
      results.push({ test: testNumber, ok });

      if (!ok) {
        allPassed = false;
      }
    } catch (err) {
      results.push({ test: testNumber, ok: false });
      allPassed = false;
      overallError = err.message || 'Runner execution failed';
    }
  }

  return {
    passed: allPassed,
    results,
    error: overallError,
  };
}
