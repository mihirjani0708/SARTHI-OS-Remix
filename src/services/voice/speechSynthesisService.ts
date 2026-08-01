/**
 * speechSynthesisService.ts
 * Advanced Speech Synthesis Engine for SARTHI AI Voice Assistant.
 * Uses Browser Speech Synthesis API with support for:
 * - Language matching (en-IN fallback en-US, hi-IN, gu-IN fallback closest Indian voice)
 * - Long text natural sentence chunking (>500 chars split cleanly)
 * - Play, Pause, Resume, and Stop controls
 * - Real-time sentence tracking for active speech highlighting
 * - Robust error handling & silent fallback
 */

import { VoiceLanguage, VoiceSpeed } from '../../types';
import { voiceSanitizer } from '../conversation/VoiceSanitizer';

export interface SynthesisOptions {
  language?: VoiceLanguage | string;
  gender?: 'default' | 'male' | 'female';
  speed?: VoiceSpeed;
  volume?: number; // 0 to 100
  pitch?: number;  // 0.8 to 1.2
  rate?: number;   // 0.5 to 2.0
}

export interface SynthesisCallbacks {
  onStart?: () => void;
  onSentenceStart?: (sentenceIndex: number, sentenceText: string, totalSentences: number) => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (errorMsg: string) => void;
}

