/**
 * speechRecognitionService.ts
 * Core Speech Recognition Engine for SARTHI AI Voice Assistant.
 * Uses Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 * Configured with continuous=false, interimResults=true, maxAlternatives=1.
 * Supports English (en-IN / en-US), Hindi (hi-IN), and Gujarati (gu-IN).
 */

import { VoiceLanguage } from '../../types';

export type RecognitionLanguageCode = 'en-IN' | 'hi-IN' | 'gu-IN' | 'en-US';
export type SupportedVoiceLanguage = 'en-US' | 'hi-IN' | 'gu-IN' | 'auto';

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string, langCode: RecognitionLanguageCode) => void;
  onResult?: (transcript: string, isFinal: boolean, detectedLang: SupportedVoiceLanguage) => void;
  onError?: (friendlyErrorMsg: string) => void;
  onEnd?: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class SpeechRecognitionService {
  private static instance: SpeechRecognitionService;
  private recognition: any | null = null;
  private isListening = false;
  private activeLangCode: RecognitionLanguageCode = 'en-IN';

  private constructor() {
    this.initEngine();
  }

  public static getInstance(): SpeechRecognitionService {
    if (!SpeechRecognitionService.instance) {
      SpeechRecognitionService.instance = new SpeechRecognitionService();
    }
    return SpeechRecognitionService.instance;
  }

  /**
   * Check if browser supports SpeechRecognition or webkitSpeechRecognition.
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Map user's preferred VoiceLanguage string to BCP 47 recognition code.
   */
  public getLanguageCode(prefLang?: VoiceLanguage | string): RecognitionLanguageCode {
    if (!prefLang) return 'en-IN';

    const clean = prefLang.toLowerCase();
    if (clean.includes('hindi') || clean.includes('hi')) return 'hi-IN';
    if (clean.includes('gujarati') || clean.includes('gu')) return 'gu-IN';
    return 'en-IN';
  }

  /**
   * Detect language from text script analysis (Devanagari for Hindi, Gujarati for Gujarati, Latin for English).
   */
  public detectLanguageFromText(text: string): SupportedVoiceLanguage {
    if (!text || !text.trim()) return 'en-US';

    const gujaratiRegex = /[\u0A80-\u0AFF]/;
    if (gujaratiRegex.test(text)) {
      return 'gu-IN';
    }

    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) {
      return 'hi-IN';
    }

    return 'en-US';
  }

  /**
   * Initialize native SpeechRecognition instance with required settings.
   */
  private initEngine() {
    if (!this.isSupported()) return;

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      
      // Requirement 4: Recognition Settings
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    } catch (err) {
      console.warn('[SpeechRecognitionService] Failed to construct SpeechRecognition:', err);
      this.recognition = null;
    }
  }

  /**
   * Map Web Speech API error event codes to friendly user messages.
   */
  public getFriendlyErrorMessage(errorCode?: string): string {
    switch (errorCode) {
      case 'not-allowed':
      case 'permission-denied':
        return 'Microphone permission was denied. Please allow microphone access in your browser settings.';
      case 'no-speech':
        return 'No speech detected. Please try speaking again.';
      case 'network':
        return 'Network issue detected while recognizing speech.';
      case 'audio-capture':
        return 'No audio capture device found. Please verify your microphone connection.';
      case 'aborted':
        return 'Voice recognition was stopped.';
      case 'service-not-allowed':
        return 'Speech recognition service is disabled or blocked on this device.';
      case 'unsupported':
        return 'Speech recognition is not supported on this browser or device.';
      default:
        return 'I couldn\'t understand. Please try again.';
    }
  }

  /**
   * Start listening for voice input.
   */
  public startListening(
    preferredLang?: VoiceLanguage | string,
    callbacks: SpeechRecognitionCallbacks = {}
  ): boolean {
    if (!this.isSupported()) {
      callbacks.onError?.('Speech recognition is not supported on this browser or device.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    if (!this.recognition) {
      this.initEngine();
    }

    if (!this.recognition) {
      callbacks.onError?.('Speech recognition is not supported on this browser or device.');
      return false;
    }

    this.activeLangCode = this.getLanguageCode(preferredLang);
    this.recognition.lang = this.activeLangCode;

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        } else {
          interimTranscript += transcriptChunk;
        }
      }

      if (interimTranscript) {
        const trimmed = interimTranscript.trim();
        callbacks.onInterimResult?.(trimmed);
        const detected = this.detectLanguageFromText(trimmed);
        callbacks.onResult?.(trimmed, false, detected);
      }

      if (finalTranscript) {
        const trimmed = finalTranscript.trim();
        callbacks.onFinalResult?.(trimmed, this.activeLangCode);
        const detected = this.detectLanguageFromText(trimmed);
        callbacks.onResult?.(trimmed, true, detected);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const friendlyMsg = this.getFriendlyErrorMessage(event.error);
      callbacks.onError?.(friendlyMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      console.warn('[SpeechRecognitionService] Start exception:', err);
      const friendlyMsg = this.getFriendlyErrorMessage(err?.name || 'unknown');
      callbacks.onError?.(friendlyMsg);
      return false;
    }
  }

  /**
   * Stop active speech recognition.
   */
  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // ignore if already stopped
      }
      this.isListening = false;
    }
  }

  /**
   * Get current listening state.
   */
  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = SpeechRecognitionService.getInstance();
export const speechRecognitionServiceInstance = speechRecognitionService;
