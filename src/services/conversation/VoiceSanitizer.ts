/**
 * VoiceSanitizer.ts
 * Prepares text specifically for speech synthesis engine.
 * Strips all markdown formatting, URLs, code blocks, emojis, symbols,
 * expands numbers/dates/percentages/currencies, and optimizes sentence pauses.
 */

export class VoiceSanitizer {
  private static instance: VoiceSanitizer;

  public static getInstance(): VoiceSanitizer {
    if (!VoiceSanitizer.instance) {
      VoiceSanitizer.instance = new VoiceSanitizer();
    }
    return VoiceSanitizer.instance;
  }

  /**
   * Sanitizes text for spoken TTS output.
   */
  public sanitizeForSpeech(text: string): string {
    if (!text) return '';

    let spoken = text;

    // 1. Remove code blocks & raw code
    spoken = spoken.replace(/```[\s\S]*?```/g, ' code block skipped. ');
    spoken = spoken.replace(/`([^`]+)`/g, '$1');

    // 2. Remove URLs & links
    spoken = spoken.replace(/https?:\/\/\S+/g, '');
    spoken = spoken.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 3. Remove Markdown headings, stars, underscores, hashes, bullet symbols
    spoken = spoken
      .replace(/#+\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/^[•*\-\+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '');

    // 4. Strip emojis and pictographs
    spoken = spoken.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

    // 5. Expand symbols & percentages & currencies
    spoken = spoken
      .replace(/(\d+)%/g, '$1 percent')
      .replace(/\$(\d+(\.\d+)?)/g, '$1 dollars')
      .replace(/₹(\d+(\.\d+)?)/g, '$1 rupees')
      .replace(/&/g, ' and ')
      .replace(/@/g, ' at ')
      .replace(/\+/g, ' plus ')
      .replace(/~/g, ' approximately ');

    // 6. Expand dates e.g. YYYY-MM-DD -> Month DD, YYYY
    spoken = spoken.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_m, y, m, d) => {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = months[parseInt(m, 10) - 1] || m;
      return `${monthName} ${parseInt(d, 10)}, ${y}`;
    });

    // 7. Expand times e.g. 04:30 PM -> 4 30 PM
    spoken = spoken.replace(/\b0?(\d{1,2}):(\d{2})\s*(AM|PM)\b/gi, '$1 $2 $3');

    // 8. Natural sentence pacing and line break pauses
    spoken = spoken
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .replace(/\.\s*\./g, '.')
      .trim();

    return spoken;
  }
}

export const voiceSanitizer = VoiceSanitizer.getInstance();
