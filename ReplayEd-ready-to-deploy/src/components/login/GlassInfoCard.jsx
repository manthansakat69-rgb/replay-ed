import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlassInfoCard Component
 * Compact frosted glass card overlay for the bottom-left of the left panel.
 * Strictly adheres to the monochrome palette, with an optional tiny green status dot.
 */
export default function GlassInfoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-[440px] rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.07] p-5 sm:p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.09]"
    >
      {/* Status Pill Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 mb-2.5 shadow-sm backdrop-blur-md">
        {/* Tiny green status dot (allowed accent) */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="text-[11px] font-medium tracking-wide text-zinc-300">
          Session Replay Enabled
        </span>
      </div>

      {/* Main Heading */}
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white leading-snug">
        Learn at your pace. Prove it with every line.
      </h2>

      {/* Descriptive Paragraph */}
      <p className="mt-1.5 text-xs text-zinc-300/80 leading-relaxed font-normal">
        Adaptive question paths, a secure code sandbox, and typing replay that gives trainers
        evidence, not guesses.
      </p>

      {/* Subtle Divider */}
      <div className="my-3.5 h-[1px] w-full bg-white/10" />

      {/* Social / Stakeholder Avatars */}
      <div className="flex items-center gap-2.5">
        <div className="flex -space-x-2">
          <div
            title="Students"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-[9px] font-bold tracking-tight text-white shadow-sm ring-1 ring-white/10"
          >
            ST
          </div>
          <div
            title="Trainers"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[9px] font-bold tracking-tight text-zinc-200 shadow-sm ring-1 ring-white/10"
          >
            TR
          </div>
          <div
            title="Admins"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-600 bg-zinc-700 text-[9px] font-bold tracking-tight text-zinc-100 shadow-sm ring-1 ring-white/10"
          >
            AD
          </div>
        </div>

        <span className="text-[11px] font-medium text-zinc-400">
          Used by students, trainers and admins
        </span>
      </div>
    </motion.div>
  );
}
