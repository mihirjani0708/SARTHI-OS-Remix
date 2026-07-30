import React from 'react';
import { Mic, X, Radio, CheckCircle2, Sparkles } from 'lucide-react';

interface LiveTranscriptProps {
  transcript: string;
  isListening: boolean;
  isFinal: boolean;
  languageCode?: string;
  onClear?: () => void;
  className?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  transcript,
  isListening,
  isFinal,
  languageCode = 'en-IN',
  onClear,
  className = '',
}) => {
  if (!transcript && !isListening) return null;

  const getLanguageLabel = (code: string) => {
    if (code.includes('hi')) return 'Hindi (hi-IN)';
    if (code.includes('gu')) return 'Gujarati (gu-IN)';
    return 'English (en-IN)';
  };

  return (
    <div
      className={`relative w-full bg-slate-900/95 border border-blue-500/40 rounded-2xl p-3 sm:p-4 text-white shadow-xl backdrop-blur-md transition-all duration-300 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-blue-800/60 pb-2 mb-2">
        <div className="flex items-center gap-2">
          {isListening ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Live Speech Input</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recognized Speech</span>
            </span>
          )}

          {/* Language Badge */}
          <span className="text-[10px] font-extrabold bg-blue-950 text-blue-200 border border-blue-700/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {getLanguageLabel(languageCode)}
          </span>
        </div>

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Clear transcript"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live Transcript Content Area */}
      <div className="min-h-[2.5rem] flex items-center">
        {transcript ? (
          <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed break-words">
            "{transcript}"
            {isListening && (
              <span className="inline-block w-1.5 h-4 ml-1.5 bg-amber-400 animate-pulse rounded-full align-middle" />
            )}
          </p>
        ) : isListening ? (
          <p className="text-xs text-amber-300/80 italic flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Listening... Speak now into your microphone.</span>
          </p>
        ) : null}
      </div>
    </div>
  );
};
