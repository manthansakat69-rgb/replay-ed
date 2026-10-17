import React from 'react';
import { ShieldX } from 'lucide-react';

export default function PasteToast({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/95 border border-amber-600/60 shadow-2xl text-xs text-amber-200 backdrop-blur-md animate-fade-in font-sans"
    >
      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
        <ShieldX className="w-3.5 h-3.5" />
      </div>
      <div>
        <div className="font-bold text-white text-[11px] uppercase tracking-wide">
          Action Blocked
        </div>
        <div className="text-zinc-300">{message}</div>
      </div>
    </div>
  );
}
