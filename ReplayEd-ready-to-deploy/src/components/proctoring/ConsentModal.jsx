import React, { useState } from 'react';
import { ShieldCheck, Camera, Mic, Eye, ClipboardCopy, CheckCircle2 } from 'lucide-react';

export default function ConsentModal({
  isOpen,
  onAgree,
  onAgreeAndStart,
  onCancel,
  examTitle = 'Adaptive Computer Science & Systems Assessment',
}) {
  const [agreed, setAgreed] = useState(false);
  const [requesting, setRequesting] = useState(false);

  if (!isOpen) return null;

  const handleStart = async () => {
    setRequesting(true);
    const fn = onAgreeAndStart || onAgree;
    if (fn) await fn();
    setRequesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="max-w-xl w-full rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 sm:p-8 text-zinc-100 space-y-6">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Proctored Environment Verification
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Assessment Integrity Consent
            </h2>
          </div>
        </div>

        {/* Privacy First Commitment */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Strict Privacy-Preserving Guarantee</span>
          </div>
          No raw video or audio is ever recorded or uploaded to our servers. All facial presence
          verification and acoustic level monitoring execute entirely locally in your browser
          using WebAssembly and Web Audio APIs.
        </div>

        {/* Monitored Signals Description */}
        <div className="space-y-3 text-xs text-zinc-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <Camera className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Camera Presence:</span> Verified locally at
              2-3 fps. Continuous absence (&gt;5s) or multiple faces (&gt;2s) generate review flags.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <Mic className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Room Audio Levels:</span> Sustained loud room
              noise (&gt;3s) is logged as an integrity signal.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <Eye className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Window & Fullscreen:</span> The assessment runs
              in full screen. Leaving fullscreen or switching tabs triggers the 3-warning system.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <ClipboardCopy className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Paste Interception:</span> Clipboard paste
              actions are blocked in the code editor to verify original reasoning.
            </div>
          </div>
        </div>

        {/* Explicit Checkbox Agreement */}
        <label className="flex items-start gap-3 cursor-pointer select-none pt-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
          />
          <span className="text-xs text-zinc-400 leading-normal">
            I understand and consent to local browser proctoring monitoring for{' '}
            <strong className="text-zinc-200">{examTitle}</strong>. If camera/mic permissions are
            denied, I agree that my attempt may proceed in flagged status for human review.
          </span>
        </label>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleStart}
            disabled={!agreed || requesting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg"
          >
            {requesting ? 'Initializing Proctoring...' : 'I Agree & Enter Fullscreen'}
          </button>
        </div>
      </div>
    </div>
  );
}
