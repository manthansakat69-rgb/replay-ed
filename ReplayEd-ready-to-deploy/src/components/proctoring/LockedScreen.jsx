import React from 'react';
import { ShieldAlert, FileText, ArrowRight } from 'lucide-react';

export default function LockedScreen({
  isLocked = false,
  onViewResults,
  onExitToDashboard,
  warningCount = 3,
  maxWarnings = 3,
}) {
  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in font-sans">
      <div className="max-w-md w-full rounded-3xl bg-zinc-950 border border-red-900/60 shadow-2xl p-6 sm:p-8 text-center text-zinc-100 space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-950/60 border border-red-700/60 flex items-center justify-center text-red-400 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
            Assessment Status
          </span>
          <h2 className="text-2xl font-extrabold text-white">
            Assessment Locked &amp; Terminated
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The examination threshold of {maxWarnings} integrity warnings ({warningCount}/{maxWarnings}) was reached.
            In accordance with institutional anti-cheating policy, the test session has been terminated,
            and your current code submission was auto-saved for teacher review.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1 text-left font-mono">
          <div className="text-zinc-500 font-sans text-[11px] font-bold uppercase">
            Telemetry Audit Summary
          </div>
          <div>Status: <span className="text-red-400 font-bold">TERMINATED_AND_LOCKED</span></div>
          <div>Warnings Accumulated: <span className="text-amber-400">{warningCount} / {maxWarnings} (Threshold Met)</span></div>
          <div>Action: Session Replay Snapshot Persisted &amp; Flushed to Teacher</div>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={onExitToDashboard}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition shadow-lg"
          >
            <span>Exit to Student Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {onViewResults && (
            <button
              onClick={onViewResults}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 hover:bg-zinc-800 transition"
            >
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>View Submission &amp; Diagnostics</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
