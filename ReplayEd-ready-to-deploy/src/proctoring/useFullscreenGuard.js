import { useEffect, useRef, useCallback } from 'react';

/**
 * useFullscreenGuard Hook
 *
 * Requirements:
 * - Enter fullscreen on test start
 * - Detect fullscreen exit -> emit FULLSCREEN_EXIT
 * - Page Visibility API -> emit TAB_HIDDEN with meta.durationMs when candidate returns
 * - Window blur/focus -> emit WINDOW_BLUR
 */
export function useFullscreenGuard({ isActive = true, onSignal }) {
  const hiddenStartRef = useRef(null);

  const requestFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
      return true;
    } catch (err) {
      console.warn('[useFullscreenGuard] Fullscreen request bypassed:', err.message);
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // 1. Fullscreen change listener
    const handleFullscreenChange = () => {
      const isFullscreen = Boolean(
        document.fullscreenElement || document.webkitFullscreenElement
      );

      if (!isFullscreen && onSignal) {
        onSignal({
          type: 'FULLSCREEN_EXIT',
          text: 'Candidate exited full-screen mode.',
          meta: { timestamp: Date.now() },
        });
      }
    };

    // 2. Visibility change listener (Tab hidden/visible)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenStartRef.current = Date.now();
      } else {
        if (hiddenStartRef.current && onSignal) {
          const durationMs = Date.now() - hiddenStartRef.current;
          onSignal({
            type: 'TAB_HIDDEN',
            text: `Candidate switched tabs or minimized browser (${Math.round(durationMs / 1000)}s).`,
            meta: { durationMs },
          });
        }
        hiddenStartRef.current = null;
      }
    };

    // 3. Window blur listener (Clicking another monitor / external window)
    const handleBlur = () => {
      if (onSignal && !document.hidden) {
        onSignal({
          type: 'WINDOW_BLUR',
          text: 'Window lost focus (clicked outside application).',
          meta: { timestamp: Date.now() },
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActive, onSignal]);

  return {
    requestFullscreen,
    exitFullscreen,
    isFullscreen: Boolean(document.fullscreenElement || document.webkitFullscreenElement),
  };
}
