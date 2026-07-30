/**
 * voiceController.ts
 * Central Voice Controller orchestrating Speech Recognition, Speech Synthesis, Language Detection,
 * and AI Chat Voice Workflows for SARTHI OS.
 */

import {
  speechRecognitionService,
  SupportedVoiceLanguage,
} from './speechRecognitionService';
import { speechSynthesisService } from './speechSynthesisService';
import { VoiceSpeed, VoiceSettings } from '../../types';

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  selectedLanguage: SupportedVoiceLanguage;
  detectedLanguage: SupportedVoiceLanguage;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  isSupported: boolean;
}

type VoiceStateListener = (state: VoiceState) => void;

export class VoiceController {
  private static instance: VoiceController;
  private listeners: Set<VoiceStateListener> = new Set();

  private state: VoiceState = {
    isListening: false,
    isSpeaking: false,
    selectedLanguage: 'auto',
    detectedLanguage: 'en-US',
    transcript: '',
    interimTranscript: '',
    errorMessage: null,
    isSupported: speechRecognitionService.isSupported(),
  };

  private constructor() {}

  public static getInstance(): VoiceController {
    if (!VoiceController.instance) {
      VoiceController.instance = new VoiceController();
    }
    return VoiceController.instance;
  }

  /**
   * Get current reactive voice state.
   */
  public getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * Subscribe to voice state updates.
   */
  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  private updateState(partial: Partial<VoiceState>) {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  /**
   * Set target voice language preference ('en-US', 'hi-IN', 'gu-IN', 'auto').
   */
  public setLanguage(language: SupportedVoiceLanguage) {
    this.updateState({ selectedLanguage: language });
  }

  /**
   * Start microphone listening session.
   */
  public startListening(
    onFinalResult?: (transcript: string, detectedLang: SupportedVoiceLanguage) => void
  ): boolean {
    // If speaking, stop speaking first
    if (this.state.isSpeaking) {
      this.stopSpeaking();
    }

    this.updateState({
      isListening: true,
      errorMessage: null,
      transcript: '',
      interimTranscript: '',
    });

    const success = speechRecognitionService.startListening(
      this.state.selectedLanguage,
      {
        onStart: () => {
          this.updateState({ isListening: true, errorMessage: null });
        },
        onResult: (text, isFinal, detectedLang) => {
          if (isFinal) {
            this.updateState({
              transcript: text,
              interimTranscript: '',
              detectedLanguage: detectedLang,
              isListening: false,
            });
            if (onFinalResult && text.trim()) {
              onFinalResult(text.trim(), detectedLang);
            }
          } else {
            this.updateState({
              interimTranscript: text,
              detectedLanguage: detectedLang,
            });
          }
        },
        onError: (errMsg) => {
          this.updateState({
            isListening: false,
            errorMessage: errMsg || "I couldn't understand. Please try again.",
            interimTranscript: '',
          });
        },
        onEnd: () => {
          this.updateState({ isListening: false });
        },
      }
    );

    if (!success) {
      this.updateState({
        isListening: false,
        errorMessage: "I couldn't understand. Please try again.",
      });
    }

    return success;
  }

  /**
   * Stop listening session.
   */
  public stopListening() {
    speechRecognitionService.stopListening();
    this.updateState({ isListening: false });
  }

  /**
   * Read response text aloud automatically in the detected or specified language,
   * obeying VoiceSettings (speed, volume, pitch, continuousMode).
   */
  public speakResponse(
    text: string,
    overrideLang?: SupportedVoiceLanguage,
    settingsOptions?: {
      speed?: VoiceSpeed;
      volume?: number;
      pitch?: number;
      gender?: 'default' | 'male' | 'female';
      continuousMode?: boolean;
      enabled?: boolean;
    },
    onAutoResumeListening?: () => void
  ): boolean {
    // Task 6: Automatically stop listening when AI starts speaking
    if (this.state.isListening) {
      this.stopListening();
    }

    const targetLang = overrideLang || this.state.detectedLanguage || 'en-US';

    this.updateState({ isSpeaking: true, errorMessage: null });

    return speechSynthesisService.speak(
      text,
      {
        language: targetLang,
        speed: settingsOptions?.speed,
        volume: settingsOptions?.volume,
        pitch: settingsOptions?.pitch,
        gender: settingsOptions?.gender,
      },
      {
        onStart: () => {
          this.updateState({ isSpeaking: true });
        },
        onEnd: () => {
          this.updateState({ isSpeaking: false });

          // Task 7: Automatically resume listening only after speech is completed (if Continuous Conversation Mode is enabled)
          if (settingsOptions?.continuousMode && settingsOptions?.enabled !== false) {
            setTimeout(() => {
              if (!this.state.isSpeaking && !this.state.isListening) {
                if (onAutoResumeListening) {
                  onAutoResumeListening();
                } else {
                  this.startListening();
                }
              }
            }, 350);
          }
        },
        onError: (err) => {
          this.updateState({ isSpeaking: false });
          console.warn('[VoiceController] Speak error:', err);
        },
      }
    );
  }

  /**
   * Cancel ongoing speech synthesis.
   */
  public stopSpeaking() {
    speechSynthesisService.stop();
    this.updateState({ isSpeaking: false });
  }

  /**
   * Clear error message.
   */
  public clearError() {
    this.updateState({ errorMessage: null });
  }
}

export const voiceController = VoiceController.getInstance();
