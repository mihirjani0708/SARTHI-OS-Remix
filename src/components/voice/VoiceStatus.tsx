import React from 'react';
import { Mic, Radio, AlertCircle, Loader2 } from 'lucide-react';
import { VoiceState } from '../../services/voice/VoiceRecognitionService';

interface VoiceStatusProps {
  state: VoiceState;
  errorMessage?: string | null;
  className?: string;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({ state, errorMessage, className = '' }) => {
  if (state === 'idle') return null;

  if (state === 'unsupported') {
    return (
      <div className={`flex items-center gap-2 text-xs font-semibold text-rose-300 bg-rose-950/80 border border-rose-800/80 px-3 py-1.5 rounded-xl ${className}`}>
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        <span>Voice Assistant is not supported on this device.</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={`flex items-center gap-2 text-xs font-semibold text-amber-200 bg-amber-950/80 border border-amber-800/80 px-3 py-1.5 rounded-xl ${className}`}>
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{errorMessage || "I couldn't understand. Please try again."}</span>
      </div>
    );
  }

  if (state === 'listening') {
    return (
      <div className={`flex items-center gap-2 text-xs font-extrabold text-amber-300 bg-blue-950/90 border border-amber-400/50 px-3 py-1.5 rounded-xl shadow-lg ${className}`}>
        <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
        <span>Listening... Speak now</span>
      </div>
    );
  }

  if (state === 'processing') {
    return (
      <div className={`flex items-center gap-2 text-xs font-bold text-blue-200 bg-blue-950/90 border border-blue-600/50 px-3 py-1.5 rounded-xl ${className}`}>
        <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
        <span>Processing voice input...</span>
      </div>
    );
  }

  return null;
};
