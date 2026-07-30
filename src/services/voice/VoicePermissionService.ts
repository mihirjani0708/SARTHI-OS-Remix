/**
 * VoicePermissionService.ts
 * Manages microphone permission checks and requests on demand.
 * NEVER requests permissions automatically on app startup.
 */

export class VoicePermissionService {
  private static instance: VoicePermissionService;

  private constructor() {}

  public static getInstance(): VoicePermissionService {
    if (!VoicePermissionService.instance) {
      VoicePermissionService.instance = new VoicePermissionService();
    }
    return VoicePermissionService.instance;
  }

  /**
   * Check permission state using Navigator Permissions API if available.
   * Does NOT trigger a permission prompt popup.
   */
  public async checkPermissionState(): Promise<'granted' | 'denied' | 'prompt'> {
    if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
      return 'prompt';
    }

    try {
      // @ts-ignore - 'microphone' permission query name is supported in modern browsers
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return status.state;
    } catch {
      return 'prompt';
    }
  }

  /**
   * Request microphone access explicitly when user taps the microphone button.
   * Strictly requested on user gesture.
   */
  public async requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        granted: false,
        error: 'Voice Assistant is not supported on this device.',
      };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop stream tracks immediately after permission check
      stream.getTracks().forEach((track) => track.stop());
      return { granted: true };
    } catch (err: any) {
      console.warn('[VoicePermissionService] Permission request failed or denied:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return {
          granted: false,
          error: 'Microphone permission was denied. Please allow microphone access in your browser settings.',
        };
      }
      return {
        granted: false,
        error: 'Unable to access microphone. Please check your device audio settings.',
      };
    }
  }
}

export const voicePermissionService = VoicePermissionService.getInstance();
