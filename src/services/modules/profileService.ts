/**
 * profileService.ts
 * Independent User Profile service managing profile data, executive titles, and settings.
 */
import { StorageFactory } from '../storage/StorageFactory';
import { UserProfile } from '../../types';
import { getDefaultUserProfile } from '../../data/initialData';
import { getSmartExecutiveTitle, getSmartExecutiveSubtitle } from '../../components/ProfileView';
import { errorService } from '../error/errorService';

export class ProfileService {
  private get storage() {
    return StorageFactory.getAdapter();
  }

  private getUserKey(userId: string, section: string): string {
    return `users/${userId}/${section}`;
  }

  public getProfile(userId: string): UserProfile {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const key = this.getUserKey(userId, 'profile');
        const profile = this.storage.getItem<UserProfile>(key);

        if (profile && typeof profile === 'object') {
          return this.sanitizeProfile(profile, userId);
        }

        const defaultProfile = getDefaultUserProfile(userId);
        this.saveProfile(userId, defaultProfile);
        return defaultProfile;
      },
      getDefaultUserProfile(userId || 'mansi'),
      'STORAGE',
      'getProfile'
    );
  }

  public saveProfile(userId: string, profile: UserProfile): void {
    errorService.tryExecute(
      () => {
        if (!userId) return;
        const key = this.getUserKey(userId, 'profile');
        const sanitized = this.sanitizeProfile(profile, userId);
        this.storage.setItem(key, sanitized);
      },
      undefined,
      'STORAGE',
      'saveProfile'
    );
  }

  public getExecutiveTitle(profileTypes?: string[], role?: string): string {
    return getSmartExecutiveTitle(profileTypes, role);
  }

  public getExecutiveSubtitle(profileTypes?: string[], role?: string): string {
    return getSmartExecutiveSubtitle(profileTypes, role);
  }

  public getSettings(userId: string): Record<string, any> {
    return errorService.tryExecute(
      () => {
        if (!userId) userId = 'mansi';
        const key = this.getUserKey(userId, 'settings');
        const settings = this.storage.getItem<Record<string, any>>(key);
        if (settings && typeof settings === 'object') return settings;

        const defaultSettings = {
          notificationsEnabled: true,
          darkMode: true,
          autoSync: false,
          aiCoachVoice: 'friendly',
        };
        this.saveSettings(userId, defaultSettings);
        return defaultSettings;
      },
      { notificationsEnabled: true, darkMode: true, autoSync: false, aiCoachVoice: 'friendly' },
      'STORAGE',
      'getSettings'
    );
  }

  public saveSettings(userId: string, settings: Record<string, any>): void {
    errorService.tryExecute(
      () => {
        if (!userId) return;
        const key = this.getUserKey(userId, 'settings');
        this.storage.setItem(key, settings || {});
      },
      undefined,
      'STORAGE',
      'saveSettings'
    );
  }

  private sanitizeProfile(profile: UserProfile, userId: string): UserProfile {
    const defaults = getDefaultUserProfile(userId);
    if (!profile || typeof profile !== 'object') return defaults;

    return {
      ...defaults,
      ...profile,
      name: String(profile.name || defaults.name).trim(),
      email: errorService.validateEmail(profile.email) ? profile.email.trim() : defaults.email,
      role: String(profile.role || defaults.role).trim(),
    };
  }
}

export const profileService = new ProfileService();
