import { useEffect, useCallback } from 'react';

/**
 * usePasteCopyGuard Hook
 *
 * Requirements:
 * - Listens for clipboard copy, cut, and paste events
 * - Emits:
 *     - PASTE: meta { length, isLarge: length > 80 }
 *     - COPY_ATTEMPT: meta { action: 'copy' | 'cut', target: 'editor' | 'question' }
 * - Do NOT block with interrupting alerts. Allow typing/editing to continue smoothly.
 * - Right-click and selection blocked on designated question text container via CSS/listener.
 */
export function usePasteCopyGuard({ isActive = true, onSignal, questionRef = null }) {
  const handlePaste = useCallback(
    (e) => {
      if (!isActive) return;

      const clipboardData = e.clipboardData || window.clipboardData;
      const text = clipboardData ? clipboardData.getData('text') : '';
      const len = text ? text.length : 0;

      if (onSignal) {
        onSignal({
          type: 'PASTE',
          text: `Clipboard paste detected (${len} characters).`,
          meta: {
            length: len,
            isLarge: len > 80,
          },
        });
      }
    },
    [isActive, onSignal]
  );

  const handleCopyOrCut = useCallback(
    (e) => {
      if (!isActive) return;

      const isInsideQuestion =
        questionRef && questionRef.current && questionRef.current.contains(e.target);
      const actionType = e.type === 'cut' ? 'cut' : 'copy';

      if (onSignal) {
        onSignal({
          type: 'COPY_ATTEMPT',
          text: `Clipboard ${actionType} detected from ${isInsideQuestion ? 'question prompt' : 'editor'}.`,
          meta: {
            action: actionType,
            target: isInsideQuestion ? 'question' : 'editor',
          },
        });
      }
    },
    [isActive, onSignal, questionRef]
  );

  useEffect(() => {
    if (!isActive) return;

    window.addEventListener('paste', handlePaste, true);
    window.addEventListener('copy', handleCopyOrCut, true);
    window.addEventListener('cut', handleCopyOrCut, true);

    return () => {
      window.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('copy', handleCopyOrCut, true);
      window.removeEventListener('cut', handleCopyOrCut, true);
    };
  }, [isActive, handlePaste, handleCopyOrCut]);
}
