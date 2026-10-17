import React from 'react';

/**
 * ReplayEd Monochrome Brand Mark
 * Inline SVG without external images. Features a rounded squircle with a precision play/replay glyph.
 */
export default function Logo({
  variant = 'dark', // 'dark' (for light cards) | 'light' (for dark panel)
  size = 'md', // 'sm' | 'md' | 'lg'
  showText = true,
  subtitle = null,
  className = '',
}) {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Monochrome Squircle Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-2xl transition-transform duration-200 hover:scale-105 ${
          isLight
            ? 'bg-zinc-900 border border-zinc-700/80 shadow-inner'
            : 'bg-zinc-900 border border-zinc-900 shadow-sm'
        }`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
        >
          {/* Replay circular arc with forward play arrow */}
          <path
            d="M14 5.25C9.16751 5.25 5.25 9.16751 5.25 14C5.25 18.8325 9.16751 22.75 14 22.75C17.6521 22.75 20.7684 20.5135 22.0628 17.325"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Replay return arrowhead */}
          <path
            d="M11.5 5.25H14.5V2.25"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Play triangle inside center */}
          <polygon
            points="12,10.5 18,14 12,17.5"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`${titleSizes[size]} font-bold tracking-tight ${
                isLight ? 'text-white' : 'text-zinc-950'
              }`}
            >
              ReplayEd
            </span>
          </div>

          {subtitle && (
            <span
              className={`text-[11px] font-medium tracking-wide uppercase ${
                isLight ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
