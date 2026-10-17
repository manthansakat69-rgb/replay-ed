import { runLocalCode } from './localRunner.js';
import { runJudge0Code } from './judge0Runner.js';

/**
 * Executes code using Judge0 if configured and accessible,
 * falling back to local runner if Judge0 fails or is unreachable.
 *
 * @param {object} options
 * @param {string} options.code
 * @param {string} [options.lang='javascript']
 * @param {string} [options.stdin='']
 * @param {number} [options.timeLimit=5000]
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number, timedOut: boolean }>}
 */
export async function runCode({
  code,
  lang = 'javascript',
  stdin = '',
  timeLimit = 5000,
}) {
  const judge0Url = process.env.JUDGE0_URL;

  if (judge0Url) {
    try {
      return await runJudge0Code({ code, lang, stdin, timeLimit });
    } catch (err) {
      console.warn(`[Sandbox] Judge0 request failed (${err.message}). Falling back to local runner...`);
      return await runLocalCode({ code, lang, stdin, timeLimit });
    }
  }

  return await runLocalCode({ code, lang, stdin, timeLimit });
}
