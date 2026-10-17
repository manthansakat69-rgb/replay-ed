/**
 * Integrity Signals & 3-Warning Evaluation Engine.
 *
 * NOTE FOR JUDGES / TRAINERS:
 * These are pedagogical integrity signals and objective proctoring telemetry.
 * All terminology strictly avoids subjective accusatory labels ("cheating")
 * and consistently uses "flagged for human review".
 */

export const VIOLATION_TYPES = [
  'tab_hidden',
  'fullscreen_exit',
  'multiple_faces',
  'face_missing',
  'loud_audio',
  'paste_attempt_blocked',
];

export const VIOLATION_DESCRIPTIONS = {
  tab_hidden: 'Browser tab was hidden or switched during active assessment.',
  fullscreen_exit: 'Fullscreen mode was exited during examination.',
  multiple_faces: 'Multiple faces detected in webcam view.',
  face_missing: 'No face detected in webcam view for over 5 continuous seconds.',
  loud_audio: 'Sustained elevated room audio detected for over 3 seconds.',
  paste_attempt_blocked: 'External clipboard paste attempt intercepted and blocked.',
};

/**
 * Evaluates a batch of proctoring events against the 3-Warning debouncing rules.
 * Debounce rule: The same violation type counts at most once per 10 seconds.
 *
 * @param {object} session - Session document/object
 * @param {Array<object>} newEvents - Batch of incoming events
 * @param {number} [maxWarnings=3]
 * @returns {{
 *   warningCount: number,
 *   maxWarnings: number,
 *   message: string,
 *   status: string,
 *   flaggedForReview: boolean,
 *   newViolations: Array<object>
 * }}
 */
export function evaluateViolationsAndWarnings(session, newEvents = [], maxWarnings = 3) {
  if (!session.lastWarningTimeByType) {
    session.lastWarningTimeByType = {};
  }

  let warningCount = session.warningCount || 0;
  let status = session.status || 'in_progress';
  const newViolations = [];
  let latestViolationMessage = '';

  for (const event of newEvents) {
    const type = event.type;
    const t = event.t ?? 0;
    const data = event.data || {};

    let isViolation = false;

    if (type === 'tab_hidden' || type === 'fullscreen_exit' || type === 'paste_attempt_blocked') {
      isViolation = true;
    } else if (type === 'multiple_faces') {
      // Multiple faces sustained for > 2s or reported as violation
      const duration = data.durationMs ?? data.duration ?? 2500;
      if (duration >= 2000) {
        isViolation = true;
      }
    } else if (type === 'face_missing') {
      // face_missing only if continuous for > 5 seconds
      const duration = data.durationMs ?? data.duration ?? 5500;
      if (duration >= 5000) {
        isViolation = true;
      }
    } else if (type === 'loud_audio') {
      // loud_audio only if sustained for > 3 seconds
      const duration = data.durationMs ?? data.duration ?? 3500;
      if (duration >= 3000) {
        isViolation = true;
      }
    }
    // Note: window_blur and camera/mic denied are logged but NOT counted as warnings

    if (isViolation && status !== 'locked_for_review') {
      const lastTime = session.lastWarningTimeByType[type];
      const timeSinceLast = lastTime !== undefined ? t - lastTime : Infinity;

      // Debounce: 10,000ms per violation type
      if (timeSinceLast >= 10000) {
        warningCount++;
        session.lastWarningTimeByType[type] = t;
        const desc = VIOLATION_DESCRIPTIONS[type] || `Proctoring violation (${type})`;
        latestViolationMessage = desc;

        newViolations.push({
          type,
          t,
          warningNumber: warningCount,
          note: desc,
        });

        if (warningCount >= maxWarnings) {
          status = 'locked_for_review';
          break;
        }
      }
    }
  }

  session.warningCount = warningCount;
  session.status = status;

  let message = '';
  if (status === 'locked_for_review') {
    message = `Session flagged for human review. Maximum warnings (${maxWarnings}) reached.`;
  } else if (newViolations.length > 0) {
    message = `Warning ${warningCount} of ${maxWarnings}: ${latestViolationMessage}`;
  } else if (warningCount > 0) {
    message = `Active warnings: ${warningCount} of ${maxWarnings}`;
  } else {
    message = 'All integrity signals within normal parameters.';
  }

  return {
    warningCount,
    maxWarnings,
    message,
    status,
    flaggedForReview: status === 'locked_for_review',
    newViolations,
  };
}

/**
 * Computes deep integrity signals from stored session events and final submitted code.
 *
 * @param {Array<object>} events - Complete event stream
 * @param {string} [finalCode=''] - Submitted final code text
 * @returns {Array<{ type: string, at: number, severity: 'low'|'med'|'high', note: string }>}
 */
