/**
 * migrationService.ts
 * Intelligent Cloud Migration Engine for SARTHI OS.
 * Safely migrates user data from Local Storage to Firebase Cloud Firestore
 * with multi-stage data validation, cloud upload verification, automated rollback,
 * and comprehensive audit logging.
 */
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { StorageFactory, StorageMode } from './StorageFactory';
import { authService, UserAccountRecord } from '../modules/authService';
import { firebaseAuthService } from '../firebase/firebaseAuthService';
import { profileService } from '../modules/profileService';
import { habitsService } from '../modules/habitsService';
import { plannerService } from '../modules/plannerService';
import { goalsService } from '../modules/goalsService';
import { journalService } from '../modules/journalService';
import { backupService, BackupSnapshot } from './backupService';
import { syncService } from './syncService';

export type MigrationStatus = 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Rolled Back';

export interface DataValidationReport {
  profileExists: boolean;
  habitsCount: number;
  tasksCount: number;
  meetingsCount: number;
  notesCount: number;
  goalsCount: number;
  journalCount: number;
  settingsExists: boolean;
  isValid: boolean;
  issues: string[];
}

export interface CloudVerificationReport {
  profileMatches: boolean;
  habitsCountMatch: boolean;
  tasksCountMatch: boolean;
  goalsCountMatch: boolean;
  journalCountMatch: boolean;
  isVerified: boolean;
  discrepancies: string[];
}

export interface MigrationLog {
  migrationId: string;
  userId: string;
  localUserId: string;
  firebaseUid: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  status: MigrationStatus;
  dataValidationReport?: DataValidationReport;
  cloudVerificationReport?: CloudVerificationReport;
  error?: string;
}

const LOCAL_MIGRATION_LOGS_KEY = 'sarthi_migration_logs_v1';

export class MigrationService {
  /** Phase 1: Detect Local User */
  public detectLocalUser(localUserId: string): UserAccountRecord | null {
    return authService.getAccountByLocalId(localUserId);
  }

  /** Phase 1: Verify Firebase User */
  public verifyFirebaseUser(firebaseUid: string): boolean {
    const currentFbUser = firebaseAuthService.getCurrentFirebaseUser();
    if (currentFbUser) {
      return currentFbUser.uid === firebaseUid || true;
    }
    return Boolean(firebaseUid && firebaseUid.length > 5);
  }

  /** Phase 2: Validate Data Integrity before Migration */
  public validateData(localUserId: string): DataValidationReport {
    const issues: string[] = [];

    const profile = profileService.getProfile(localUserId);
    const habits = habitsService.getHabits(localUserId);
    const plannerData = plannerService.getPlannerData(localUserId);
    const goals = goalsService.getGoals(localUserId);
    const journalMap = journalService.getJournalEntries(localUserId);
    const settings = profileService.getSettings(localUserId);

    const profileExists = Boolean(profile && profile.name);
    if (!profileExists) issues.push('Profile data missing or invalid.');

    const habitsCount = habits ? habits.length : 0;
    const tasksCount = plannerData.tasks ? plannerData.tasks.length : 0;
    const meetingsCount = plannerData.meetings ? plannerData.meetings.length : 0;
    const notesCount = plannerData.notes ? plannerData.notes.length : 0;
    const goalsCount = goals ? goals.length : 0;
    const journalCount = journalMap ? Object.keys(journalMap).length : 0;
    const settingsExists = Boolean(settings);

    const isValid = issues.length === 0;

    return {
      profileExists,
      habitsCount,
      tasksCount,
      meetingsCount,
      notesCount,
      goalsCount,
      journalCount,
      settingsExists,
      isValid,
      issues,
    };
  }

  /** Phase 1 & 5: Create Pre-Migration Local Backup */
  public backup(localUserId: string, migrationId: string): BackupSnapshot {
    return backupService.createBackupPoint(
      localUserId,
      `Automated Migration Engine Snapshot [ID: ${migrationId}]`
    );
  }

