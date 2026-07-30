/**
 * journalService.ts
 * Independent Journal Service managing daily reflections and log entries.
 */
import { StorageFactory } from '../storage/StorageFactory';
import { JournalEntry } from '../../types';
import { INITIAL_JOURNAL } from '../../data/initialData';
import { errorService } from '../error/errorService';

export class JournalService {
  private get storage() {
    return StorageFactory.getAdapter();
  }

  private getUserKey(userId: string, section: string): string {
    return `users/${userId}/${section}`;
  }

  public getJournalEntries(userId: string): Record<string, JournalEntry> {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const key = this.getUserKey(userId, 'journal');
        const journal = this.storage.getItem<Record<string, JournalEntry>>(key);

        if (journal && typeof journal === 'object') {
          return this.sanitizeJournal(journal);
        }

        const initial = userId === 'mihir' ? INITIAL_JOURNAL : {};
        this.saveJournalEntries(userId, initial);
        return initial;
      },
      {},
      'STORAGE',
      'getJournalEntries'
    );
  }

  public saveJournalEntries(userId: string, journal: Record<string, JournalEntry>): void {
    errorService.tryExecute(
      () => {
        if (!userId) return;
        const key = this.getUserKey(userId, 'journal');
        const sanitized = this.sanitizeJournal(journal);
        this.storage.setItem(key, sanitized);
      },
      undefined,
      'STORAGE',
      'saveJournalEntries'
    );
  }

  /** Validate and sanitize journal dictionary map */
  private sanitizeJournal(journal: Record<string, JournalEntry>): Record<string, JournalEntry> {
    if (!journal || typeof journal !== 'object') return {};
    const sanitized: Record<string, JournalEntry> = {};

    for (const [dateKey, entry] of Object.entries(journal)) {
      if (!entry || typeof entry !== 'object') continue;
      sanitized[dateKey] = {
        date: String(entry.date || dateKey).trim(),
        moodRating: typeof entry.moodRating === 'number' ? entry.moodRating : 5,
        gratitude: Array.isArray(entry.gratitude) ? entry.gratitude : [],
        dailyWins: Array.isArray(entry.dailyWins) ? entry.dailyWins : [],
        learnings: String(entry.learnings || '').trim(),
        journalText: String(entry.journalText || (entry as any).content || '').trim(),
        manifestationFocus: String(entry.manifestationFocus || '').trim(),
      };
    }
    return sanitized;
  }
}

export const journalService = new JournalService();
