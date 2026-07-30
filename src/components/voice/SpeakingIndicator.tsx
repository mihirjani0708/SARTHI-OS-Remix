import React from 'react';
import { Volume2, Sparkles, Pause, Play } from 'lucide-react';

interface SpeakingIndicatorProps {
  isSpeaking: boolean;
  isPaused?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onTogglePause?: () => void;
}

export const SpeakingIndicator: React.FC<SpeakingIndicatorProps> = ({
  isSpeaking,
  isPaused = false,
  label = 'SARTHI Speaking',
  size = 'md',
  className = '',
  onTogglePause,
}) => {
  if (!isSpeaking && !isPaused) return null;

  const barHeight = size === 'sm' ? 'h-3' : size === 'lg' ? 'h-6' : 'h-4';

  return (
    <div
      className={`inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-blue-600/20 to-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full px-3 py-1 shadow-lg backdrop-blur-sm transition-all duration-300 ${className}`}
    >
      {/* Animated Sound Wave Bars */}
      <div className="flex items-center gap-0.5 h-4">
        <span
          className={`w-0.5 ${barHeight} bg-amber-400 rounded-full ${
            !isPaused ? 'animate-bounce' : 'opacity-60'
          }`}
          style={{ animationDelay: '0ms', animationDuration: '600ms' }}
        />
        <span
          className={`w-0.5 ${barHeight} bg-amber-300 rounded-full ${
            !isPaused ? 'animate-bounce' : 'opacity-60'
          }`}
          style={{ animationDelay: '150ms', animationDuration: '600ms' }}
        />
        <span
          className={`w-0.5 ${barHeight} bg-amber-400 rounded-full ${
            !isPaused ? 'animate-bounce' : 'opacity-60'
          }`}
          style={{ animationDelay: '300ms', animationDuration: '600ms' }}
        />
        <span
          className={`w-0.5 ${barHeight} bg-amber-300 rounded-full ${
            !isPaused ? 'animate-bounce' : 'opacity-60'
          }`}
          style={{ animationDelay: '450ms', animationDuration: '600ms' }}
        />
      </div>

      {/* Label */}
      <span className="text-xs font-bold tracking-wide flex items-center gap-1">
        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
        <span>{isPaused ? 'Voice Reply Paused' : label}</span>
      </span>

      {/* Optional Interactive Pause/Resume Button */}
      {onTogglePause && (
        <button
          type="button"
          onClick={onTogglePause}
          className="ml-1 p-0.5 rounded-full hover:bg-amber-400/20 text-amber-300 hover:text-white transition-all cursor-pointer"
          title={isPaused ? 'Resume Voice Reply' : 'Pause Voice Reply'}
        >
          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
};
