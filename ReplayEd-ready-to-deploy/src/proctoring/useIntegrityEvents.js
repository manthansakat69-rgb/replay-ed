import { useRef, useCallback, useEffect } from 'react';
import { sendEvents } from '../services/api';

/**
 * useIntegrityEvents Hook
 *
 * Requirements:
 * - Buffers proctoring signals { t, type, text, meta }
 * - Debounces identical signals so one real situation produces ONE event
 * - Flushes batch to POST /api/events every 5 seconds
 * - Flushes immediately on test submit
 * - Types: FACE_ABSENT, MULTIPLE_FACES, LOOK_AWAY, LOOK_AWAY_REPEATED,
 *   CAMERA_BLOCKED, PASTE, COPY_ATTEMPT, TAB_HIDDEN, WINDOW_BLUR, FULLSCREEN_EXIT
 */
export function useIntegrityEvents({ sessionId, attemptId, isActive = true }) {
  const bufferRef = useRef([]);
  const startTimeRef = useRef(Date.now());
  const lastEventByTypeRef = useRef({});
  const flushTimerRef = useRef(null);

  // Debounce thresholds by event type (in ms)
  const DEBOUNCE_MS = {
    LOOK_AWAY: 10000,
    LOOK_AWAY_REPEATED: 30000,
    FACE_ABSENT: 8000,
    MULTIPLE_FACES: 8000,
    CAMERA_BLOCKED: 15000,
    TAB_HIDDEN: 5000,
    WINDOW_BLUR: 5000,
    FULLSCREEN_EXIT: 5000,
    PASTE: 2000,
    COPY_ATTEMPT: 2000,
  };

  /**
   * Pushes a signal into the queue with debounce protection
   */
  const logSignal = useCallback((type, text = '', meta = {}) => {
    const now = Date.now();
    const lastTime = lastEventByTypeRef.current[type] || 0;
    const minInterval = DEBOUNCE_MS[type] || 5000;

    if (now - lastTime < minInterval) {
      return false; // Debounced
    }

    lastEventByTypeRef.current[type] = now;
    const t = Math.max(0, now - startTimeRef.current);

    bufferRef.current.push({
      t,
      type,
      text,
      meta,
    });

    return true;
  }, []);

  /**
   * Flushes current buffer to backend
   */
  const flushEvents = useCallback(async () => {
    if (bufferRef.current.length === 0) return;

    const eventsToSend = [...bufferRef.current];
    bufferRef.current = [];

    const sid = sessionId || attemptId || 'active_session';
    try {
      await sendEvents(sid, eventsToSend);
    } catch (err) {
      // Re-queue events on network failure
      bufferRef.current = [...eventsToSend, ...bufferRef.current];
      console.warn('[useIntegrityEvents] Flush failed, queued for retry:', err.message);
    }
  }, [sessionId, attemptId]);

  // Periodic flush every 5 seconds
  useEffect(() => {
    if (!isActive) return;

    flushTimerRef.current = setInterval(() => {
      flushEvents();
    }, 5000);

    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      flushEvents(); // Flush on unmount
    };
  }, [isActive, flushEvents]);

  return {
    logSignal,
    flushEvents,
    getBufferedEvents: () => bufferRef.current,
  };
}
