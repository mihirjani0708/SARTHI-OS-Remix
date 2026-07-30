import React, { useState } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import { voiceRecognitionService, VoiceState } from '../../services/voice/VoiceRecognitionService';
import { voiceSynthesisService } from '../../services/voice/VoiceSynthesisService';
import { voicePermissionService } from '../../services/voice/VoicePermissionService';
import { ListeningAnimation } from './ListeningAnimation';

interface VoiceButtonProps {
  onStateChange?: (state: VoiceState) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onStateChange,
  disabled = false,
  className = '',
}) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check support on interaction only (or passive check without prompting user)
  const isBrowserSupported =
    voiceRecognitionService.isSupported() || voiceSynthesisService.isSupported();

  const handleMicTap = async () => {
    if (disabled) return;

    // Requirement 5: Check browser support
    if (!isBrowserSupported) {
      const unsuppState: VoiceState = 'unsupported';
      setState(unsuppState);
      setErrorMessage('Voice Assistant is not supported on this device.');
      onStateChange?.(unsuppState);
      return;
    }

    // Toggle listening state
    if (state === 'listening') {
      const idleState: VoiceState = 'idle';
      setState(idleState);
      setErrorMessage(null);
      onStateChange?.(idleState);
      return;
    }

    // Requirement 6 & 7: Ask microphone permission ONLY when user taps the microphone!
    setErrorMessage(null);
    setState('processing');
    onStateChange?.('processing');

    const permResult = await voicePermissionService.requestMicrophonePermission();

    if (!permResult.granted) {
      const errState: VoiceState = 'error';
      setState(errState);
      setErrorMessage(permResult.error || 'Voice Assistant is not supported on this device.');
      onStateChange?.(errState);
      return;
    }

    // Foundation listening simulation state (Without connecting STT or AI Chat yet as required by Sprint 7.1)
    const listeningState: VoiceState = 'listening';
    setState(listeningState);
    onStateChange?.(listeningState);
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleMicTap}
        disabled={disabled}
        aria-label={state === 'listening' ? 'Stop Voice Recording' : 'Start Voice Assistant'}
        title={
          !isBrowserSupported
            ? 'Voice Assistant is not supported on this device.'
            : state === 'listening'
            ? 'Tap to stop listening'
            : 'Tap to speak with SARTHI Voice Assistant'
        }
        className={`relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border shadow-md touch-manipulation focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
          state === 'listening'
            ? 'bg-blue-600 text-white border-amber-400 shadow-amber-400/20 scale-105'
            : state === 'processing'
            ? 'bg-blue-900 text-blue-200 border-blue-500'
            : state === 'unsupported' || state === 'error'
            ? 'bg-rose-950/80 text-rose-300 border-rose-800'
            : 'bg-blue-950 hover:bg-blue-900 text-white border-blue-800 hover:border-amber-400/80'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {/* Outer Pulsing Ring when active listening */}
        {state === 'listening' && (
          <span className="absolute inset-0 rounded-xl bg-amber-400/30 animate-ping pointer-events-none" />
        )}

        {state === 'processing' ? (
          <Loader2 className="w-5 h-5 animate-spin text-blue-300" />
        ) : state === 'listening' ? (
          <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
        ) : state === 'error' || state === 'unsupported' ? (
          <AlertCircle className="w-5 h-5 text-rose-400" />
        ) : (
          <Mic className="w-5 h-5 text-amber-300" />
        )}
      </button>

      {/* Listening Waveform Indicator */}
      {state === 'listening' && <ListeningAnimation state="listening" />}

      {/* Unsupported Error Tooltip Banner */}
      {(state === 'unsupported' || errorMessage) && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-64 bg-slate-900 border border-rose-500/80 text-rose-200 text-[11px] font-bold p-2.5 rounded-xl shadow-2xl animate-fadeIn text-center">
          <span>{errorMessage || 'Voice Assistant is not supported on this device.'}</span>
        </div>
      )}
    </div>
  );
};
