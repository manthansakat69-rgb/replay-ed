import React, { useEffect, useRef } from 'react';

/**
 * CameraPreview Component
 *
 * Requirements:
 * - Small mirrored live preview (default 160x120, mirrored via scale-x-[-1])
 * - Shows status dot (green when active, amber when initializing, red when off)
 * - Strict black / white / grey theme, no extraneous colors
 */
export default function CameraPreview({
  stream,
  className = '',
  width = 160,
  height = 120,
  label = 'Camera active',
  status = 'active', // 'active' | 'warning' | 'offline'
  mirrored = true,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const dotColor =
    status === 'active'
      ? 'bg-emerald-400'
      : status === 'warning'
      ? 'bg-amber-400'
      : 'bg-rose-500';

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`relative rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-md flex items-center justify-center select-none ${className}`}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="text-[10px] text-zinc-500 font-mono text-center px-2">
          No camera stream
        </div>
      )}

      {/* Tiny Status Indicator Overlay */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-zinc-800/80">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${status === 'active' ? 'animate-pulse' : ''}`} />
        <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
}
