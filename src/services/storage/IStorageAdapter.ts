/**
 * IStorageAdapter.ts
 * Storage Adapter Interface defining unified contracts for local and cloud persistence.
 */

export interface IStorageAdapter {
  /** Read item from storage */
  getItem<T>(key: string): T | null;
  /** Save item to storage */
  setItem<T>(key: string, value: T): void;
  /** Remove specific item from storage */
  removeItem(key: string): void;
  /** Clear all storage items for a given user */
  clearUserData(userId: string): void;
  /** Check if cloud sync is enabled for this adapter */
  isCloudEnabled(): boolean;
}
