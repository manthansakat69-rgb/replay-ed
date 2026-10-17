import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Local child_process runner for JavaScript and Python.
 * Enforces a 5-second timeout in a temp directory.
 * NOTE: This fallback is NOT isolated and emits a clear security notice.
 */
export async function runLocalCode({
  code,
  lang = 'javascript',
  stdin = '',
  timeLimit = 5000,
}) {
  console.warn(
    '[SANDBOX WARNING] Judge0 unreachable. Falling back to local subprocess sandbox. NOTE: This fallback is not isolated.'
  );

  const normalizedLang = lang.toLowerCase();
  const isPython = normalizedLang === 'python' || normalizedLang === 'py';

  // Create unique temporary execution file in temp directory
  const ext = isPython ? '.py' : '.cjs';
  const tempDir = path.join(os.tmpdir(), 'ps2-code-sandbox');
  await fs.mkdir(tempDir, { recursive: true });

  const tempFile = path.join(tempDir, `exec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  await fs.writeFile(tempFile, code, 'utf-8');

  let binary = process.execPath; // default to node
  let args = [tempFile];

  if (isPython) {
    binary = process.platform === 'win32' ? 'python' : 'python3';
    args = [tempFile];
  }

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let isFinished = false;

    const child = spawn(binary, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', child.pid.toString(), '/T', '/F']);
        } else {
          child.kill('SIGKILL');
        }
      } catch (err) {
        // Child process may have already exited
      }
    }, timeLimit);

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      // Cap at 1MB to prevent buffer exhaustion attacks
      if (stdout.length > 1024 * 1024) {
        child.kill();
      }
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    const cleanup = async () => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timer);
      try {
        await fs.unlink(tempFile);
      } catch (e) {
        // Ignored
      }
    };

    child.on('error', async (err) => {
      await cleanup();
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        timedOut: false,
      });
    });

    child.on('close', async (exitCode) => {
      await cleanup();
      resolve({
        stdout: stdout.trimEnd(),
        stderr: stderr.trimEnd(),
        exitCode: timedOut ? 124 : (exitCode ?? 0),
        timedOut,
      });
    });
  });
}
