import React from 'react';

interface SarthiLogoProps {
  variant?: 'full' | 'header' | 'icon-only' | 'splash' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  darkBg?: boolean;
  className?: string;
  showTagline?: boolean;
}

export const SarthiLogo: React.FC<SarthiLogoProps> = ({
  variant = 'header',
  size = 'md',
  darkBg = false,
  className = '',
  showTagline = true,
}) => {
  // ~12% Increased size map for logo emblem
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 sm:w-11 sm:h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 text-2xl',
  }[size];

  // Razor sharp vector Emblem component
  const Emblem = (
    <div
      className={`relative rounded-2xl bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/30 ring-2 ring-white/40 shrink-0 overflow-hidden ${sizeClasses}`}
    >
      {/* Subtle radial golden glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,181,10,0.4),transparent_65%)]" />

      {/* SVG Emblem Motif: Golden Compass Star + S Monogram Shield */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1.5 drop-shadow-md relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Shield frame */}
        <path
          d="M50 10 L84 25 V52 C84 72 68 86 50 92 C32 86 16 72 16 52 V25 L50 10 Z"
          stroke="#F5B50A"
          strokeWidth="3"
          strokeOpacity="0.5"
          fill="none"
        />

        {/* Dynamic Monogram 'S' */}
        <path
          d="M62 33 C62 27 54 25 48 27 C40 30 38 39 46 43 C56 48 64 52 62 63 C60 73 46 75 38 71 C32 68 30 62 30 62"
          stroke="url(#sarthiGradMain)"
          strokeWidth="10.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Executive Golden Star Compass */}
        <path
          d="M50 16 L54 28 L66 32 L54 36 L50 48 L46 36 L34 32 L46 28 Z"
          fill="#F5B50A"
        />
        <circle cx="50" cy="32" r="3.5" fill="#FFFFFF" />

        <defs>
          <linearGradient id="sarthiGradMain" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.65" stopColor="#E0F2FE" />
            <stop offset="1" stopColor="#F5B50A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return Emblem;
  }

  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Animated Emblem with Golden Sparkle & Soft Glow */}
        <div className="relative mb-6 group">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-indigo-600 p-1 shadow-2xl ring-4 ring-[#F5B50A]/50 flex items-center justify-center relative overflow-hidden transition-all duration-700">
            {/* Ambient Pulse Background */}
            <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse pointer-events-none" />

            <div className="w-full h-full rounded-[22px] bg-[#0D1B2A] flex items-center justify-center relative overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,181,10,0.3),transparent_70%)]" />
              <svg viewBox="0 0 100 100" className="w-22 h-22 sm:w-24 sm:h-24 drop-shadow-2xl z-10" fill="none">
                <path
                  d="M50 10 L84 25 V52 C84 72 68 86 50 92 C32 86 16 72 16 52 V25 L50 10 Z"
                  stroke="#F5B50A"
                  strokeWidth="3.5"
                  fill="#1E3A8A"
                  fillOpacity="0.6"
                />
                <path
                  d="M62 33 C62 27 54 25 48 27 C40 30 38 39 46 43 C56 48 64 52 62 63 C60 73 46 75 38 71 C32 68 30 62 30 62"
                  stroke="url(#splashGradFull)"
                  strokeWidth="11.5"
                  strokeLinecap="round"
                />
                {/* Golden star with shimmer effect */}
                <path
                  d="M50 16 L54 28 L66 32 L54 36 L50 48 L46 36 L34 32 L46 28 Z"
                  fill="#F5B50A"
                  className="animate-pulse"
                />
                <circle cx="50" cy="32" r="4" fill="#FFFFFF" />
                <defs>
                  <linearGradient id="splashGradFull" x1="0" y1="0" x2="100" y2="100">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="0.7" stopColor="#93C5FD" />
                    <stop offset="1" stopColor="#F5B50A" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>SARTHI</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#F5B50A] inline-block shadow-md shadow-amber-400" />
        </h1>

        {showTagline && (
          <p className="text-xs sm:text-sm font-semibold text-blue-200/90 mt-2 tracking-wide max-w-xs sm:max-w-sm">
            Your Personal Life & Business Operating System
          </p>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {Emblem}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                darkBg ? 'text-white' : 'text-[#1E3A8A]'
              }`}
            >
              SARTHI
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F5B50A] shrink-0" />
          </div>
          {showTagline && (
            <p
              className={`text-[11px] sm:text-xs font-semibold truncate mt-1 ${
                darkBg ? 'text-blue-200/90' : 'text-slate-500'
              }`}
            >
              Your Personal Life & Business Operating System
            </p>
          )}
        </div>
      </div>
    );
  }

  // Header / Compact Variant
  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      {Emblem}
      <div className="min-w-0">
        <div className="flex items-center gap-1 leading-none">
          <span
            className={`font-black text-base sm:text-lg tracking-tight ${
              darkBg ? 'text-white' : 'text-[#1E3A8A]'
            }`}
          >
            SARTHI
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5B50A] shrink-0" />
        </div>
        <p
          className={`text-[10px] sm:text-[11px] font-semibold tracking-tight truncate mt-0.5 ${
            darkBg ? 'text-blue-200' : 'text-slate-500'
          }`}
        >
          Life & Business OS
        </p>
      </div>
    </div>
  );
};

