/**
 * AutoCorrectService.ts
 * Intelligent contextual auto-correct for speech recognition, typing mistakes,
 * and Hindi/Gujarati transliteration corrections.
 */

export class AutoCorrectService {
  private static instance: AutoCorrectService;

  // Common English spelling & speech-to-text mishearings map
  private englishCorrections: Record<string, string> = {
    pariotize: 'prioritize',
    priortize: 'prioritize',
    proritize: 'prioritize',
    schedul: 'schedule',
    shedule: 'schedule',
    skedule: 'schedule',
    meetng: 'meeting',
    meting: 'meeting',
    habts: 'habits',
    habbits: 'habits',
    taks: 'tasks',
    taskes: 'tasks',
    remindr: 'reminder',
    remindar: 'reminder',
    tomorow: 'tomorrow',
    tomoroww: 'tomorrow',
    todai: 'today',
    yeasterday: 'yesterday',
    imporatnt: 'important',
    inporatnt: 'important',
    urgnt: 'urgent',
    prodctivity: 'productivity',
    focusd: 'focused',
    fokus: 'focus',
    calender: 'calendar',
    analitics: 'analytics',
    breifing: 'briefing',
    brifing: 'briefing',
  };

  // Hindi & Gujarati common phonetic / STT transliteration map
  privateIndicCorrections: Record<string, string> = {
    // Hindi
    'aaj ka plan': "today's schedule and plan",
    'kya karna hai': 'what tasks need to be done today',
    'kaam batao': 'show my important tasks',
    'kaise ho': 'how are you',
    'shukriya': 'thank you',
    'zaroori task': 'high priority task',
    'sarthi': 'SARTHI',
    'madad karo': 'help me prioritize',
    'time kitna hai': 'what is my schedule today',
    // Gujarati
    'kem cho': 'how are you doing',
    'tamaru naam': 'what is your name',
    'aaj no plan': "today's plan and goals",
    'su chhale che': 'what is on my agenda',
    'shu chhaley chhe': 'what is on my agenda',
    'tamare su karvanu': 'what needs to be accomplished today',
    'gujrati': 'Gujarati',
    'tamaro plan': 'your plan',
    'aaje shu kaam chhe': 'what tasks do I have today',
  };

  public static getInstance(): AutoCorrectService {
    if (!AutoCorrectService.instance) {
      AutoCorrectService.instance = new AutoCorrectService();
    }
    return AutoCorrectService.instance;
  }

  /**
   * Cleans up and corrects typos, STT noise, and transliteration phrasing in user input.
   */
  public autoCorrectInput(input: string): { correctedText: string; detectedLanguageHint: 'english' | 'hindi' | 'gujarati' | 'mixed' } {
    if (!input || typeof input !== 'string') {
      return { correctedText: '', detectedLanguageHint: 'english' };
    }

    let text = input.trim();
    let languageHint: 'english' | 'hindi' | 'gujarati' | 'mixed' = 'english';

    // Detect script or Indic phrases
    if (/[\u0A80-\u0AFF]/.test(text)) {
      languageHint = 'gujarati';
    } else if (/[\u0900-\u097F]/.test(text)) {
      languageHint = 'hindi';
    } else if (/kem cho|aaj no plan|su chhale|shu chhaley|tamare|tamaru|aaje shu/i.test(text)) {
      languageHint = 'gujarati';
    } else if (/aaj ka plan|kya karna|kaam batao|kaise ho|zaroori task|madad/i.test(text)) {
      languageHint = 'hindi';
    }

    // 1. Phonetic Indic phrase normalizing
    for (const [key, replacement] of Object.entries(this.privateIndicCorrections)) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      if (regex.test(text)) {
        text = text.replace(regex, replacement);
      }
    }

    // 2. Token-level English spelling correction
    const words = text.split(/(\s+)/);
    const correctedWords = words.map((word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (this.englishCorrections[cleanWord]) {
        const replacement = this.englishCorrections[cleanWord];
        // preserve casing
        if (word[0] === word[0]?.toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      }
      return word;
    });

    const correctedText = correctedWords.join('').replace(/\s+/g, ' ').trim();

    return {
      correctedText,
      detectedLanguageHint: languageHint,
    };
  }
}

export const autoCorrectService = AutoCorrectService.getInstance();