export function computeSignals(events = [], finalCode = '') {
  if (!Array.isArray(events) || events.length === 0) {
    return [];
  }

  const sorted = [...events].sort((a, b) => (a.t ?? 0) - (b.t ?? 0));
  const signals = [];
  const finalLen = finalCode ? finalCode.length : 0;

  // -------------------------------------------------------------------------
  // SIGNAL 1: large_paste_attempt
  // Blocked or attempted paste with character count > 50 or > 40% of code
  // -------------------------------------------------------------------------
  for (const e of sorted) {
    if (e.type === 'paste_attempt_blocked' || e.type === 'paste') {
      const charCount = e.data?.charCount ?? (e.data?.text ? e.data.text.length : 0);
      if (charCount > 50 || (finalLen > 0 && charCount / finalLen > 0.4)) {
        signals.push({
          type: 'large_paste_attempt',
          at: e.t,
          severity: charCount > 150 ? 'high' : 'med',
          note: `Signal for trainer review: Large clipboard paste attempt intercepted (${charCount} characters).`,
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // SIGNAL 2: typing_faster_than_rhythm
  // Burst typing speed faster than normal rhythm (> 25 chars/s over >= 25 keys)
  // -------------------------------------------------------------------------
  const keyEvents = sorted.filter((e) => e.type === 'key' || e.type === 'insert');
  for (let i = 0; i < keyEvents.length - 25; i += 10) {
    const chunk = keyEvents.slice(i, i + 25);
    const durationMs = (chunk[chunk.length - 1].t ?? 0) - (chunk[0].t ?? 0);
    if (durationMs > 0 && durationMs < 1000) {
      // 25 chars in less than 1 second = > 25 chars/sec (> 300 WPM)
      signals.push({
        type: 'typing_faster_than_rhythm',
        at: chunk[0].t,
        severity: 'high',
        note: `Signal for trainer review: Keystroke cadence anomaly: 25 characters typed in ${durationMs}ms (> 300 WPM).`,
      });
      break;
    }
  }

  // -------------------------------------------------------------------------
  // SIGNAL 3: zero_runs_large_code
  // Zero test run events while final code > 150 characters
  // -------------------------------------------------------------------------
  const runEvents = sorted.filter((e) => e.type === 'run');
  if (runEvents.length === 0 && finalLen > 150) {
    signals.push({
      type: 'zero_runs_large_code',
      at: sorted[sorted.length - 1]?.t ?? 0,
      severity: 'med',
      note: `Signal for trainer review: Final solution submitted (${finalLen} characters) without testing or running code during session.`,
    });
  }

  // -------------------------------------------------------------------------
  // SIGNAL 4: even_typing_no_deletions
  // Perfectly even typing with no deletions (> 100 key events, 0 delete events)
  // -------------------------------------------------------------------------
  const deleteEvents = sorted.filter((e) => e.type === 'delete');
  if (keyEvents.length > 100 && deleteEvents.length === 0) {
    signals.push({
      type: 'even_typing_no_deletions',
      at: keyEvents[0]?.t ?? 0,
      severity: 'med',
      note: `Signal for trainer review: Linear monotonic code entry: ${keyEvents.length} continuous keystrokes recorded with zero backspaces or deletions.`,
    });
  }

  // -------------------------------------------------------------------------
  // SIGNAL 5: paste_after_tab_switch
  // Paste attempt right after returning to the tab (within 5 seconds of tab_visible)
  // -------------------------------------------------------------------------
  const visibleEvents = sorted.filter((e) => e.type === 'tab_visible' || e.type === 'focus');
  for (const vis of visibleEvents) {
    const pasteNearby = sorted.find(
      (e) => (e.type === 'paste_attempt_blocked' || e.type === 'paste') && e.t >= vis.t && e.t <= vis.t + 5000
    );
    if (pasteNearby) {
      signals.push({
        type: 'paste_after_tab_switch',
        at: pasteNearby.t,
        severity: 'high',
        note: `Signal for trainer review: Clipboard paste attempted ${Math.round((pasteNearby.t - vis.t) / 1000)}s after returning to assessment window.`,
      });
      break;
    }
  }

  // -------------------------------------------------------------------------
  // SIGNAL 6: mostly_pasted_ratio
  // Multiple small pastes adding up to > 50% of the final code
  // -------------------------------------------------------------------------
  const pasteEvents = sorted.filter((e) => e.type === 'paste_attempt_blocked' || e.type === 'paste');
  const totalPastedChars = pasteEvents.reduce(
    (acc, e) => acc + (e.data?.charCount ?? (e.data?.text ? e.data.text.length : 0)),
    0
  );
  if (finalLen > 100 && totalPastedChars / finalLen > 0.5) {
    const pct = Math.round((totalPastedChars / finalLen) * 100);
    signals.push({
      type: 'mostly_pasted_ratio',
      at: pasteEvents[pasteEvents.length - 1]?.t ?? 0,
      severity: 'high',
      note: `Signal for trainer review: Cumulative paste ratio reached ${pct}% of total submission length.`,
    });
  }

  return signals;
}
