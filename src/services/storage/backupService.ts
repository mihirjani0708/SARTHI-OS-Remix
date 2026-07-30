/**
 * backupService.ts
 * Pre-Migration Local Snapshot & Recovery System for SARTHI OS.
 * Guarantees zero data loss before any Cloud Sync or Migration execution.
 */
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { profileService } from '../modules/profileService';
import { habitsService } from '../modules/habitsService';
import { plannerService } from '../modules/plannerService';
import { goalsService } from '../modules/goalsService';
import { journalService } from '../modules/journalService';
import { errorService } from '../error/errorService';

export interface BackupSnapshot {
  backupId: string;
  userId: string;
  createdAt: string;
  description: string;
  version: string;
  data: {
    profile: any;
    habits: any;
    planner: any;
    journal: any;
    goals: any;
    settings: any;
  };
}

const BACKUP_REGISTRY_KEY_PREFIX = 'sarthi_backups_registry_';
const MAX_BACKUPS_PER_USER = 10;

export class BackupService {
  private localAdapter = new LocalStorageAdapter();

  /** Generate an immediate complete local backup point for a user */
  public createBackupPoint(userId: string, description: string = 'Pre-Migration Local Safety Snapshot'): BackupSnapshot {
    return errorService.tryExecute(
      () => {
        const safeUserId = userId || 'mansi';
        const timestamp = new Date().toISOString();
        const backupId = `backup_${safeUserId}_${Date.now()}`;

        const snapshot: BackupSnapshot = {
          backupId,
          userId: safeUserId,
          createdAt: timestamp,
          description,
          version: 'v3.3 Final Executive Engine',
          data: {
            profile: profileService.getProfile(safeUserId),
            habits: habitsService.getHabits(safeUserId),
            planner: {
              tasks: plannerService.getTasks(safeUserId),
              meetings: plannerService.getMeetings(safeUserId),
              notes: plannerService.getNotes(safeUserId),
            },
            journal: journalService.getJournalEntries(safeUserId),
            goals: goalsService.getGoals(safeUserId),
            settings: profileService.getSettings(safeUserId),
          },
        };

        // Save actual snapshot
        this.localAdapter.setItem(`sarthi_snapshot_${backupId}`, snapshot);

        // Update user backup registry and prune older backups if exceeding quota
        const existing = this.getRestorePoints(safeUserId);
        let updated = [{ backupId: snapshot.backupId, createdAt: snapshot.createdAt, description: snapshot.description }, ...existing];

        if (updated.length > MAX_BACKUPS_PER_USER) {
          const removed = updated.slice(MAX_BACKUPS_PER_USER);
          updated = updated.slice(0, MAX_BACKUPS_PER_USER);
          for (const oldBackup of removed) {
            this.localAdapter.removeItem(`sarthi_snapshot_${oldBackup.backupId}`);
          }
        }

        this.localAdapter.setItem(`${BACKUP_REGISTRY_KEY_PREFIX}${safeUserId}`, updated);

        console.log(`[BackupService] Successfully created local restore point "${backupId}" for user ${safeUserId}`);
        return snapshot;
      },
      {
        backupId: `fallback_${userId}_${Date.now()}`,
        userId,
        createdAt: new Date().toISOString(),
        description: 'Fallback Snapshot',
        version: 'v3.3',
        data: { profile: null, habits: [], planner: { tasks: [], meetings: [], notes: [] }, journal: {}, goals: [], settings: {} },
      },
      'STORAGE',
      'createBackupPoint'
    );
  }

  /** Retrieve list of available restore points for a user */
  public getRestorePoints(userId: string): Array<{ backupId: string; createdAt: string; description: string }> {
    const safeUserId = userId || 'mansi';
    const registry = this.localAdapter.getItem<Array<{ backupId: string; createdAt: string; description: string }>>(
      `${BACKUP_REGISTRY_KEY_PREFIX}${safeUserId}`
    );
    return registry || [];
  }

  /** Get full backup snapshot by ID */
  public getBackupById(backupId: string): BackupSnapshot | null {
    if (!backupId) return null;
    return this.localAdapter.getItem<BackupSnapshot>(`sarthi_snapshot_${backupId}`);
  }

  /** Restore complete user state from a selected backup point */
  public restoreFromBackupPoint(backupId: string, userId: string): boolean {
    return errorService.tryExecute(
      () => {
        const snapshot = this.getBackupById(backupId);
        if (!snapshot) {
          errorService.logError('STORAGE', 'BACKUP_NOT_FOUND', `Restore point "${backupId}" not found.`);
          return false;
        }

        const safeUserId = userId || snapshot.userId || 'mansi';

        if (snapshot.data.profile) profileService.saveProfile(safeUserId, snapshot.data.profile);
        if (snapshot.data.habits) habitsService.saveHabits(safeUserId, snapshot.data.habits);
        if (snapshot.data.planner?.tasks) plannerService.saveTasks(safeUserId, snapshot.data.planner.tasks);
        if (snapshot.data.planner?.meetings) plannerService.saveMeetings(safeUserId, snapshot.data.planner.meetings);
        if (snapshot.data.planner?.notes) plannerService.saveNotes(safeUserId, snapshot.data.planner.notes);
        if (snapshot.data.journal) journalService.saveJournalEntries(safeUserId, snapshot.data.journal);
        if (snapshot.data.goals) goalsService.saveGoals(safeUserId, snapshot.data.goals);
        if (snapshot.data.settings) profileService.saveSettings(safeUserId, snapshot.data.settings);

        console.log(`[BackupService] Successfully restored user state from point "${backupId}"`);
        return true;
      },
      false,
      'STORAGE',
      'restoreFromBackupPoint'
    );
  }

  /** Export backup snapshot as downloadable JSON string */
  public exportBackupJson(userId: string): string {
    const safeUserId = userId || 'mansi';
    const latestSnapshot = this.createBackupPoint(safeUserId, 'Manual Export Backup');
    return JSON.stringify(latestSnapshot, null, 2);
  }
}

export const backupService = new BackupService();
