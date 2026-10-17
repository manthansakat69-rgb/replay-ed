import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, ShieldAlert, Users, Minimize2, VideoOff, RefreshCw } from 'lucide-react';

/**
 * WarningToast Component
 *
 * Requirements:
 * - Gentle on-screen warnings for FACE_ABSENT, LOOK_AWAY, MULTIPLE_FACES, FULLSCREEN_EXIT
 * - Max one toast per 30 seconds
 * - Never accuse: "signal", "noticed", "logged for review"
 * - Camera lost overlay with Retry button
 */
export default function WarningToast({
  activeSignal,
  cameraLost = false,
  onRetryCamera,
  onDismiss,
}) {
  const [visibleMessage, setVisibleMessage] = useState(null);

  useEffect(() => {
    if (!activeSignal) return;

    let friendlyText = '';
    let Icon = AlertCircle;

    switch (activeSignal.type) {
      case 'LOOK_AWAY':
      case 'LOOK_AWAY_REPEATED':
        friendlyText = 'We noticed you looked away. This signal is logged for your trainer to review.';
        Icon = Eye;
        break;
      case 'FACE_ABSENT':
        friendlyText = 'We noticed your face was temporarily out of frame. This is logged for review.';
        Icon = ShieldAlert;
        break;
      case 'MULTIPLE_FACES':
        friendlyText = 'We noticed multiple people in the camera frame. This is logged for review.';
        Icon = Users;
        break;
      case 'FULLSCREEN_EXIT':
        friendlyText = 'We noticed you exited full-screen mode. Please return to fullscreen.';
        Icon = Minimize2;
        break;
      case 'PASTE':
        friendlyText = 'External clipboard paste noticed and logged for trainer review.';
        Icon = AlertCircle;
        break;
      default:
        friendlyText = activeSignal.text || 'Telemetry signal logged for trainer review.';
    }

    setVisibleMessage({ text: friendlyText, Icon });

    const timer = setTimeout(() => {
      setVisibleMessage(null);
      if (onDismiss) onDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [activeSignal, onDismiss]);

  return (
    <>
      {/* Toast Notification (Top Center) */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none font-sans">
        <AnimatePresence>
          {visibleMessage && !cameraLost && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-md max-w-md"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white shrink-0">
                <visibleMessage.Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-zinc-200 leading-snug">
                {visibleMessage.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Camera Lost Fullscreen Pause Overlay */}
      {cameraLost && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 font-sans select-none animate-fade-in">
          <div className="max-w-md w-full rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 text-center text-zinc-100 space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-rose-400">
              <VideoOff className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">Camera Feed Lost</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Camera lost. Assessment timer paused. Please re-enable your camera to continue.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onRetryCamera}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-enable Camera to Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
