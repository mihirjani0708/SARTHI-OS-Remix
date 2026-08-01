/**
 * NaturalLanguageRewriter.ts
 * Rewrites AI messages into warm, professional human language (Executive Assistant / Advisor tone).
 * Eliminates robotic phrasing, AI boilerplate, and unnatural technical noise.
 */

export class NaturalLanguageRewriter {
  private static instance: NaturalLanguageRewriter;

  public static getInstance(): NaturalLanguageRewriter {
    if (!NaturalLanguageRewriter.instance) {
      NaturalLanguageRewriter.instance = new NaturalLanguageRewriter();
    }
    return NaturalLanguageRewriter.instance;
  }

  /**
   * Rewrites response into a warm, concise human conversation tone.
   */
  public rewriteToHumanTone(text: string): string {
    if (!text) return '';

    let rewritten = text;

    // Strip robotic action headers & banners
    rewritten = rewritten
      .replace(/⚡\s*\*\*AI Action Executed:\*\*/gi, '')
      .replace(/🤖\s*\*\*SARTHI AI Workspace Insights:\*\*/gi, '');

    // Direct action message rewrites
    if (rewritten.includes('Task created successfully') || rewritten.includes('Added new task')) {
      rewritten = rewritten.replace(/Task created successfully|Added new task:?/gi, "I've added that to your tasks.");
    }

    if (rewritten.includes('Habit logged successfully') || rewritten.includes('Completed habit')) {
      rewritten = rewritten.replace(/Habit logged successfully|Completed habit:?/gi, "Great job! I've marked that habit as complete for today.");
    }

    if (rewritten.includes('Productivity Index stands at')) {
      rewritten = rewritten.replace(
        /you have \*\*(\d+) pending tasks\*\* with \*\*~([\d.]+) hours\*\* of workload\.\n\nYour current Productivity Index stands at \*\*(\d+)%\*\*\./gi,
        'You have $1 pending tasks lined up today, representing about $2 hours of focused work. Your overall productivity index is currently at $3%.'
      );
    }

    // Replace robotic prompt callouts
    rewritten = rewritten.replace(/Click any suggested prompt below or ask a question to optimize your workflow!/gi, 'Let me know if you would like me to adjust your priorities or clear your afternoon calendar.');

    // Replace repetitive stiff transitions
    rewritten = rewritten
      .replace(/Here is your scheduled agenda for today:/gi, "Here is your agenda for today:")
      .replace(/Action Required: Clear overdue items first to prevent schedule slip\./gi, "I recommend addressing the overdue items first so your afternoon stays on track.")
      .replace(/Keep maintaining consistent daily habit logging to achieve full target progress!/gi, "You're making steady progress—keep up the momentum!");

    // Humanize tone punctuation and sentence flow
    rewritten = rewritten.trim();

    return rewritten;
  }
}

export const naturalLanguageRewriter = NaturalLanguageRewriter.getInstance();
