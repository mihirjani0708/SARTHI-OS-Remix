/**
 * firebaseAnalyticsService.ts
 * Analytics event tracking service architecture for SARTHI OS.
 * Prepared for Firebase Analytics logging without sending premature events.
 */
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../config/firebase';

export type SarthiAnalyticsEvent =
  | 'app_open'
  | 'login'
  | 'signup'
  | 'logout'
  | 'habit_complete'
  | 'task_created'
  | 'goal_created'
  | 'journal_entry'
  | 'profile_completed'
  | 'session_start'
  | 'session_end';

export class FirebaseAnalyticsService {
  private isEnabled = true;

  /** Log structured OS analytics event */
  public trackEvent(eventName: SarthiAnalyticsEvent, eventParams: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    if (analytics) {
      try {
        logEvent(analytics, eventName as string, {
          timestamp: new Date().toISOString(),
          ...eventParams,
        });
      } catch (err) {
        console.warn(`[Analytics] Event logging skipped (${eventName}):`, err);
      }
    } else {
      // Prepared architecture debug logger
      console.log(`[Analytics Ready] Track Event: "${eventName}"`, eventParams);
    }
  }

  public setAnalyticsEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

export const firebaseAnalyticsService = new FirebaseAnalyticsService();
