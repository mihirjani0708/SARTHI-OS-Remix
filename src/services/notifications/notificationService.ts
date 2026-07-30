/**
 * notificationService.ts
 * Smart Notification & Reminder Engine for SARTHI OS (Sprint 5.9).
 * Enterprise-ready backend architecture for scheduling, cancellation, snoozing,
 * completion, priority queueing, recurrence calculation, and history logging.
 *
 * Future-ready adapters for FCM, Web Push, Android, and iOS notifications.
 */

import { StorageFactory } from '../storage/StorageFactory';
import { errorService } from '../error/errorService';
import {
  Reminder,
  ReminderModule,
  RepeatPattern,
  NotificationPriority,
  NotificationStatus,
  NotificationHistoryItem,
  IPushNotificationAdapter,
  PushPayload,
  Task,
  Habit,
  Meeting,
  Goal,
} from '../../types';

export type NotificationListener = (reminder: Reminder) => void;

// Priority Weight Mapping for Critical First Ordering
const PRIORITY_RANK: Record<NotificationPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  medium: 2,
  low: 1,
};

// --- FUTURE READY PUSH ADAPTER STUBS ---
export class LocalStubPushAdapter implements IPushNotificationAdapter {
  public platformName: 'local_stub' = 'local_stub';

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public async getToken(): Promise<string | null> {
    return 'local_stub_token_sarthi_v5.9';
  }

  public async sendPushNotification(payload: PushPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          tag: payload.tag,
        });
      } catch (err) {
        // Fallback quiet log
      }
    }
    return { success: true, messageId: `local_msg_${Date.now()}` };
  }
}

export class FCMPushAdapter implements IPushNotificationAdapter {
  public platformName: 'fcm' = 'fcm';

  public isSupported(): boolean {
    return true; // Configured for future cloud FCM integration
  }

  public async getToken(): Promise<string | null> {
    return 'fcm_cloud_token_placeholder';
  }

  public async sendPushNotification(payload: PushPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[FCMPushAdapter] [FUTURE_READY] Prepared FCM push payload:', payload);
    return { success: true, messageId: `fcm_msg_${Date.now()}` };
  }
}

export class WebPushAdapter implements IPushNotificationAdapter {
  public platformName: 'web_push' = 'web_push';

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  public async getToken(): Promise<string | null> {
    return 'web_push_vapid_token_placeholder';
  }

  public async sendPushNotification(payload: PushPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[WebPushAdapter] [FUTURE_READY] Prepared Web Push payload:', payload);
    return { success: true, messageId: `web_push_msg_${Date.now()}` };
  }
}

export class AndroidPushAdapter implements IPushNotificationAdapter {
  public platformName: 'android' = 'android';

  public isSupported(): boolean {
    return true; // Future ready for Android native wrapper
  }

  public async getToken(): Promise<string | null> {
    return 'android_device_token_placeholder';
  }

  public async sendPushNotification(payload: PushPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[AndroidPushAdapter] [FUTURE_READY] Prepared Android native notification payload:', payload);
    return { success: true, messageId: `android_msg_${Date.now()}` };
  }
}

export class IOSPushAdapter implements IPushNotificationAdapter {
  public platformName: 'ios' = 'ios';

  public isSupported(): boolean {
    return true; // Future ready for iOS APNs wrapper
  }

  public async getToken(): Promise<string | null> {
    return 'ios_apns_token_placeholder';
  }

  public async sendPushNotification(payload: PushPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[IOSPushAdapter] [FUTURE_READY] Prepared iOS APNs payload:', payload);
    return { success: true, messageId: `ios_msg_${Date.now()}` };
  }
}

export class NotificationService {
  private engineTimer: any = null;
  private listeners: Set<NotificationListener> = new Set();
  private pushAdapter: IPushNotificationAdapter = new LocalStubPushAdapter();

  private get storage() {
    return StorageFactory.getAdapter();
  }

  private getUserKey(userId: string, key: string): string {
    const activeUser = userId || 'mansi';
    return `sarthi_${activeUser}_${key}`;
  }

  // --- ADAPTER & LISTENER MANAGEMENT ---

