/**
 * StorageFactory.ts
 * Factory and registry manager for Storage Adapters.
 * Allows seamless switching between LocalStorageAdapter and CloudStorageAdapter using a single variable.
 */
import { IStorageAdapter } from './IStorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { CloudStorageAdapter } from './CloudStorageAdapter';
import { DEFAULT_STORAGE_MODE } from '../../config/firebase';

export type StorageMode = 'local' | 'cloud' | 'hybrid';

export class StorageFactory {
  private static localAdapter: LocalStorageAdapter = new LocalStorageAdapter();
  private static cloudAdapter: CloudStorageAdapter = new CloudStorageAdapter();
  // Single configuration variable default from config/firebase.ts
  private static currentMode: StorageMode = DEFAULT_STORAGE_MODE;

  public static getAdapter(): IStorageAdapter {
    switch (this.currentMode) {
      case 'cloud':
      case 'hybrid':
        return this.cloudAdapter;
      case 'local':
      default:
        return this.localAdapter;
    }
  }

  public static setStorageMode(mode: StorageMode): void {
    this.currentMode = mode;
    if (mode === 'cloud' || mode === 'hybrid') {
      this.cloudAdapter.setCloudStatus(true);
    }
    console.log(`StorageFactory: Storage mode set to "${mode}"`);
  }

  public static getStorageMode(): StorageMode {
    return this.currentMode;
  }
}
