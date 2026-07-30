/**
 * authService.ts
 * Independent Authentication service managing user sessions, registration, and user switching.
 */
import { StorageFactory } from '../storage/StorageFactory';
import { UserProfile } from '../../types';
import { errorService } from '../error/errorService';

export interface UserAccountRecord {
  uid: string; // Local User ID
  firebaseUid?: string; // Linked Firebase Auth UID
  name: string;
  email: string;
  phone: string;
  password?: string;
  authProvider?: 'local' | 'firebase_email' | 'google' | 'phone';
  createdAt: string;
  lastSyncedAt?: string;
}

const REGISTRY_KEY = 'sarthi_user_registry_v1';

export class AuthService {
  private get storage() {
    return StorageFactory.getAdapter();
  }

  public getRegistry(): UserAccountRecord[] {
    return errorService.tryExecute(
      () => {
        const registry = this.storage.getItem<UserAccountRecord[]>(REGISTRY_KEY);
        return Array.isArray(registry) ? registry : [];
      },
      [],
      'AUTH',
      'getRegistry'
    );
  }

  public saveRegistry(accounts: UserAccountRecord[]): void {
    errorService.tryExecute(
      () => {
        if (!Array.isArray(accounts)) return;
        this.storage.setItem(REGISTRY_KEY, accounts);
      },
      undefined,
      'AUTH',
      'saveRegistry'
    );
  }

  public getAccountByLocalId(localUserId: string): UserAccountRecord | null {
    if (!localUserId) return null;
    const registry = this.getRegistry();
    return registry.find((a) => a && a.uid === localUserId) || null;
  }

  public getAccountByFirebaseUid(firebaseUid: string): UserAccountRecord | null {
    if (!firebaseUid) return null;
    const registry = this.getRegistry();
    return registry.find((a) => a && a.firebaseUid === firebaseUid) || null;
  }

  public linkFirebaseAccount(
    localUserId: string,
    firebaseUid: string,
    provider: 'local' | 'firebase_email' | 'google' | 'phone' = 'firebase_email'
  ): UserAccountRecord | null {
    if (!localUserId || !firebaseUid) return null;
    const registry = this.getRegistry();
    const index = registry.findIndex((a) => a && a.uid === localUserId);
    if (index !== -1) {
      registry[index].firebaseUid = firebaseUid;
      registry[index].authProvider = provider;
      registry[index].lastSyncedAt = new Date().toISOString();
      this.saveRegistry(registry);
      return registry[index];
    }
    return null;
  }

  public getActiveSessionUserId(): string {
    return errorService.tryExecute(
      () => {
        if (typeof window === 'undefined') return '';
        return (
          localStorage.getItem('sarthi_auth_user') ||
          sessionStorage.getItem('sarthi_auth_user') ||
          localStorage.getItem('sarthi_active_session') ||
          ''
        );
      },
      '',
      'AUTH',
      'getActiveSessionUserId'
    );
  }

  public setActiveSession(userId: string, rememberMe: boolean = true): void {
    errorService.tryExecute(
      () => {
        if (typeof window === 'undefined') return;
        if (rememberMe) {
          localStorage.setItem('sarthi_auth_user', userId);
          localStorage.setItem('sarthi_active_session', userId);
          sessionStorage.removeItem('sarthi_auth_user');
          sessionStorage.removeItem('sarthi_active_session');
        } else {
          sessionStorage.setItem('sarthi_auth_user', userId);
          sessionStorage.setItem('sarthi_active_session', userId);
          localStorage.removeItem('sarthi_auth_user');
          localStorage.removeItem('sarthi_active_session');
        }
      },
      undefined,
      'AUTH',
      'setActiveSession'
    );
  }

  public clearSession(): void {
    errorService.tryExecute(
      () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('sarthi_auth_user');
        localStorage.removeItem('sarthi_active_session');
        sessionStorage.removeItem('sarthi_auth_user');
        sessionStorage.removeItem('sarthi_active_session');
      },
      undefined,
      'AUTH',
      'clearSession'
    );
  }
}

export const authService = new AuthService();
