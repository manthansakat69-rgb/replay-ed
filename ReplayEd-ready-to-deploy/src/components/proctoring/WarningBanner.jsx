import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function WarningBanner({ warningCount = 0, maxWarnings = 3, message = '' }) {
  if (warningCount <= 0 && !message) return null;

  const isCritical = warningCount >= maxWarnings;

  return (
    <div
      role="alert"
      className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium border shadow-md transition-all ${
        isCritical
          ? 'bg-red-950/90 border-red-600 text-red-200'
          : 'bg-amber-950/90 border-amber-600/80 text-amber-200'
      }`}
      style={{
        backgroundColor: isCritical ? 'var(--warning-bg)' : undefined,
        borderColor: isCritical ? 'var(--warning-border)' : undefined,
        color: isCritical ? 'var(--warning-text)' : undefined,
      }}
    >
      <div className="flex items-center gap-2.5">
        {isCritical ? (
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        )}
        <div className="leading-snug">
          <span className="font-extrabold uppercase tracking-wide mr-1.5">
            {isCritical
              ? 'Flagged for Human Review'
              : `Warning ${warningCount} of ${maxWarnings}:`}
          </span>
          <span>{message || 'Integrity anomaly detected and recorded.'}</span>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
        <span>{warningCount}</span>
        <span className="opacity-60">/</span>
        <span>{maxWarnings}</span>
      </div>
    </div>
  );
}
