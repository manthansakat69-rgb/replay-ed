import React from 'react';
import { Camera, Shield } from 'lucide-react';

/**
 * ProctorBanner Component
 *
 * Requirements:
 * - Thin top bar during active test: "Camera on · Session recorded for trainer review"
 * - Strict black / white / grey theme with tiny pulsing status dot
 */
export default function ProctorBanner({ isCameraActive = true, className = '' }) {
  return (
    <div
      className={`w-full bg-zinc-950/90 border-b border-zinc-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-zinc-300 font-mono select-none ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {isCameraActive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isCameraActive ? 'bg-emerald-400' : 'bg-zinc-600'
            }`}
          />
        </span>
        <span className="text-[11px] font-sans text-zinc-200">
          Camera on · Session recorded for trainer review
        </span>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
        <Shield className="w-3 h-3 text-zinc-400" />
        <span>On-Device Verification</span>
      </div>
    </div>
  );
}
