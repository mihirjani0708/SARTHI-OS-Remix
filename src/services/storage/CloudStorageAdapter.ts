/**
 * CloudStorageAdapter.ts
 * Cloud Storage Adapter implementation of IStorageAdapter utilizing Firestore.
 * Maintains local fallback caching and offline-first zero-latency UI performance.
 */
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { IStorageAdapter } from './IStorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

export interface CloudSyncStatus {
  isOnline: boolean;
  pendingQueueLength: number;
  lastSyncedAt?: string;
}

export class CloudStorageAdapter implements IStorageAdapter {
  private localAdapter: LocalStorageAdapter;
  private pendingSyncQueue: Array<{ key: string; value: any; timestamp: string }> = [];
  private isConnectedToCloud = false;

  constructor() {
    this.localAdapter = new LocalStorageAdapter();
  }

  getItem<T>(key: string): T | null {
    // Reads directly from primary cache for instant zero-latency UI rendering
    return this.localAdapter.getItem<T>(key);
  }

  setItem<T>(key: string, value: T): void {
    // Write locally first (Offline-first strategy)
    this.localAdapter.setItem<T>(key, value);

    // Queue for cloud background sync
    this.pendingSyncQueue.push({
      key,
      value,
      timestamp: new Date().toISOString(),
    });

    if (this.isConnectedToCloud) {
      this.flushSyncQueue();
    }
  }

  removeItem(key: string): void {
    this.localAdapter.removeItem(key);
  }

  clearUserData(userId: string): void {
    this.localAdapter.clearUserData(userId);
  }

  isCloudEnabled(): boolean {
    return this.isConnectedToCloud;
  }

  setCloudStatus(connected: boolean): void {
    this.isConnectedToCloud = connected;
    if (connected) {
      this.flushSyncQueue();
    }
  }

  getSyncStatus(): CloudSyncStatus {
    return {
      isOnline: this.isConnectedToCloud,
      pendingQueueLength: this.pendingSyncQueue.length,
      lastSyncedAt: new Date().toISOString(),
    };
  }

  private async flushSyncQueue(): Promise<void> {
    if (this.pendingSyncQueue.length === 0) return;

    const itemsToSync = [...this.pendingSyncQueue];
    this.pendingSyncQueue = [];

    for (const item of itemsToSync) {
      try {
        // Map storage keys like "users/mihir/planner" to Firestore document paths
        const docRef = doc(db, item.key);
        await setDoc(docRef, {
          data: item.value,
          updatedAt: item.timestamp,
        }, { merge: true });
      } catch (err) {
        console.warn(`[CloudStorageAdapter] Sync error for key "${item.key}":`, err);
        // Re-queue failed item
        this.pendingSyncQueue.push(item);
      }
    }
  }
}
