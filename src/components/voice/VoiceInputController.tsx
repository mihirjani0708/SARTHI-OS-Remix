import React, { useState, useEffect } from 'react';
import { Mic, AlertCircle, Loader2 } from 'lucide-react';
import { SpeechRecognitionService, speechRecognitionService, RecognitionLanguageCode } from '../../services/voice/speechRecognitionService';
import { speechSynthesisService } from '../../services/voice/speechSynthesisService';
import { voicePermissionService } from '../../services/voice/VoicePermissionService';
import { VoiceLanguage } from '../../types';
import { ListeningAnimation } from './ListeningAnimation';
import { LiveTranscript } from './LiveTranscript';

interface VoiceInputControllerProps {
  onTranscriptChange: (text: string) => void;
  onAutoSubmit?: (text: string) => void;
  preferredLanguage?: VoiceLanguage;
  disabled?: boolean;
  className?: string;
  showTranscriptCard?: boolean;
}

export const VoiceInputController: React.FC<VoiceInputControllerProps> = ({
  onTranscriptChange,
  onAutoSubmit,
  preferredLanguage = 'english',
  disabled = false,
  className = '',
  showTranscriptCard = true,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isFinal, setIsFinal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeLangCode, setActiveLangCode] = useState<RecognitionLanguageCode>('en-IN');

  const recognitionEngine = speechRecognitionService;
  const isSupported = recognitionEngine.isSupported();

  useEffect(() => {
    return () => {
      if (isListening) {
        recognitionEngine.stopListening();
      }
    };
  }, [isListening]);

  const handleMicTap = async () => {
    if (disabled) return;

    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported on this browser or device.');
      return;
    }

    // Toggle off if currently listening
    if (isListening) {
      recognitionEngine.stopListening();
      setIsListening(false);
      return;
    }

    // Requirement 6: Barge-in support. Stop current speech synthesis immediately if user starts speaking.
    speechSynthesisService.stop();

    // Clear previous state and start permission request on gesture
    setErrorMessage(null);
    setIsProcessing(true);

    const permResult = await voicePermissionService.requestMicrophonePermission();
    setIsProcessing(false);

    if (!permResult.granted) {
      setErrorMessage(permResult.error || 'Microphone permission was denied.');
      return;
    }

    // Start speech recognition
    const langCode = recognitionEngine.getLanguageCode(preferredLanguage);
    setActiveLangCode(langCode);
    setTranscript('');
    setIsFinal(false);

    const started = recognitionEngine.startListening(preferredLanguage, {
      onStart: () => {
        setIsListening(true);
        setErrorMessage(null);
      },
      onInterimResult: (interimText) => {
        setTranscript(interimText);
        setIsFinal(false);
        // Requirement 9: Populate input query in real time, do NOT auto-submit!
        onTranscriptChange(interimText);
      },
      onFinalResult: (finalText, detectedLang) => {
        setTranscript(finalText);
        setIsFinal(true);
        setActiveLangCode(detectedLang);
        onTranscriptChange(finalText);
        // Sprint 7.2 Enhancement: Auto-submit message when final transcript is ready
        if (onAutoSubmit && finalText.trim()) {
          onAutoSubmit(finalText.trim());
        }
      },
      onError: (friendlyMsg) => {
        setIsListening(false);
        setErrorMessage(friendlyMsg);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative inline-flex items-center gap-2">
        <button
          type="button"
          onClick={handleMicTap}
          disabled={disabled}
          aria-label={isListening ? 'Stop Voice Recording' : 'Start Voice Assistant'}
          title={
            !isSupported
              ? 'Speech recognition is not supported on this browser or device.'
              : isListening
              ? 'Tap to stop recording speech'
              : 'Tap to speak with SARTHI Voice Assistant'
          }
          className={`relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border shadow-md touch-manipulation focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
            isListening
              ? 'bg-blue-600 text-white border-amber-400 shadow-amber-400/20 scale-105'
              : isProcessing
              ? 'bg-blue-900 text-blue-200 border-blue-500'
              : errorMessage
              ? 'bg-rose-950/80 text-rose-300 border-rose-800'
              : 'bg-blue-950 hover:bg-blue-900 text-white border-blue-800 hover:border-amber-400/80'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
          {/* Outer Pulsing Ring when active listening */}
          {isListening && (
            <span className="absolute inset-0 rounded-xl bg-amber-400/30 animate-ping pointer-events-none" />
          )}

          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-300" />
          ) : isListening ? (
            <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
          ) : errorMessage ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <Mic className="w-5 h-5 text-amber-300" />
          )}
        </button>

        {/* Listening Waveform Animation */}
        {isListening && <ListeningAnimation state="listening" />}

        {/* Error Banner Tooltip */}
        {errorMessage && (
          <div className="absolute bottom-full mb-2 left-0 z-30 w-64 bg-slate-900 border border-rose-500/80 text-rose-200 text-[11px] font-bold p-2.5 rounded-xl shadow-2xl text-center">
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Live Transcript Display Card */}
      {showTranscriptCard && (transcript || isListening) && (
        <LiveTranscript
          transcript={transcript}
          isListening={isListening}
          isFinal={isFinal}
          languageCode={activeLangCode}
          onClear={() => {
            setTranscript('');
            setIsFinal(false);
          }}
        />
      )}
    </div>
  );
};
