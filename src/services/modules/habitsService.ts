/**
 * habitsService.ts
 * Independent Habits Service managing habit CRUD, streak tracking, and daily completions.
 */
import { StorageFactory } from '../storage/StorageFactory';
import { Habit } from '../../types';
import { DEFAULT_HABITS, createFreshHabitCollection } from '../../data/initialData';
import { errorService } from '../error/errorService';

export class HabitsService {
  private get storage() {
    return StorageFactory.getAdapter();
  }

  private getUserKey(userId: string, section: string): string {
    return `users/${userId}/${section}`;
  }

  public getHabits(userId: string): Habit[] {
    return errorService.tryExecute(
      () => {
        if (!userId) return createFreshHabitCollection();
        const key = this.getUserKey(userId, 'habits');
        const habits = this.storage.getItem<Habit[]>(key);

        if (habits && Array.isArray(habits)) {
          return this.sanitizeHabits(habits);
        }

        const initial = userId === 'mihir' ? DEFAULT_HABITS : createFreshHabitCollection();
        this.saveHabits(userId, initial);
        return initial;
      },
      createFreshHabitCollection(),
      'STORAGE',
      'getHabits'
    );
  }

  public saveHabits(userId: string, habits: Habit[]): void {
    errorService.tryExecute(
      () => {
        if (!userId) return;
        const key = this.getUserKey(userId, 'habits');
        const sanitized = this.sanitizeHabits(habits);
        this.storage.setItem(key, sanitized);
      },
      undefined,
      'STORAGE',
      'saveHabits'
    );
  }

  /** Filter out invalid or duplicate habits and guarantee required fields */
  private sanitizeHabits(habits: Habit[]): Habit[] {
    if (!Array.isArray(habits)) return [];
    const seenIds = new Set<string>();
    const sanitized: Habit[] = [];

    for (const h of habits) {
      if (!h || typeof h !== 'object') continue;
      const id = String(h.id || `h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const category = (h.category as any) || 'Mind';
      const completedDates =
        h.completedDates && typeof h.completedDates === 'object' && !Array.isArray(h.completedDates)
          ? h.completedDates
          : {};

      sanitized.push({
        ...h,
        id,
        name: String(h.name || (h as any).title || 'Untitled Habit').trim(),
        category: ['Mind', 'Body', 'Spirit', 'Discipline', 'Business'].includes(category) ? category : 'Mind',
        iconName: String(h.iconName || 'CheckCircle'),
        streak: typeof h.streak === 'number' ? Math.max(0, h.streak) : 0,
        completedDates,
      });
    }
    return sanitized;
  }
}

export const habitsService = new HabitsService();