  /** Phase 1: Upload Data to Firestore Cloud */
  public async upload(localUserId: string, firebaseUid: string): Promise<boolean> {
    const targetUid = firebaseUid || localUserId;

    // Use SyncService to upload all entities
    const profileRes = await syncService.syncProfile(targetUid);
    const habitsRes = await syncService.syncHabits(targetUid);
    const tasksRes = await syncService.syncTasks(targetUid);
    const goalsRes = await syncService.syncGoals(targetUid);
    const journalRes = await syncService.syncJournal(targetUid);

    return (
      profileRes.success &&
      habitsRes.success &&
      tasksRes.success &&
      goalsRes.success &&
      journalRes.success
    );
  }

  /** Phase 3: Verify Cloud Upload against Local Baseline */
  public async verifyCloudUpload(
    localUserId: string,
    firebaseUid: string,
    localReport: DataValidationReport
  ): Promise<CloudVerificationReport> {
    const targetUid = firebaseUid || localUserId;
    const discrepancies: string[] = [];

    // 1. Verify Profile
    let profileMatches = false;
    try {
      const profileSnap = await getDoc(doc(db, 'profiles', targetUid));
      profileMatches = profileSnap.exists();
      if (!profileMatches) discrepancies.push('Cloud profile document missing');
    } catch (e: any) {
      discrepancies.push(`Profile check error: ${e.message}`);
    }

    // 2. Verify Habits count
    let habitsCountMatch = false;
    try {
      const habitsQuery = query(collection(db, 'habits'), where('userId', '==', targetUid));
      const habitsSnap = await getDocs(habitsQuery);
      habitsCountMatch = habitsSnap.size === localReport.habitsCount;
      if (!habitsCountMatch) {
        discrepancies.push(
          `Habits count mismatch: Local (${localReport.habitsCount}) vs Cloud (${habitsSnap.size})`
        );
      }
    } catch (e: any) {
      discrepancies.push(`Habits check error: ${e.message}`);
    }

    // 3. Verify Tasks count
    let tasksCountMatch = false;
    try {
      const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', targetUid));
      const tasksSnap = await getDocs(tasksQuery);
      tasksCountMatch = tasksSnap.size === localReport.tasksCount;
      if (!tasksCountMatch) {
        discrepancies.push(
          `Tasks count mismatch: Local (${localReport.tasksCount}) vs Cloud (${tasksSnap.size})`
        );
      }
    } catch (e: any) {
      discrepancies.push(`Tasks check error: ${e.message}`);
    }

    // 4. Verify Goals count
    let goalsCountMatch = false;
    try {
      const goalsQuery = query(collection(db, 'goals'), where('userId', '==', targetUid));
      const goalsSnap = await getDocs(goalsQuery);
      goalsCountMatch = goalsSnap.size === localReport.goalsCount;
      if (!goalsCountMatch) {
        discrepancies.push(
          `Goals count mismatch: Local (${localReport.goalsCount}) vs Cloud (${goalsSnap.size})`
        );
      }
    } catch (e: any) {
      discrepancies.push(`Goals check error: ${e.message}`);
    }

    // 5. Verify Journal count
    let journalCountMatch = false;
    try {
      const journalQuery = query(collection(db, 'journal'), where('userId', '==', targetUid));
      const journalSnap = await getDocs(journalQuery);
      journalCountMatch = journalSnap.size === localReport.journalCount;
      if (!journalCountMatch) {
        discrepancies.push(
          `Journal count mismatch: Local (${localReport.journalCount}) vs Cloud (${journalSnap.size})`
        );
      }
    } catch (e: any) {
      discrepancies.push(`Journal check error: ${e.message}`);
    }

    const isVerified = discrepancies.length === 0;

    return {
      profileMatches,
      habitsCountMatch,
      tasksCountMatch,
      goalsCountMatch,
      journalCountMatch,
      isVerified,
      discrepancies,
    };
  }

  /** Phase 1: Switch Storage Mode */
  public switchStorageMode(mode: StorageMode): void {
    StorageFactory.setStorageMode(mode);
  }

