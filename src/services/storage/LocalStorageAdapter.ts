/**
 * LocalStorageAdapter.ts
 * Standard LocalStorage implementation of IStorageAdapter with automatic quota management,
 * error handling, and legacy cleanup.
 */
import { IStorageAdapter } from './IStorageAdapter';

export class LocalStorageAdapter implements IStorageAdapter {
  private memoryFallback: Map<string, string> = new Map();

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private cleanupLegacyKeys(): void {
    if (!this.isLocalStorageAvailable()) return;
    const legacyKeys = [
      'sarthi_users_db',
      'sarthi_profile_v1',
      'sarthi_tasks_v3',
      'sarthi_tasks_last_seeded_date_v1',
      'sarthi_habits_v1',
      'sarthi_meetings_v1',
      'sarthi_notes_v1',
      'sarthi_journal_v1',
      'sarthi_goals_v1',
      'sarthi_settings_v1',
    ];
    for (const k of legacyKeys) {
      try {
        window.localStorage.removeItem(k);
      } catch (e) {
        // ignore
      }
    }
  }

  getItem<T>(key: string): T | null {
    if (this.isLocalStorageAvailable()) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          return JSON.parse(raw) as T;
        }
      } catch (e) {
        console.warn(`LocalStorageAdapter: Error reading key "${key}"`, e);
      }
    }
    if (this.memoryFallback.has(key)) {
      try {
        return JSON.parse(this.memoryFallback.get(key)!) as T;
      } catch {
        return null;
      }
    }
    return null;
  }

  setItem<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value);
    if (this.isLocalStorageAvailable()) {
      try {
        const existing = window.localStorage.getItem(key);
        if (existing === serialized) return; // Skip redundant writes
        window.localStorage.setItem(key, serialized);
        return;
      } catch (e) {
        console.warn(`LocalStorageAdapter: Quota or write error for key "${key}"`, e);
        this.cleanupLegacyKeys();
        try {
          window.localStorage.setItem(key, serialized);
          return;
        } catch (retryErr) {
          console.error(`LocalStorageAdapter: Memory fallback used for key "${key}"`, retryErr);
        }
      }
    }
    this.memoryFallback.set(key, serialized);
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        // ignore
      }
    }
    this.memoryFallback.delete(key);
  }

  clearUserData(userId: string): void {
    if (!userId || !this.isLocalStorageAvailable()) return;
    const prefix = `users/${userId}/`;
    try {
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          window.localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  isCloudEnabled(): boolean {
    return false;
  }
}