  public registerPushAdapter(adapter: IPushNotificationAdapter): void {
    if (adapter) {
      this.pushAdapter = adapter;
    }
  }

  public getActivePushAdapter(): IPushNotificationAdapter {
    return this.pushAdapter;
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(reminder: Reminder): void {
    this.listeners.forEach((fn) => {
      try {
        fn(reminder);
      } catch (err) {
        // Safe listener invocation
      }
    });
  }

  // --- REMINDER STORAGE & RETRIEVAL ---

  public getReminders(userId: string): Reminder[] {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const key = this.getUserKey(userId, 'reminders');
        const raw = this.storage.getItem<Reminder[]>(key);
        if (Array.isArray(raw)) {
          return this.sanitizeReminders(raw, userId);
        }
        return [];
      },
      [],
      'STORAGE',
      'getReminders'
    );
  }

  public saveReminders(userId: string, reminders: Reminder[]): void {
    errorService.tryExecute(
      () => {
        if (!userId) return;
        const key = this.getUserKey(userId, 'reminders');
        const sanitized = this.sanitizeReminders(reminders, userId);
        this.storage.setItem(key, sanitized);
      },
      undefined,
      'STORAGE',
      'saveReminders'
    );
  }

  // --- DEVELOPER APIs (PHASE 8) & CORE OPERATIONS ---

  /**
   * API: createReminder - Schedule a new reminder with deduplication & validation
   */
  public createReminder(
    userId: string,
    input: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'userId'> & { id?: string; userId?: string; status?: NotificationStatus }
  ): Reminder {
    return this.scheduleReminder(userId, input);
  }

  /**
   * Schedule or update a reminder
   */
  public scheduleReminder(
    userId: string,
    input: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'userId'> & { id?: string; userId?: string; status?: NotificationStatus }
  ): Reminder {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const reminders = this.getReminders(userId);
        const nowIso = new Date().toISOString();

        // Deduplication check: Match targetEntityId or (module + title + scheduledTime)
        let existingIndex = -1;
        if (input.id) {
          existingIndex = reminders.findIndex((r) => r.id === input.id);
        } else if (input.targetEntityId) {
          existingIndex = reminders.findIndex((r) => r.targetEntityId === input.targetEntityId && r.status === 'pending');
        } else {
          existingIndex = reminders.findIndex(
            (r) => r.module === input.module && r.title === input.title && r.scheduledTime === input.scheduledTime && r.status === 'pending'
          );
        }

        const reminderId = input.id || (existingIndex >= 0 ? reminders[existingIndex].id : `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

        const newReminder: Reminder = {
          id: reminderId,
          userId,
          module: input.module || 'custom',
          targetEntityId: input.targetEntityId,
          title: String(input.title || 'Untitled Reminder').trim(),
          description: input.description ? String(input.description).trim() : undefined,
          priority: input.priority || 'medium',
          repeatPattern: input.repeatPattern || 'one_time',
          customRepeatDays: input.customRepeatDays,
          scheduledTime: input.scheduledTime || nowIso,
          status: input.status || 'pending',
          actionUrl: input.actionUrl,
          retryCount: input.retryCount || 0,
          createdAt: existingIndex >= 0 ? reminders[existingIndex].createdAt : nowIso,
          updatedAt: nowIso,
        };

        if (existingIndex >= 0) {
          reminders[existingIndex] = newReminder;
        } else {
          reminders.push(newReminder);
        }

        this.saveReminders(userId, reminders);
        return newReminder;
      },
      {
        id: `rem_err_${Date.now()}`,
        userId,
        module: 'custom',
        title: input.title || 'Reminder',
        priority: 'medium',
        repeatPattern: 'one_time',
        scheduledTime: input.scheduledTime || new Date().toISOString(),
        status: 'pending',
        retryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      'SYSTEM',
      'scheduleReminder'
    );
  }

  /**
   * API: updateReminder - Partially update an existing reminder
   */
  public updateReminder(userId: string, reminderId: string, updates: Partial<Reminder>): Reminder | null {
    return errorService.tryExecute(
      () => {
        if (!userId || !reminderId) return null;
        const reminders = this.getReminders(userId);
        const index = reminders.findIndex((r) => r.id === reminderId);
        if (index === -1) return null;

        const updated: Reminder = {
          ...reminders[index],
          ...updates,
          id: reminderId,
          userId,
          updatedAt: new Date().toISOString(),
        };

        reminders[index] = updated;
        this.saveReminders(userId, reminders);
        return updated;
      },
      null,
      'SYSTEM',
      'updateReminder'
    );
  }

  /**
   * API: deleteReminder - Permanently delete a reminder
   */
  public deleteReminder(userId: string, reminderId: string): boolean {
    return this.cancelReminder(userId, reminderId);
  }

  /**
   * Cancel / delete a reminder
   */
  public cancelReminder(userId: string, reminderId: string): boolean {
    return errorService.tryExecute(
      () => {
        if (!userId || !reminderId) return false;
        const reminders = this.getReminders(userId);
        const filtered = reminders.filter((r) => r.id !== reminderId);
        if (filtered.length !== reminders.length) {
          this.saveReminders(userId, filtered);
          return true;
        }
        return false;
      },
      false,
      'SYSTEM',
      'cancelReminder'
    );
  }

  /**
   * API: snoozeReminder - Snooze a reminder for specified minutes (default: 15)
   */
  public snoozeReminder(userId: string, reminderId: string, snoozeMinutes: number = 15): Reminder | null {
    return errorService.tryExecute(
      () => {
        if (!userId || !reminderId) return null;
        const reminders = this.getReminders(userId);
        const index = reminders.findIndex((r) => r.id === reminderId);
        if (index === -1) return null;

        const snoozeUntilTime = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString();
        const updated: Reminder = {
          ...reminders[index],
          status: 'snoozed',
          snoozeUntil: snoozeUntilTime,
          updatedAt: new Date().toISOString(),
        };

        reminders[index] = updated;
        this.saveReminders(userId, reminders);

        this.logHistoryEntry(userId, {
          reminderId: updated.id,
          userId,
          module: updated.module,
          type: updated.module,
          title: updated.title,
          priority: updated.priority,
          createdTime: updated.createdAt,
          scheduledTime: updated.scheduledTime,
          triggeredTime: updated.triggeredTime || new Date().toISOString(),
          actionTaken: 'snoozed',
          snoozed: true,
          retryCount: updated.retryCount || 0,
          details: `Snoozed for ${snoozeMinutes} minutes until ${snoozeUntilTime}`,
        });

        return updated;
      },
      null,
      'SYSTEM',
      'snoozeReminder'
    );
  }

  /**
   * API: markCompleted - Mark a reminder as completed
   */
  public markCompleted(userId: string, reminderId: string): Reminder | null {
    return this.completeReminder(userId, reminderId);
  }

  /**
   * Complete a reminder
   */
  public completeReminder(userId: string, reminderId: string): Reminder | null {
    return errorService.tryExecute(
      () => {
        if (!userId || !reminderId) return null;
        const reminders = this.getReminders(userId);
        const index = reminders.findIndex((r) => r.id === reminderId);
        if (index === -1) return null;

        const updated: Reminder = {
          ...reminders[index],
          status: 'completed',
          updatedAt: new Date().toISOString(),
        };

        reminders[index] = updated;
        this.saveReminders(userId, reminders);

        this.logHistoryEntry(userId, {
          reminderId: updated.id,
          userId,
          module: updated.module,
          type: updated.module,
          title: updated.title,
          priority: updated.priority,
          createdTime: updated.createdAt,
          scheduledTime: updated.scheduledTime,
          triggeredTime: updated.triggeredTime || new Date().toISOString(),
          actionTaken: 'completed',
          completed: true,
          retryCount: updated.retryCount || 0,
          details: 'Marked as completed by user',
        });

        return updated;
      },
      null,
      'SYSTEM',
      'completeReminder'
    );
  }

  /**
   * Reschedule a reminder to a specific new time
   */
  public rescheduleReminder(userId: string, reminderId: string, newScheduledTime: string): Reminder | null {
    return errorService.tryExecute(
      () => {
        if (!userId || !reminderId || !newScheduledTime) return null;
        const reminders = this.getReminders(userId);
        const index = reminders.findIndex((r) => r.id === reminderId);
        if (index === -1) return null;

        const updated: Reminder = {
          ...reminders[index],
          scheduledTime: newScheduledTime,
          status: 'pending',
          snoozeUntil: undefined,
          updatedAt: new Date().toISOString(),
        };

        reminders[index] = updated;
        this.saveReminders(userId, reminders);
        return updated;
      },
      null,
      'SYSTEM',
      'rescheduleReminder'
    );
  }

  /**
   * Dismiss a reminder
   */
  public dismissReminder(userId: string, reminderId: string): Reminder | null {
    return errorService.tryExecute(
      () => {
        if (!userId || !reminderId) return null;
        const reminders = this.getReminders(userId);
        const index = reminders.findIndex((r) => r.id === reminderId);
        if (index === -1) return null;

        const updated: Reminder = {
          ...reminders[index],
          status: 'dismissed',
          updatedAt: new Date().toISOString(),
        };

        reminders[index] = updated;
        this.saveReminders(userId, reminders);

        this.logHistoryEntry(userId, {
          reminderId: updated.id,
          userId,
          module: updated.module,
          type: updated.module,
          title: updated.title,
          priority: updated.priority,
          createdTime: updated.createdAt,
          scheduledTime: updated.scheduledTime,
          triggeredTime: updated.triggeredTime || new Date().toISOString(),
          actionTaken: 'dismissed',
          dismissed: true,
          retryCount: updated.retryCount || 0,
          details: 'Dismissed by user',
        });

        return updated;
      },
      null,
      'SYSTEM',
      'dismissReminder'
    );
  }

  /**
   * API: getUpcomingReminders - Get pending/snoozed reminders ordered by Priority then Time
   */
  public getUpcomingReminders(userId: string, limit: number = 10): Reminder[] {
    const pending = this.getPendingReminders(userId);
    return pending.slice(0, limit);
  }

  /**
   * API: getTodayReminders - Get reminders scheduled for today
   */
  public getTodayReminders(userId: string): Reminder[] {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const reminders = this.getReminders(userId);
        const todayStr = new Date().toISOString().split('T')[0];

        return reminders.filter((r) => r.scheduledTime && r.scheduledTime.startsWith(todayStr));
      },
      [],
      'SYSTEM',
      'getTodayReminders'
    );
  }

  /**
   * Get pending reminders ordered by Priority (Critical first), then Scheduled Time
   */
  public getPendingReminders(userId: string): Reminder[] {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const reminders = this.getReminders(userId);
        const nowIso = new Date().toISOString();

        const pending = reminders.filter((r) => {
          if (r.status === 'pending') return true;
          if (r.status === 'snoozed' && r.snoozeUntil && r.snoozeUntil <= nowIso) return true;
          return false;
        });

        // Priority Rank Sort: Critical (4) > High (3) > Normal/Medium (2) > Low (1)
        return pending.sort((a, b) => {
          const rankA = PRIORITY_RANK[a.priority] || 1;
          const rankB = PRIORITY_RANK[b.priority] || 1;
          if (rankA !== rankB) {
            return rankB - rankA; // Higher priority first
          }
          return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
        });
      },
      [],
      'SYSTEM',
      'getPendingReminders'
    );
  }

  // --- HISTORY MANAGEMENT ---

  public getHistory(userId: string): NotificationHistoryItem[] {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const key = this.getUserKey(userId, 'notification_history');
        const history = this.storage.getItem<NotificationHistoryItem[]>(key);
        return Array.isArray(history) ? history : [];
      },
      [],
      'STORAGE',
      'getHistory'
    );
  }

  public logHistoryEntry(
    userId: string,
    entry: Omit<NotificationHistoryItem, 'id' | 'actionTimestamp'>
  ): NotificationHistoryItem {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const history = this.getHistory(userId);
        const nowIso = new Date().toISOString();

        const item: NotificationHistoryItem = {
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          reminderId: entry.reminderId,
          userId,
          module: entry.module,
          type: entry.type || entry.module,
          title: entry.title,
          priority: entry.priority,
          createdTime: entry.createdTime || nowIso,
          scheduledTime: entry.scheduledTime,
          triggeredTime: entry.triggeredTime || nowIso,
          actionTaken: entry.actionTaken,
          actionTimestamp: nowIso,
          completed: entry.completed || entry.actionTaken === 'completed',
          dismissed: entry.dismissed || entry.actionTaken === 'dismissed',
          snoozed: entry.snoozed || entry.actionTaken === 'snoozed',
          retryCount: entry.retryCount || 0,
          details: entry.details,
        };

        // Keep last 100 history items
        const updatedHistory = [item, ...history].slice(0, 100);
        const key = this.getUserKey(userId, 'notification_history');
        this.storage.setItem(key, updatedHistory);

        return item;
      },
      {
        id: `hist_err_${Date.now()}`,
        reminderId: entry.reminderId,
        userId,
        module: entry.module,
        title: entry.title,
        priority: entry.priority,
        scheduledTime: entry.scheduledTime,
        triggeredTime: entry.triggeredTime || new Date().toISOString(),
        actionTaken: entry.actionTaken,
        actionTimestamp: new Date().toISOString(),
      },
      'STORAGE',
      'logHistoryEntry'
    );
  }

  public clearHistory(userId: string): void {
    errorService.tryExecute(
      () => {
        if (!userId) return;
        const key = this.getUserKey(userId, 'notification_history');
        this.storage.removeItem(key);
      },
      undefined,
      'STORAGE',
      'clearHistory'
    );
  }

  // --- BACKGROUND CHECK & REPEAT RESCHEDULING ---

  /**
   * Check for due reminders, trigger them, handle retries and recurring patterns
   */
  public checkAndTriggerReminders(userId: string = 'mansi'): Reminder[] {
    return errorService.tryExecute(
      () => {
        const reminders = this.getReminders(userId);
        const nowIso = new Date().toISOString();
        const triggered: Reminder[] = [];
        let hasChanges = false;

        for (let i = 0; i < reminders.length; i++) {
          const r = reminders[i];
          const isPendingDue = r.status === 'pending' && r.scheduledTime <= nowIso;
          const isSnoozedDue = r.status === 'snoozed' && r.snoozeUntil && r.snoozeUntil <= nowIso;

          if (isPendingDue || isSnoozedDue) {
            hasChanges = true;
            const currentRetryCount = (r.retryCount || 0) + 1;

            const updatedReminder: Reminder = {
              ...r,
              status: 'triggered',
              triggeredTime: nowIso,
              snoozeUntil: undefined,
              retryCount: currentRetryCount,
              updatedAt: nowIso,
            };

            reminders[i] = updatedReminder;
            triggered.push(updatedReminder);

            // Log history entry
            this.logHistoryEntry(userId, {
              reminderId: r.id,
              userId,
              module: r.module,
              type: r.module,
              title: r.title,
              priority: r.priority,
              createdTime: r.createdAt,
              scheduledTime: r.scheduledTime,
              triggeredTime: nowIso,
              actionTaken: 'triggered',
              retryCount: currentRetryCount,
              details: `Triggered at ${nowIso} (Priority: ${r.priority.toUpperCase()})`,
            });

            // Notify UI listeners
            this.notifyListeners(updatedReminder);

            // Send via Push Adapter (Local stub / FCM / Web Push)
            this.pushAdapter.sendPushNotification({
              title: `[${r.priority.toUpperCase()}] ${r.title}`,
              body: r.description || `Reminder for ${r.module}`,
              priority: r.priority,
              tag: r.id,
            });

            // Handle Recurring Reschedule if repeatPattern !== 'one_time' && repeatPattern !== 'once'
            if (r.repeatPattern !== 'one_time' && r.repeatPattern !== 'once') {
              this.rescheduleRepeatingReminder(userId, r);
            }
          }
        }

        if (hasChanges) {
          this.saveReminders(userId, reminders);
        }

        return triggered;
      },
      [],
      'SYSTEM',
      'checkAndTriggerReminders'
    );
  }

  private rescheduleRepeatingReminder(userId: string, original: Reminder): void {
    const nextScheduledDate = new Date(original.scheduledTime);
    if (isNaN(nextScheduledDate.getTime())) return;

    switch (original.repeatPattern) {
      case 'daily':
        nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
        break;
      case 'weekly':
        nextScheduledDate.setDate(nextScheduledDate.getDate() + 7);
        break;
      case 'monthly':
        nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1);
        break;
      case 'yearly':
        nextScheduledDate.setFullYear(nextScheduledDate.getFullYear() + 1);
        break;
      case 'weekdays':
        // Mon (1) to Fri (5). If Fri -> Mon (+3), if Sat -> Mon (+2)
        const dayOfWeek = nextScheduledDate.getDay(); // 0 is Sun, 6 is Sat
        if (dayOfWeek === 5) {
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 3);
        } else if (dayOfWeek === 6) {
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 2);
        } else {
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
        }
        break;
      case 'weekends':
        // Sat (6) & Sun (0). If Sat -> Sun (+1), if Sun -> Sat (+6)
        const dayW = nextScheduledDate.getDay();
        if (dayW === 6) {
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
        } else if (dayW === 0) {
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 6);
        } else {
          // If weekday, jump to upcoming Sat
          const diffToSat = 6 - dayW;
          nextScheduledDate.setDate(nextScheduledDate.getDate() + diffToSat);
        }
        break;
      case 'custom':
        const daysToAdd = original.customRepeatDays || 1;
        nextScheduledDate.setDate(nextScheduledDate.getDate() + daysToAdd);
        break;
      default:
        return;
    }

    this.scheduleReminder(userId, {
      module: original.module,
      targetEntityId: original.targetEntityId,
      title: original.title,
      description: original.description,
      priority: original.priority,
      repeatPattern: original.repeatPattern,
      customRepeatDays: original.customRepeatDays,
      scheduledTime: nextScheduledDate.toISOString(),
      actionUrl: original.actionUrl,
    });
  }

  // --- AUTOMATIC SYSTEM SYNC ---

  /**
   * Sync tasks, habits, meetings, goals into smart reminders automatically
   */
  public syncSystemEntityReminders(
    userId: string,
    entities: { tasks?: Task[]; habits?: Habit[]; meetings?: Meeting[]; goals?: Goal[] }
  ): void {
    errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';

        // 1. Tasks Sync
        if (Array.isArray(entities.tasks)) {
          entities.tasks.forEach((t) => {
            if (t.status !== 'completed' && t.dueDate) {
              const priority: NotificationPriority = t.priority === 'High' ? 'high' : t.priority === 'Medium' ? 'normal' : 'low';
              const timePart = t.time ? t.time : '09:00 AM';
              const scheduledIso = this.parseDateAndTimeToIso(t.dueDate, timePart);

              this.scheduleReminder(userId, {
                module: 'task',
                targetEntityId: t.id,
                title: `Task: ${t.title}`,
                description: `Category: ${t.category} | Priority: ${t.priority}`,
                priority,
                repeatPattern: 'one_time',
                scheduledTime: scheduledIso,
              });
            }
          });
        }

        // 2. Habits Sync
        if (Array.isArray(entities.habits)) {
          entities.habits.forEach((h) => {
            const timeStr = h.routine === 'morning' ? '08:00 AM' : '08:00 PM';
            const todayStr = new Date().toISOString().split('T')[0];
            const scheduledIso = this.parseDateAndTimeToIso(todayStr, timeStr);

            this.scheduleReminder(userId, {
              module: 'habit',
              targetEntityId: h.id,
              title: `Habit: ${h.name}`,
              description: `Streak: ${h.streak} days | Routine: ${h.routine || 'Daily'}`,
              priority: 'high',
              repeatPattern: 'daily',
              scheduledTime: scheduledIso,
            });
          });
        }

        // 3. Meetings Sync
        if (Array.isArray(entities.meetings)) {
          entities.meetings.forEach((m) => {
            if (!m.completed && m.time) {
              const todayStr = new Date().toISOString().split('T')[0];
              const scheduledIso = this.parseDateAndTimeToIso(todayStr, m.time);

              this.scheduleReminder(userId, {
                module: 'meeting',
                targetEntityId: m.id,
                title: `Meeting: ${m.title}`,
                description: `Duration: ${m.duration} | Type: ${m.type}`,
                priority: 'critical',
                repeatPattern: 'one_time',
                scheduledTime: scheduledIso,
              });
            }
          });
        }

        // 4. Goals Target Sync
        if (Array.isArray(entities.goals)) {
          entities.goals.forEach((g) => {
            if (g.status === 'active' && g.targetDate) {
              const scheduledIso = `${g.targetDate}T09:00:00.000Z`;
              this.scheduleReminder(userId, {
                module: 'goal',
                targetEntityId: g.id,
                title: `Goal Deadline: ${g.title}`,
                description: `Target Progress: ${g.currentProgress}/${g.targetProgress} ${g.unit || '%'}`,
                priority: 'high',
                repeatPattern: 'one_time',
                scheduledTime: scheduledIso,
              });
            }
          });
        }
      },
      undefined,
      'SYSTEM',
      'syncSystemEntityReminders'
    );
  }

  // --- ENGINE TIMER CONTROLS ---

  public startEngine(checkIntervalMs: number = 15000): void {
    if (this.engineTimer) return;
    this.engineTimer = setInterval(() => {
      this.checkAndTriggerReminders('mansi');
      this.checkAndTriggerReminders('mihir');
    }, checkIntervalMs);
  }

  public stopEngine(): void {
    if (this.engineTimer) {
      clearInterval(this.engineTimer);
      this.engineTimer = null;
    }
  }

  // --- HELPERS & SANITIZATION ---

  private sanitizeReminders(reminders: Reminder[], userId: string): Reminder[] {
    if (!Array.isArray(reminders)) return [];
    const seenIds = new Set<string>();
    const sanitized: Reminder[] = [];

    const validModules: ReminderModule[] = ['habit', 'task', 'planner', 'goal', 'meeting', 'birthday', 'journal', 'water', 'medicine', 'custom'];
    const validPatterns: RepeatPattern[] = ['one_time', 'once', 'daily', 'weekly', 'monthly', 'yearly', 'weekdays', 'weekends', 'custom'];
    const validPriorities: NotificationPriority[] = ['low', 'normal', 'medium', 'high', 'critical'];
    const validStatuses: NotificationStatus[] = ['pending', 'triggered', 'completed', 'dismissed', 'snoozed'];

    for (const r of reminders) {
      if (!r || typeof r !== 'object') continue;
      const id = String(r.id || `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const module = validModules.includes(r.module) ? r.module : 'custom';
      const repeatPattern = validPatterns.includes(r.repeatPattern) ? r.repeatPattern : 'one_time';
      const priority = validPriorities.includes(r.priority) ? r.priority : 'medium';
      const status = validStatuses.includes(r.status) ? r.status : 'pending';

      sanitized.push({
        ...r,
        id,
        userId: r.userId || userId,
        module,
        title: String(r.title || 'Untitled Reminder').trim(),
        priority,
        repeatPattern,
        scheduledTime: String(r.scheduledTime || new Date().toISOString()),
        status,
        retryCount: typeof r.retryCount === 'number' ? r.retryCount : 0,
        createdAt: String(r.createdAt || new Date().toISOString()),
        updatedAt: String(r.updatedAt || new Date().toISOString()),
      });
    }
    return sanitized;
  }

  private parseDateAndTimeToIso(dateStr: string, timeStr: string): string {
    try {
      if (!dateStr) dateStr = new Date().toISOString().split('T')[0];
      let hours = 9;
      let minutes = 0;

      if (timeStr) {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          const period = match[3] ? match[3].toUpperCase() : null;

          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        }
      }

      const d = new Date(dateStr);
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString();
    } catch (e) {
      return `${dateStr}T09:00:00.000Z`;
    }
  }
}

export const notificationService = new NotificationService();