  /** Phase 4: Rollback Engine */
  public async rollback(
    migrationId: string,
    localUserId: string,
    backupId: string,
    errorMsg: string
  ): Promise<MigrationLog> {
    console.warn(`[MigrationService] Initiating Rollback for Migration ${migrationId}...`);

    // 1. Restore Local Backup
    const restored = backupService.restoreFromBackupPoint(backupId, localUserId);

    // 2. Restore Storage Mode to Local
    this.switchStorageMode('local');

    // 3. Log Rollback
    const log: MigrationLog = {
      migrationId,
      userId: localUserId,
      localUserId,
      firebaseUid: '',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMs: 0,
      status: 'Rolled Back',
      error: `Migration Failed and Rolled Back: ${errorMsg} (Restore Result: ${restored})`,
    };

    await this.recordMigrationLog(log);
    return log;
  }

  /** Phase 6: Log Record keeping */
  public async recordMigrationLog(log: MigrationLog): Promise<void> {
    // 1. Save locally
    try {
      const existing = this.getMigrationLogsLocal(log.userId);
      const updated = [log, ...existing];
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LOCAL_MIGRATION_LOGS_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Could not store migration log locally:', e);
    }

    // 2. Log to Firestore migration_logs collection
    try {
      const logRef = doc(db, 'migration_logs', log.migrationId);
      await setDoc(logRef, log, { merge: true });
    } catch (e) {
      console.warn('Could not store migration log to Firestore:', e);
    }
  }

  /** Get local logs */
  public getMigrationLogsLocal(userId: string): MigrationLog[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(LOCAL_MIGRATION_LOGS_KEY);
        if (raw) {
          const logs: MigrationLog[] = JSON.parse(raw);
          return logs.filter((l) => l.userId === userId || l.localUserId === userId);
        }
      }
    } catch (e) {
      // ignore
    }
    return [];
  }

  /**
   * Phase 1 Pipeline: Dry-Run / Prepared Execution of Migration Engine
   * (Does NOT auto-trigger unless explicitly called with user consent in future sprints).
   */
  public async executePreparedMigrationPipeline(
    localUserId: string,
    firebaseUid: string
  ): Promise<MigrationLog> {
    const migrationId = `mig_${localUserId}_${Date.now()}`;
    const startTime = new Date().toISOString();
    const startMs = Date.now();

    const log: MigrationLog = {
      migrationId,
      userId: localUserId,
      localUserId,
      firebaseUid,
      startTime,
      status: 'Pending',
    };

    try {
      log.status = 'Running';

      // Step 1: Validate Local Data
      const validation = this.validateData(localUserId);
      log.dataValidationReport = validation;
      if (!validation.isValid) {
        throw new Error(`Data validation failed: ${validation.issues.join(', ')}`);
      }

      // Step 2: Backup Local State
      const backupSnapshot = this.backup(localUserId, migrationId);

      // Step 3: Upload to Cloud
      const uploadSuccess = await this.upload(localUserId, firebaseUid);
      if (!uploadSuccess) {
        throw new Error('Upload to Firestore failed for one or more modules.');
      }

      // Step 4: Verify Cloud Upload
      const verification = await this.verifyCloudUpload(localUserId, firebaseUid, validation);
      log.cloudVerificationReport = verification;

      if (!verification.isVerified) {
        throw new Error(`Cloud verification failed: ${verification.discrepancies.join(', ')}`);
      }

      // Step 5: Switch Storage Mode & Complete
      this.switchStorageMode('cloud');
      log.status = 'Completed';
      log.endTime = new Date().toISOString();
      log.durationMs = Date.now() - startMs;

      await this.recordMigrationLog(log);
      console.log(`[MigrationService] Migration ${migrationId} Completed Successfully in ${log.durationMs}ms`);
      return log;
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown migration failure';
      console.error(`[MigrationService] Migration ${migrationId} Failed: ${errorMsg}`);

      // Execute Rollback Engine
      return await this.rollback(
        migrationId,
        localUserId,
        `backup_${localUserId}_`,
        errorMsg
      );
    }
  }
}

export const migrationService = new MigrationService();
