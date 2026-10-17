const LANGUAGE_IDS = {
  javascript: 93, // Node.js 18.15.0
  js: 93,
  python: 92,     // Python 3.11.2
  py: 92,
  java: 91,       // OpenJDK 17
};

export async function runJudge0Code({
  code,
  lang = 'javascript',
  stdin = '',
  timeLimit = 3000,
}) {
  const baseUrl = (process.env.JUDGE0_URL || 'http://localhost:2358').replace(/\/$/, '');
  const apiKey = process.env.JUDGE0_API_KEY;

  const normalizedLang = lang.toLowerCase();
  const languageId = LANGUAGE_IDS[normalizedLang] || 93;
  const cpuTimeLimit = Math.max(1, Math.ceil(timeLimit / 1000));

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['X-Auth-Token'] = apiKey;
    headers['X-RapidAPI-Key'] = apiKey;
  }

  const payload = {
    source_code: code,
    language_id: languageId,
    stdin: stdin || '',
    cpu_time_limit: cpuTimeLimit,
  };

  const response = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 API request failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const timedOut = result.status?.id === 5;
  const exitCode = result.exit_code ?? (result.status?.id === 3 ? 0 : 1);
  const stdout = (result.stdout || '').trimEnd();
  const stderr = (result.stderr || result.compile_output || result.message || '').trimEnd();

  return {
    stdout,
    stderr,
    exitCode,
    timedOut,
  };
}
