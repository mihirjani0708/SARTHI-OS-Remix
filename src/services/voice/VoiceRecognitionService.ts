/**
 * VoiceRecognitionService.ts
 * Core modular Recognition Service detecting SpeechRecognition and webkitSpeechRecognition browser support.
 * Serves as the foundation for SARTHI AI Voice Engine.
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'unsupported' | 'error';

export class VoiceRecognitionService {
  private static instance: VoiceRecognitionService;

  private constructor() {}

  public static getInstance(): VoiceRecognitionService {
    if (!VoiceRecognitionService.instance) {
      VoiceRecognitionService.instance = new VoiceRecognitionService();
    }
    return VoiceRecognitionService.instance;
  }

  /**
   * Check if SpeechRecognition or webkitSpeechRecognition is supported by current browser runtime.
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }

  /**
   * Check if native SpeechRecognition constructor is available.
   */
  public hasNativeSpeechRecognition(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

export const voiceRecognitionService = VoiceRecognitionService.getInstance();
