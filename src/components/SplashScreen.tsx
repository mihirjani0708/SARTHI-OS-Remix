import React, { useEffect, useState } from 'react';
import { SarthiLogo } from './SarthiLogo';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 2400,
}) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [stage, setStage] = useState(0); // 0: init, 1: logo/star, 2: name, 3: tagline

  useEffect(() => {
    // Staged sequence for 60fps cinematic feel
    const t1 = setTimeout(() => setStage(1), 100);  // Golden star sparkle + logo scale
    const t2 = setTimeout(() => setStage(2), 380);  // Fade in name
    const t3 = setTimeout(() => setStage(3), 680);  // Fade in tagline & footer

    const fadeOutDuration = 450;
    const fadeStartMs = Math.max(1600, durationMs - fadeOutDuration);

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, fadeStartMs);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0B132B] text-white flex flex-col items-center justify-between p-8 transition-all duration-500 ease-out select-none overflow-hidden ${
        fadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top subtle brand badge */}
      <div
        className={`pt-6 flex items-center gap-2 text-[11px] font-bold text-blue-300/80 tracking-widest uppercase transition-all duration-500 ${
          stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#F5B50A] shadow-md shadow-amber-400 animate-pulse" />
        <span>Executive Life & Business OS</span>
      </div>

      {/* Center Hero: Golden Star Sparkle, Logo Scale, Glow, Name & Tagline */}
      <div className="my-auto flex flex-col items-center text-center relative z-10">
        {/* Soft Ambient Radial Glow */}
        <div
          className={`absolute -inset-12 bg-gradient-to-tr from-blue-600/25 via-amber-500/20 to-indigo-600/25 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
            stage >= 1 ? 'opacity-100 animate-pulse' : 'opacity-0'
          }`}
        />

        {/* Logo Emblem + Golden Star Sparkle */}
        <div
          className={`transform transition-all duration-700 ease-out ${
            stage >= 1 ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-3'
          }`}
        >
          <div className="relative group mb-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-indigo-600 p-1 shadow-2xl ring-4 ring-[#F5B50A]/40 flex items-center justify-center relative overflow-hidden transition-transform duration-1000 hover:scale-105">
              {/* Soft Glow overlay */}
              <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse pointer-events-none" />

              <div className="w-full h-full rounded-[22px] bg-[#0D1B2A] flex items-center justify-center relative overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,181,10,0.35),transparent_70%)]" />
                <svg viewBox="0 0 100 100" className="w-22 h-22 sm:w-24 sm:h-24 drop-shadow-2xl z-10" fill="none">
                  {/* Outer Shield frame */}
                  <path
                    d="M50 10 L84 25 V52 C84 72 68 86 50 92 C32 86 16 72 16 52 V25 L50 10 Z"
                    stroke="#F5B50A"
                    strokeWidth="3.5"
                    fill="#1E3A8A"
                    fillOpacity="0.6"
                  />
                  {/* Monogram S */}
                  <path
                    d="M62 33 C62 27 54 25 48 27 C40 30 38 39 46 43 C56 48 64 52 62 63 C60 73 46 75 38 71 C32 68 30 62 30 62"
                    stroke="url(#splashGradFullSeq)"
                    strokeWidth="11.5"
                    strokeLinecap="round"
                  />
                  {/* Golden star sparkle with glow */}
                  <path
                    d="M50 16 L54 28 L66 32 L54 36 L50 48 L46 36 L34 32 L46 28 Z"
                    fill="#F5B50A"
                    className="animate-pulse"
                  />
                  <circle cx="50" cy="32" r="4" fill="#FFFFFF" />
                  <defs>
                    <linearGradient id="splashGradFullSeq" x1="0" y1="0" x2="100" y2="100">
                      <stop stopColor="#FFFFFF" />
                      <stop offset="0.7" stopColor="#93C5FD" />
                      <stop offset="1" stopColor="#F5B50A" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Fade-in Application Name: SARTHI */}
        <h1
          className={`text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2 transition-all duration-600 ease-out ${
            stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <span>SARTHI</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#F5B50A] inline-block shadow-md shadow-amber-400" />
        </h1>

        {/* Fade-in Tagline: Life & Business OS */}
        <p
          className={`text-xs sm:text-sm font-semibold text-blue-200/90 mt-2 tracking-wide max-w-xs sm:max-w-sm transition-all duration-600 ease-out ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          Your Personal Life & Business Operating System
        </p>
      </div>

      {/* Footer Version Info */}
      <div
        className={`pb-8 flex flex-col items-center gap-1.5 w-full max-w-xs text-center transition-all duration-600 ${
          stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400/90 tracking-wider">
          <span className="text-[#F5B50A]">v3.3 Final</span>
          <span>•</span>
          <span className="text-blue-300">Executive Engine</span>
        </div>
      </div>
    </div>
  );
};