export class SpeechSynthesisService {
  private static instance: SpeechSynthesisService;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking = false;
  private isPaused = false;
  private currentChunks: string[] = [];
  private currentChunkIndex = 0;
  private activeCallbacks: SynthesisCallbacks | null = null;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
    }
  }

  public static getInstance(): SpeechSynthesisService {
    if (!SpeechSynthesisService.instance) {
      SpeechSynthesisService.instance = new SpeechSynthesisService();
    }
    return SpeechSynthesisService.instance;
  }

  /**
   * Check if SpeechSynthesis API is supported in the current environment.
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  /**
   * Initialize and load available device system voices.
   */
  private initVoices() {
    if (!this.synth) return;

    const load = () => {
      this.voices = this.synth?.getVoices() || [];
    };

    load();
    if (typeof window !== 'undefined' && 'onvoiceschanged' in this.synth) {
      this.synth.onvoiceschanged = load;
    }
  }

  /**
   * Get fresh list of system voices.
   */
  public getVoices(): SpeechSynthesisVoice[] {
    if (this.synth && (!this.voices || this.voices.length === 0)) {
      this.voices = this.synth.getVoices() || [];
    }
    return this.voices;
  }

  /**
   * Clean text for natural speech (strip Markdown symbols, code blocks, URLs, emojis, and expand numbers/dates/times).
   */
  public cleanTextForSpeech(text: string): string {
    return voiceSanitizer.sanitizeForSpeech(text);
  }

  /**
   * Part 6: Detect basic internal emotional tone for natural vocal expression adjustment.
   * Internal use only (no UI badges/labels).
   */
  public detectInternalEmotion(text: string): 'happy' | 'sad' | 'confused' | 'professional' | 'stressed' | 'motivated' {
    if (!text) return 'professional';
    const lower = text.toLowerCase();

    if (/great|awesome|excellent|congratulations|proud|happy|wonderful|yay|success|cheers/i.test(lower)) {
      return 'happy';
    }
    if (/achieve|goal|focus|target|action|boost|power|let's do this|crush it/i.test(lower)) {
      return 'motivated';
    }
    if (/overwhelmed|stress|hard|tough|exhausted|burnout|anxious|worry|difficult/i.test(lower)) {
      return 'stressed';
    }
    if (/sorry|unfortunate|missed|loss|sad|down/i.test(lower)) {
      return 'sad';
    }
    if (/not sure|confused|unclear|how to|what do you mean|pardon/i.test(lower)) {
      return 'confused';
    }

    return 'professional';
  }

  /**
   * Requirement 7: If AI response exceeds 500 characters, split into smaller speech chunks / sentences
   * without cutting words in the middle.
   */
  public splitTextIntoChunks(text: string, maxChunkLength: number = 220): string[] {
    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return [];

    if (cleaned.length <= maxChunkLength) {
      return [cleaned];
    }

    // Split by sentence delimiters (. ! ? newline)
    const sentenceCandidates = cleaned.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentenceCandidates) {
      if (!sentence) continue;

      if ((currentChunk + ' ' + sentence).length <= maxChunkLength) {
        currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        // If a single sentence exceeds max length, split by clause punctuation (, ; -)
        if (sentence.length > maxChunkLength) {
          const subClauses = sentence.split(/(?<=[,;-])\s+/);
          let subChunk = '';
          for (const clause of subClauses) {
            if ((subChunk + ' ' + clause).length <= maxChunkLength) {
              subChunk = subChunk ? subChunk + ' ' + clause : clause;
            } else {
              if (subChunk) chunks.push(subChunk.trim());
              subChunk = clause;
            }
          }
          if (subChunk) currentChunk = subChunk;
        } else {
          currentChunk = sentence;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [cleaned];
  }

  /**
   * Requirement 4 & Part 8: Match voice to selected language and preferred voice gender
   * English → en-IN (fallback en-US)
   * Hindi → hi-IN
   * Gujarati → gu-IN (if unavailable, closest Indian voice like hi-IN / en-IN)
   */
  public getBestVoiceForLanguage(
    lang?: VoiceLanguage | string,
    genderPref?: 'default' | 'male' | 'female'
  ): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const cleanLang = (lang || 'english').toLowerCase();

    // Helper to filter by gender keyword if requested
    const filterByGender = (voiceList: SpeechSynthesisVoice[]) => {
      if (!genderPref || genderPref === 'default') return voiceList;
      const maleKeywords = ['male', 'guy', 'david', 'mark', 'george', 'rishi', 'neerja'];
      const femaleKeywords = ['female', 'zira', 'heera', 'swara', 'sangeeta', 'google uk english female', 'samantha'];

      const keywords = genderPref === 'male' ? maleKeywords : femaleKeywords;
      const matched = voiceList.filter((v) =>
        keywords.some((kw) => v.name.toLowerCase().includes(kw))
      );
      return matched.length > 0 ? matched : voiceList;
    };

    // Gujarati
    if (cleanLang.includes('gujarati') || cleanLang.includes('gu')) {
      const gujVoices = voices.filter(
        (v) => v.lang.toLowerCase().includes('gu') || v.name.toLowerCase().includes('gujarati')
      );
      if (gujVoices.length > 0) {
        return filterByGender(gujVoices)[0];
      }

      // Fallback: Hindi or Indian English voice
      const indianFallback = voices.filter(
        (v) => v.lang.toLowerCase().includes('hi') || v.lang.toLowerCase().includes('en-in')
      );
      if (indianFallback.length > 0) {
        return filterByGender(indianFallback)[0];
      }
    }

    // Hindi
    if (cleanLang.includes('hindi') || cleanLang.includes('hi')) {
      const hindiVoices = voices.filter(
        (v) => v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoices.length > 0) {
        return filterByGender(hindiVoices)[0];
      }

      const indianFallback = voices.filter((v) => v.lang.toLowerCase().includes('en-in'));
      if (indianFallback.length > 0) {
        return filterByGender(indianFallback)[0];
      }
    }

    // English (en-IN fallback en-US)
    const enInVoices = voices.filter(
      (v) => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india')
    );
    if (enInVoices.length > 0) {
      return filterByGender(enInVoices)[0];
    }

    const enUsVoices = voices.filter(
      (v) => v.lang.toLowerCase().includes('en-us') || v.lang.toLowerCase().startsWith('en')
    );
    if (enUsVoices.length > 0) {
      return filterByGender(enUsVoices)[0];
    }

    return filterByGender(voices)[0] || voices[0] || null;
  }

  /**
   * Convert VoiceSpeed string or rate to float.
   */
  public getNumericRate(speed?: VoiceSpeed | number): number {
    if (typeof speed === 'number') return speed;
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
   * Speak response text aloud, with sentence chunking & full playback controls.
   */
  public speak(
    text: string,
    options: SynthesisOptions = {},
    callbacks: SynthesisCallbacks = {}
  ): boolean {
    if (!this.isSupported() || !this.synth) {
      callbacks.onError?.('Speech synthesis is not supported on this device.');
      return false;
    }

    // Cancel active playback
    this.stop();

    const chunks = this.splitTextIntoChunks(text);
    if (chunks.length === 0) {
      callbacks.onEnd?.();
      return false;
    }

    this.currentChunks = chunks;
    this.currentChunkIndex = 0;
    this.activeCallbacks = callbacks;
    this.isSpeaking = true;
    this.isPaused = false;

    callbacks.onStart?.();
    this.speakChunk(options);
    return true;
  }

  /**
   * Internal recursive chunk player.
   */
  private speakChunk(options: SynthesisOptions) {
    if (!this.synth || this.currentChunkIndex >= this.currentChunks.length) {
      this.isSpeaking = false;
      this.isPaused = false;
      this.activeCallbacks?.onEnd?.();
      return;
    }

    const chunkText = this.currentChunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunkText);

    const voice = this.getBestVoiceForLanguage(options.language, options.gender);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = options.language?.includes('hi')
        ? 'hi-IN'
        : options.language?.includes('gu')
        ? 'gu-IN'
        : 'en-IN';
    }

    const emotion = this.detectInternalEmotion(chunkText);
    let emotionPitchOffset = 0;
    let emotionRateOffset = 0;
    if (emotion === 'happy' || emotion === 'motivated') {
      emotionPitchOffset = 0.04;
      emotionRateOffset = 0.03;
    } else if (emotion === 'stressed' || emotion === 'sad') {
      emotionPitchOffset = -0.04;
      emotionRateOffset = -0.04;
    } else if (emotion === 'confused') {
      emotionRateOffset = -0.03;
    }

    const baseRate = this.getNumericRate(options.speed || options.rate);
    const basePitch = options.pitch !== undefined ? Math.max(0.5, Math.min(1.5, options.pitch)) : 1.0;

    utterance.rate = Math.max(0.6, Math.min(1.6, baseRate + emotionRateOffset));
    utterance.volume = options.volume !== undefined ? Math.max(0, Math.min(1, options.volume / 100)) : 0.9;
    utterance.pitch = Math.max(0.6, Math.min(1.4, basePitch + emotionPitchOffset));

    utterance.onstart = () => {
      this.activeCallbacks?.onSentenceStart?.(
        this.currentChunkIndex,
        chunkText,
        this.currentChunks.length
      );
    };

    utterance.onend = () => {
      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.currentChunks.length && this.isSpeaking) {
        this.speakChunk(options);
      } else {
        this.isSpeaking = false;
        this.isPaused = false;
        this.activeCallbacks?.onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechSynthesisService] Utterance error:', e);
      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.currentChunks.length && this.isSpeaking) {
        this.speakChunk(options);
      } else {
        this.isSpeaking = false;
        this.isPaused = false;
        this.activeCallbacks?.onError?.('Speech playback encountered an issue.');
      }
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('[SpeechSynthesisService] speak exception:', err);
      this.isSpeaking = false;
      this.isPaused = false;
      this.activeCallbacks?.onError?.('Unable to play speech.');
    }
  }

  /**
   * Pause current speech output.
   */
  public pause(): boolean {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      try {
        this.synth.pause();
        this.isPaused = true;
        this.activeCallbacks?.onPause?.();
        return true;
      } catch (err) {
        console.warn('[SpeechSynthesisService] Pause failed:', err);
      }
    }
    return false;
  }

  /**
   * Resume paused speech output.
   */
  public resume(): boolean {
    if (this.synth && this.isPaused) {
      try {
        this.synth.resume();
        this.isPaused = false;
        this.activeCallbacks?.onResume?.();
        return true;
      } catch (err) {
        console.warn('[SpeechSynthesisService] Resume failed:', err);
      }
    }
    return false;
  }

  /**
   * Stop current speech and clear speech queue immediately (Barge-in support).
   */
  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (err) {
        // ignore
      }
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentChunks = [];
    this.currentChunkIndex = 0;
  }

  /**
   * Alias for stop().
   */
  public cancel() {
    this.stop();
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getCurrentChunkInfo() {
    return {
      chunks: this.currentChunks,
      currentIndex: this.currentChunkIndex,
      currentText: this.currentChunks[this.currentChunkIndex] || '',
    };
  }
}

export const speechSynthesisService = SpeechSynthesisService.getInstance();
export const speechSynthesisServiceInstance = speechSynthesisService;
