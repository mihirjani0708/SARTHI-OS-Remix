/**
 * index.ts
 * Unified Conversation Cleanup & Quality Pipeline for SARTHI.
 * Connects ConversationFormatter, AutoCorrectService, NaturalLanguageRewriter, and VoiceSanitizer.
 */

import { autoCorrectService } from './AutoCorrectService';
import { conversationFormatter } from './ConversationFormatter';
import { naturalLanguageRewriter } from './NaturalLanguageRewriter';
import { voiceSanitizer } from './VoiceSanitizer';

export { AutoCorrectService, autoCorrectService } from './AutoCorrectService';
export { ConversationFormatter, conversationFormatter } from './ConversationFormatter';
export { NaturalLanguageRewriter, naturalLanguageRewriter } from './NaturalLanguageRewriter';
export { VoiceSanitizer, voiceSanitizer } from './VoiceSanitizer';

export class ConversationPipeline {
  private static instance: ConversationPipeline;

  public static getInstance(): ConversationPipeline {
    if (!ConversationPipeline.instance) {
      ConversationPipeline.instance = new ConversationPipeline();
    }
    return ConversationPipeline.instance;
  }

  /**
   * Pipeline Step 1: Pre-process and auto-correct user input (speech/typing/transliteration).
   */
  public processUserInput(input: string): { correctedText: string; detectedLanguageHint: string } {
    return autoCorrectService.autoCorrectInput(input);
  }

  /**
   * Pipeline Step 2: Format and rewrite raw AI response into warm human language for display.
   */
  public processAIResponse(rawText: string): string {
    const formatted = conversationFormatter.formatResponse(rawText);
    const rewritten = naturalLanguageRewriter.rewriteToHumanTone(formatted);
    return rewritten;
  }

  /**
   * Pipeline Step 3: Sanitize text into fluid spoken language for TTS Speech Synthesis.
   */
  public prepareVoiceOutput(text: string): string {
    return voiceSanitizer.sanitizeForSpeech(text);
  }
}

export const conversationPipeline = ConversationPipeline.getInstance();
