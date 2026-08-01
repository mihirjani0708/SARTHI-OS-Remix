/**
 * ConversationFormatter.ts
 * Formats AI output before display to ensure clean layout, remove raw JSON/code blocks,
 * filter out robotic headers/artifacts, and structure paragraphs and lists elegantly.
 */

export class ConversationFormatter {
  private static instance: ConversationFormatter;

  public static getInstance(): ConversationFormatter {
    if (!ConversationFormatter.instance) {
      ConversationFormatter.instance = new ConversationFormatter();
    }
    return ConversationFormatter.instance;
  }

  /**
   * Cleans AI response text, removing raw JSON, system prefixes, and artificial headers.
   */
  public formatResponse(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // 1. Remove JSON code blocks if accidentally returned by AI models
    cleaned = cleaned.replace(/```json[\s\S]*?```/gi, '');
    cleaned = cleaned.replace(/```[\s\S]*?```/gi, '');

    // 2. Strip robotic prefixes and system flags
    cleaned = cleaned
      .replace(/🤖\s*\*\*SARTHI AI Workspace Insights:\*\*/gi, '')
      .replace(/⚡\s*\*\*AI Action Executed:\*\*/gi, '')
      .replace(/🔍\s*\*\*Found \d+ matching task\(s\) in DataService:\*\*/gi, '')
      .replace(/⚠️\s*\*\*Risk & Vulnerability Audit:\*\*/gi, 'Key Areas Requiring Attention:')
      .replace(/📈\s*\*\*Goals & Milestones Status:\*\*/gi, 'Goals and Milestones Progress:')
      .replace(/Based on your live local dataset,?\s*/gi, '')
      .replace(/As an AI language model,?\s*/gi, '')
      .replace(/As an AI assistant,?\s*/gi, '');

    // 3. Clean up excessive Markdown heading symbols (### Heading -> Bold text)
    cleaned = cleaned.replace(/#+\s+([^\n]+)/g, '**$1**');

    // 4. Remove robotic tip callouts e.g. "💡 *Tip: ..."
    cleaned = cleaned.replace(/💡\s*\*Tip:\s*([^*]+)\*/gi, 'Note: $1');

    // 5. Clean multi-line empty spacing
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

    return cleaned;
  }
}

export const conversationFormatter = ConversationFormatter.getInstance();
