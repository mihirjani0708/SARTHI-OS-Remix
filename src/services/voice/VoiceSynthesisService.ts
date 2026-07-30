/**
 * VoiceSynthesisService.ts
 * Core modular Synthesis Service detecting SpeechSynthesis browser support and configuration.
 * Serves as the TTS foundation for SARTHI AI Voice Engine.
 */

import { VoiceSpeed } from '../../types';

export class VoiceSynthesisService {
  private static instance: VoiceSynthesisService;

  private constructor() {}

  public static getInstance(): VoiceSynthesisService {
    if (!VoiceSynthesisService.instance) {
      VoiceSynthesisService.instance = new VoiceSynthesisService();
    }
    return VoiceSynthesisService.instance;
  }

  /**
   * Check if SpeechSynthesis API is supported by the current browser.
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  /**
   * Helper to convert VoiceSpeed string to numeric playback rate for Web Speech API.
   */
  public getSpeedRate(speed: VoiceSpeed): number {
    switch (speed) {
      case 'slow':
        return 0.8;
      case 'fast':
        return 1.25;
      case 'normal':
      default:
        return 1.0;
    }
  }

  /**
   * Helper to convert 0-100 volume scale to 0.0-1.0 decimal scale.
   */
  public getNormalizedVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume / 100));
  }
}

export const voiceSynthesisService = VoiceSynthesisService.getInstance();
