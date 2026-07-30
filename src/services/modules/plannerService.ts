/**
 * plannerService.ts
 * Independent Planner Service managing tasks, meetings, and quick notes.
 */
import { StorageFactory } from '../storage/StorageFactory';
import { Task, Meeting, Note } from '../../types';
import { INITIAL_TASKS, INITIAL_MEETINGS, INITIAL_NOTES, getTodayDateString } from '../../data/initialData';
import { errorService } from '../error/errorService';

export interface UserPlannerData {
  tasks: Task[];
  meetings: Meeting[];
  notes: Note[];
  taskSeededDate?: string;
}

export class PlannerService {
  private get storage() {
    return StorageFactory.getAdapter();
  }

  private getUserKey(userId: string, section: string): string {
    return `users/${userId}/${section}`;
  }

  public getPlannerData(userId: string): UserPlannerData {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const key = this.getUserKey(userId, 'planner');
        const isMihir = userId === 'mihir';
        const raw = this.storage.getItem<UserPlannerData>(key);

        if (raw && typeof raw === 'object') {
          if (!isMihir) {
            // Detect if non-Mihir user contains copied seed data
            const hasMihirTasks = (raw.tasks || []).some(
              (t) =>
                t.id?.startsWith('task-1') ||
                t.title?.includes('Q3 Product Strategy') ||
                t.title?.includes('Executive Board Briefing')
            );
            if (hasMihirTasks) {
              const cleaned: UserPlannerData = { tasks: [], meetings: [], notes: [] };
              this.storage.setItem(key, cleaned);
              return cleaned;
            }
          }
          return {
            tasks: this.sanitizeTasks(raw.tasks || []),
            meetings: this.sanitizeMeetings(raw.meetings || []),
            notes: this.sanitizeNotes(raw.notes || []),
            taskSeededDate: raw.taskSeededDate,
          };
        }

        const initial: UserPlannerData = {
          tasks: isMihir ? INITIAL_TASKS : [],
          meetings: isMihir ? INITIAL_MEETINGS : [],
          notes: isMihir ? INITIAL_NOTES : [],
        };
        this.storage.setItem(key, initial);
        return initial;
      },
      { tasks: [], meetings: [], notes: [] },
      'STORAGE',
      'getPlannerData'
    );
  }

  public savePlannerData(userId: string, data: UserPlannerData): void {
    errorService.tryExecute(
      () => {
        if (!userId) return;
        const key = this.getUserKey(userId, 'planner');
        const sanitized: UserPlannerData = {
          tasks: this.sanitizeTasks(data.tasks || []),
          meetings: this.sanitizeMeetings(data.meetings || []),
          notes: this.sanitizeNotes(data.notes || []),
          taskSeededDate: data.taskSeededDate,
        };
        this.storage.setItem(key, sanitized);
      },
      undefined,
      'STORAGE',
      'savePlannerData'
    );
  }

  public getTasks(userId: string): Task[] {
    const planner = this.getPlannerData(userId);
    const todayStr = getTodayDateString();
    const tasks = planner.tasks || [];

    const mappedTasks: Task[] = tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate || todayStr,
      status: t.status || 'todo',
      priority: t.priority || 'Medium',
      category: t.category || 'Business',
    }));

    if (userId === 'mihir' && planner.taskSeededDate !== todayStr) {
      const existingTodayTitles = new Set(
        mappedTasks
          .filter((t) => t.dueDate === todayStr)
          .map((t) => t.title.trim().toLowerCase())
      );

      for (const defTask of INITIAL_TASKS) {
        const normTitle = defTask.title.trim().toLowerCase();
        if (!existingTodayTitles.has(normTitle)) {
          mappedTasks.push({
            ...defTask,
            id: `task-def-${normTitle.replace(/[^a-z0-9]/g, '-')}-${todayStr}`,
            dueDate: todayStr,
            status: 'todo',
          });
          existingTodayTitles.add(normTitle);
        }
      }

      planner.tasks = mappedTasks;
      planner.taskSeededDate = todayStr;
      this.savePlannerData(userId, planner);
    }

    return mappedTasks;
  }

  public saveTasks(userId: string, tasks: Task[]): void {
    const planner = this.getPlannerData(userId);
    planner.tasks = tasks;
    this.savePlannerData(userId, planner);
  }

  public getMeetings(userId: string): Meeting[] {
    return this.getPlannerData(userId).meetings;
  }

  public saveMeetings(userId: string, meetings: Meeting[]): void {
    const planner = this.getPlannerData(userId);
    planner.meetings = meetings;
    this.savePlannerData(userId, planner);
  }

  public getNotes(userId: string): Note[] {
    return this.getPlannerData(userId).notes;
  }

  public saveNotes(userId: string, notes: Note[]): void {
    const planner = this.getPlannerData(userId);
    planner.notes = notes;
    this.savePlannerData(userId, planner);
  }

  // --- SANITIZATION HELPERS ---

  private sanitizeTasks(tasks: Task[]): Task[] {
    if (!Array.isArray(tasks)) return [];
    const seenIds = new Set<string>();
    const sanitized: Task[] = [];

    for (const t of tasks) {
      if (!t || typeof t !== 'object') continue;
      const id = String(t.id || `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      sanitized.push({
        ...t,
        id,
        title: String(t.title || 'Untitled Task').trim(),
        status: t.status === 'completed' || t.status === 'in_progress' ? t.status : 'todo',
        priority: t.priority || 'Medium',
        category: t.category || 'Business',
      });
    }
    return sanitized;
  }

  private sanitizeMeetings(meetings: Meeting[]): Meeting[] {
    if (!Array.isArray(meetings)) return [];
    const seenIds = new Set<string>();
    const sanitized: Meeting[] = [];

    for (const m of meetings) {
      if (!m || typeof m !== 'object') continue;
      const id = String(m.id || `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      sanitized.push({
        ...m,
        id,
        title: String(m.title || 'Untitled Meeting').trim(),
        time: String(m.time || '10:00 AM'),
      });
    }
    return sanitized;
  }

  private sanitizeNotes(notes: Note[]): Note[] {
    if (!Array.isArray(notes)) return [];
    const seenIds = new Set<string>();
    const sanitized: Note[] = [];

    for (const n of notes) {
      if (!n || typeof n !== 'object') continue;
      const id = String(n.id || `n_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      sanitized.push({
        ...n,
        id,
        title: String(n.title || 'Quick Note').trim(),
        content: String(n.content || '').trim(),
      });
    }
    return sanitized;
  }
}

export const plannerService = new PlannerService();
