import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Sparkles, Check } from 'lucide-react';
import { speechSynthesisService, SpeechSynthesisService } from '../../services/voice/speechSynthesisService';
import { VoiceLanguage, VoiceSpeed } from '../../types';
import { SpeakingIndicator } from './SpeakingIndicator';

interface VoicePlayerProps {
  text: string;
  language?: VoiceLanguage;
  autoSpeak?: boolean;
  speed?: VoiceSpeed;
  volume?: number;
  pitch?: number;
  onAutoSpeakToggle?: (enabled: boolean) => void;
  className?: string;
  compact?: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  text,
  language = 'english',
  autoSpeak = true,
  speed,
  volume,
  pitch,
  onAutoSpeakToggle,
  className = '',
  compact = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(-1);
  const [activeSentenceText, setActiveSentenceText] = useState<string>('');
  const [totalSentences, setTotalSentences] = useState<number>(0);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(autoSpeak);

  const synthEngine = speechSynthesisService;
  const isSupported = synthEngine.isSupported();

  useEffect(() => {
    setAutoSpeakEnabled(autoSpeak);
  }, [autoSpeak]);

  useEffect(() => {
    return () => {
      // Clean up speech on unmount if this instance was speaking
      if (isSpeaking) {
        synthEngine.stop();
      }
    };
  }, [isSpeaking]);

  const handlePlay = () => {
    if (!text || !isSupported) return;

    if (isPaused) {
      synthEngine.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    setIsSpeaking(true);
    setIsPaused(false);

    synthEngine.speak(
      text,
      { language, speed, volume, pitch },
      {
        onStart: () => {
          setIsSpeaking(true);
          setIsPaused(false);
        },
        onSentenceStart: (sentenceIndex, sentenceText, total) => {
          setCurrentSentenceIndex(sentenceIndex);
          setActiveSentenceText(sentenceText);
          setTotalSentences(total);
        },
        onPause: () => {
          setIsPaused(true);
          setIsSpeaking(false);
        },
        onResume: () => {
          setIsPaused(false);
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentSentenceIndex(-1);
          setActiveSentenceText('');
        },
        onError: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentSentenceIndex(-1);
        },
      }
    );
  };

  const handlePause = () => {
    synthEngine.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStop = () => {
    synthEngine.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSentenceIndex(-1);
    setActiveSentenceText('');
  };

  const toggleAutoSpeak = () => {
    const nextVal = !autoSpeakEnabled;
    setAutoSpeakEnabled(nextVal);
    if (onAutoSpeakToggle) {
      onAutoSpeakToggle(nextVal);
    }
  };

  if (!isSupported) {
    return null;
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {isSpeaking ? (
          <button
            type="button"
            onClick={handlePause}
            className="p-1.5 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer shadow"
            title="Pause Voice Reply"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        ) : isPaused ? (
          <button
            type="button"
            onClick={handlePlay}
            className="p-1.5 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer shadow animate-pulse"
            title="Resume Voice Reply"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            className="p-1.5 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-blue-800/60 transition-all cursor-pointer"
            title="Listen to AI Reply"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}

        {(isSpeaking || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950 border border-rose-800/60 transition-all cursor-pointer"
            title="Stop Speaking"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-slate-900/90 border border-blue-500/30 rounded-xl p-3 text-white shadow-md backdrop-blur-sm transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-blue-900/60 pb-2 mb-2">
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <SpeakingIndicator isSpeaking={true} isPaused={false} onTogglePause={handlePause} />
          ) : isPaused ? (
            <SpeakingIndicator isSpeaking={false} isPaused={true} onTogglePause={handlePlay} />
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>SARTHI AI Voice Reply</span>
            </div>
          )}
        </div>

        {/* Auto Speak Toggle */}
        <button
          type="button"
          onClick={toggleAutoSpeak}
          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            autoSpeakEnabled
              ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title={autoSpeakEnabled ? 'Auto Speak is ON' : 'Auto Speak is OFF'}
        >
          {autoSpeakEnabled ? <Volume2 className="w-3 h-3 text-amber-400" /> : <VolumeX className="w-3 h-3" />}
          <span>Auto Speak {autoSpeakEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex items-center gap-2">
        {!isSpeaking && !isPaused ? (
          <button
            type="button"
            onClick={handlePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Listen Aloud</span>
          </button>
        ) : isSpeaking ? (
          <button
            type="button"
            onClick={handlePause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/30 hover:bg-amber-500/40 text-amber-300 border border-amber-400/50 font-bold text-xs transition-all cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume</span>
          </button>
        )}

        {(isSpeaking || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-bold text-xs transition-all cursor-pointer"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Sentence Highlight Active Box (Requirement 8) */}
      {(isSpeaking || isPaused) && activeSentenceText && (
        <div className="mt-2.5 pt-2 border-t border-blue-900/80">
          <div className="flex items-center justify-between text-[10px] font-bold text-amber-300/80 mb-1">
            <span>CURRENTLY SPEAKING:</span>
            <span>
              Sentence {currentSentenceIndex + 1} of {totalSentences}
            </span>
          </div>
          <p className="text-xs font-semibold text-amber-200 bg-amber-400/10 border-l-2 border-amber-400 pl-2 py-1 rounded-r-md italic">
            "{activeSentenceText}"
          </p>
        </div>
      )}
    </div>
  );
};
