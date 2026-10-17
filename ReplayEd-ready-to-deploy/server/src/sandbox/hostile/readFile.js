/**
 * Hostile Test Sample 2: Sensitive System File Read Attack
 *
 * This script attempts to exfiltrate sensitive OS configuration files
 * (/etc/passwd, /etc/shadow, win.ini, hosts).
 * In isolated production sandboxes, filesystem access outside temp is blocked via chroot/cgroups.
 */

const fs = require('fs');

const sensitiveFiles = [
  '/etc/passwd',
  '/etc/shadow',
  'C:\\Windows\\System32\\drivers\\etc\\hosts',
  'C:\\Windows\\win.ini',
];

let accessedSensitiveData = false;

for (const file of sensitiveFiles) {
  try {
    const data = fs.readFileSync(file, 'utf-8');
    if (data && (data.includes('root:') || data.includes('localhost') || data.includes('[fonts]'))) {
      accessedSensitiveData = true;
      console.log(`[VULNERABLE] Successfully read sensitive system file: ${file}`);
      break;
    }
  } catch (err) {
    // Blocked in secure sandbox
  }
}

if (!accessedSensitiveData) {
  console.log('[SECURE] Blocked: sensitive system files cannot be accessed.');
}
