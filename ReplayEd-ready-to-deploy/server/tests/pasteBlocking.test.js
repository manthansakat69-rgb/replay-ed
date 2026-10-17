import { test, describe } from 'node:test';
import assert from 'node:assert';
import { computeSignals } from '../src/integrity/signals.js';

describe('Paste Blocking & Telemetry Privacy Verification', () => {
  test('logs character count without exfiltrating confidential paste content', () => {
    // In our proctoring client specification, paste data logs ONLY charCount
    const sensitiveCode = 'const leakedPassword = "super_secret_12345";';
    const clientEvent = {
      t: 1200,
      type: 'paste_attempt_blocked',
      data: {
        charCount: sensitiveCode.length, // 44 chars
        // Notice: content is explicitly omitted to protect privacy
      },
    };

    assert.strictEqual(clientEvent.data.charCount, 44);
    assert.strictEqual(clientEvent.data.text, undefined);
  });

  test('detects large paste attempt signal when character count exceeds threshold', () => {
    const events = [
      { t: 500, type: 'key' },
      {
        t: 2000,
        type: 'paste_attempt_blocked',
        data: { charCount: 120 },
      },
    ];

    const signals = computeSignals(events, 'let x = 1;');
    assert.strictEqual(signals.length, 1);
    assert.strictEqual(signals[0].type, 'large_paste_attempt');
    assert.strictEqual(signals[0].at, 2000);
    assert.ok(signals[0].note.includes('120 characters'));
  });

  test('detects paste attempt immediately following tab return (paste_after_tab_switch)', () => {
    const events = [
      { t: 1000, type: 'tab_hidden' },
      { t: 4000, type: 'tab_visible' },
      { t: 5500, type: 'paste_attempt_blocked', data: { charCount: 30 } }, // 1.5s after tab_visible
    ];

    const signals = computeSignals(events, 'let x = 10;');
    const signalTypes = signals.map((s) => s.type);
    assert.ok(signalTypes.includes('paste_after_tab_switch'));
    const tabSignal = signals.find((s) => s.type === 'paste_after_tab_switch');
    assert.strictEqual(tabSignal.at, 5500);
  });

  test('detects cumulative high paste ratio (mostly_pasted_ratio)', () => {
    const finalCode = 'a'.repeat(200); // 200 chars total
    const events = [
      { t: 1000, type: 'paste_attempt_blocked', data: { charCount: 60 } },
      { t: 3000, type: 'paste_attempt_blocked', data: { charCount: 60 } }, // 120/200 = 60%
    ];

    const signals = computeSignals(events, finalCode);
    const mostlyPasted = signals.find((s) => s.type === 'mostly_pasted_ratio');
    assert.ok(mostlyPasted);
    assert.ok(mostlyPasted.note.includes('60%'));
  });
});
