/**
 * Hostile Test Sample 3: Outbound Network Exfiltration Attack
 *
 * This script attempts to establish an outbound HTTP/TCP socket connection
 * to an external host (1.1.1.1).
 * In isolated production sandboxes, network egress is disabled via Linux network namespaces.
 */

const http = require('http');

console.log('[Hostile Test 3] Attempting outbound HTTP request to 1.1.1.1...');

const req = http.get('http://1.1.1.1', { timeout: 2000 }, (res) => {
  console.log(`[ALERT] Outbound HTTP connection succeeded with status: ${res.statusCode}`);
  process.exit(0);
});

req.on('timeout', () => {
  console.log('[SECURE] Outbound network request timed out as expected.');
  req.destroy();
  process.exit(1);
});

req.on('error', (err) => {
  console.log(`[SECURE] Outbound network connection blocked/failed: ${err.message}`);
  process.exit(1);
});
