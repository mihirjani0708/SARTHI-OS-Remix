/**
 * goalsService.ts
 * Independent Goals Service managing long-term objectives and progress tracking.
 */
import { StorageFactory } from '../storage/StorageFactory';
import { Goal } from '../../types';
import { INITIAL_GOALS } from '../../data/initialData';
import { errorService } from '../error/errorService';

export class GoalsService {
  private get storage() {
    return StorageFactory.getAdapter();
  }

  private getUserKey(userId: string, section: string): string {
    return `users/${userId}/${section}`;
  }

  public getGoals(userId: string): Goal[] {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const key = this.getUserKey(userId, 'goals');
        const goals = this.storage.getItem<Goal[]>(key);

        if (goals && Array.isArray(goals)) {
          return this.sanitizeGoals(goals);
        }

        const initial = userId === 'mihir' ? INITIAL_GOALS : [];
        this.saveGoals(userId, initial);
        return initial;
      },
      [],
      'STORAGE',
      'getGoals'
    );
  }

  public saveGoals(userId: string, goals: Goal[]): void {
    errorService.tryExecute(
      () => {
        if (!userId) return;
        const key = this.getUserKey(userId, 'goals');
        const sanitized = this.sanitizeGoals(goals);
        this.storage.setItem(key, sanitized);
      },
      undefined,
      'STORAGE',
      'saveGoals'
    );
  }

  /** Filter out invalid goals, sanitize fields, clamp progress bounds [0, 100] */
  private sanitizeGoals(goals: Goal[]): Goal[] {
    if (!Array.isArray(goals)) return [];
    const seenIds = new Set<string>();
    const sanitized: Goal[] = [];

    for (const g of goals) {
      if (!g || typeof g !== 'object') continue;
      const id = String(g.id || `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const rawProgress = typeof g.currentProgress === 'number' ? g.currentProgress : (g as any).progress;
      const currentProgress = typeof rawProgress === 'number' ? Math.min(100, Math.max(0, rawProgress)) : 0;
      const category = (g.category as any) || 'Business';
      const timeframe = (g.timeframe as any) || 'Q3 2026';

      sanitized.push({
        ...g,
        id,
        title: String(g.title || 'Untitled Goal').trim(),
        category: ['Business', 'Health', 'Finance', 'Personal', 'Mindset'].includes(category) ? category : 'Business',
        timeframe: ['Q3 2026', 'Yearly', 'Monthly', 'Long-term'].includes(timeframe) ? timeframe : 'Q3 2026',
        targetDate: String(g.targetDate || new Date().toISOString().split('T')[0]),
        currentProgress,
        targetProgress: typeof g.targetProgress === 'number' ? g.targetProgress : 100,
        status: g.status || 'active',
      });
    }
    return sanitized;
  }
}

export const goalsService = new GoalsService();
