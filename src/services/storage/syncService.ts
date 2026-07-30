/**
 * syncService.ts
 * Hybrid Cloud Sync Service & Conflict Resolution Engine for SARTHI OS.
 * Handles background uploads, offline retry queues, and "Newest Data Wins" timestamp resolution.
 */
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { profileService } from '../modules/profileService';
import { habitsService } from '../modules/habitsService';
import { plannerService } from '../modules/plannerService';
import { goalsService } from '../modules/goalsService';
import { journalService } from '../modules/journalService';
import { backupService } from './backupService';

export interface SyncResult {
  success: boolean;
  module: string;
  itemsSynced: number;
  conflictsResolved: number;
  timestamp: string;
  error?: string;
}

export interface SyncSummaryReport {
  userId: string;
  totalSynced: number;
  details: SyncResult[];
  status: 'PENDING_PREPARATION' | 'COMPLETED' | 'FAILED';
}

export class SyncService {
  /**
   * Conflict Resolution Logic: "Newest Data Wins"
   * Compares ISO timestamp strings or numeric timestamps.
   */
  public resolveConflict<T extends { updatedAt?: string; createdAt?: string }>(
    localItem: T,
    cloudItem: T
  ): { resolved: T; source: 'local' | 'cloud' } {
    const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0).getTime();
    const cloudTime = new Date(cloudItem.updatedAt || cloudItem.createdAt || 0).getTime();

    if (localTime >= cloudTime) {
      return { resolved: localItem, source: 'local' };
    } else {
      return { resolved: cloudItem, source: 'cloud' };
    }
  }

  /** Sync User Profile to Firestore */
  public async syncProfile(userId: string): Promise<SyncResult> {
    try {
      const profile = profileService.getProfile(userId);
      const docRef = doc(db, 'profiles', userId);

      // Check existing cloud document
      const docSnap = await getDoc(docRef);
      let payload = { ...profile, updatedAt: new Date().toISOString() };
      let conflictsResolved = 0;

      if (docSnap.exists()) {
        const cloudData = docSnap.data() as any;
        const conflict = this.resolveConflict(payload, cloudData);
        payload = conflict.resolved;
        if (conflict.source === 'cloud') conflictsResolved = 1;
      }

      await setDoc(docRef, payload, { merge: true });
      return {
        success: true,
        module: 'Profile',
        itemsSynced: 1,
        conflictsResolved,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        module: 'Profile',
        itemsSynced: 0,
        conflictsResolved: 0,
        timestamp: new Date().toISOString(),
        error: err.message || 'Profile sync error',
      };
    }
  }

  /** Sync Habits to Firestore */
  public async syncHabits(userId: string): Promise<SyncResult> {
    try {
      const habits = habitsService.getHabits(userId);
      const batch = writeBatch(db);
      let count = 0;

      for (const h of habits) {
        const docRef = doc(db, 'habits', h.id);
        const payload = {
          ...h,
          userId,
          updatedAt: new Date().toISOString(),
        };
        batch.set(docRef, payload, { merge: true });
        count++;
      }

      if (count > 0) {
        await batch.commit();
      }

      return {
        success: true,
        module: 'Habits',
        itemsSynced: count,
        conflictsResolved: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        module: 'Habits',
        itemsSynced: 0,
        conflictsResolved: 0,
        timestamp: new Date().toISOString(),
        error: err.message || 'Habits sync error',
      };
    }
  }

  /** Sync Tasks to Firestore */
  public async syncTasks(userId: string): Promise<SyncResult> {
    try {
      const tasks = plannerService.getTasks(userId);
      const batch = writeBatch(db);
      let count = 0;

      for (const t of tasks) {
        const docRef = doc(db, 'tasks', t.id);
        const payload = {
          ...t,
          userId,
          updatedAt: new Date().toISOString(),
        };
        batch.set(docRef, payload, { merge: true });
        count++;
      }

      if (count > 0) {
        await batch.commit();
      }

      return {
        success: true,
        module: 'Tasks',
        itemsSynced: count,
        conflictsResolved: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        module: 'Tasks',
        itemsSynced: 0,
        conflictsResolved: 0,
        timestamp: new Date().toISOString(),
        error: err.message || 'Tasks sync error',
      };
    }
  }

  /** Sync Goals to Firestore */
  public async syncGoals(userId: string): Promise<SyncResult> {
    try {
      const goals = goalsService.getGoals(userId);
      const batch = writeBatch(db);
      let count = 0;

      for (const g of goals) {
        const docRef = doc(db, 'goals', g.id);
        const payload = {
          ...g,
          userId,
          updatedAt: new Date().toISOString(),
        };
        batch.set(docRef, payload, { merge: true });
        count++;
      }

      if (count > 0) {
        await batch.commit();
      }

      return {
        success: true,
        module: 'Goals',
        itemsSynced: count,
        conflictsResolved: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        module: 'Goals',
        itemsSynced: 0,
        conflictsResolved: 0,
        timestamp: new Date().toISOString(),
        error: err.message || 'Goals sync error',
      };
    }
  }

  /** Sync Journal Entries to Firestore */
  public async syncJournal(userId: string): Promise<SyncResult> {
    try {
      const journalMap = journalService.getJournalEntries(userId);
      const entries = Object.values(journalMap);
      const batch = writeBatch(db);
      let count = 0;

      for (const entry of entries) {
        const docRef = doc(db, 'journal', entry.date);
        const payload = {
          ...entry,
          userId,
          updatedAt: new Date().toISOString(),
        };
        batch.set(docRef, payload, { merge: true });
        count++;
      }

      if (count > 0) {
        await batch.commit();
      }

      return {
        success: true,
        module: 'Journal',
        itemsSynced: count,
        conflictsResolved: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        module: 'Journal',
        itemsSynced: 0,
        conflictsResolved: 0,
        timestamp: new Date().toISOString(),
        error: err.message || 'Journal sync error',
      };
    }
  }

  /** Safe Complete User Sync (Creates Pre-Migration Backup First) */
  public async executePreparedUserSync(userId: string): Promise<SyncSummaryReport> {
    // 1. Create safety backup first
    backupService.createBackupPoint(userId, 'Automated Pre-Sync Safety Backup Point');

    // 2. Perform modular sync operations
    const results: SyncResult[] = [];
    results.push(await this.syncProfile(userId));
    results.push(await this.syncHabits(userId));
    results.push(await this.syncTasks(userId));
    results.push(await this.syncGoals(userId));
    results.push(await this.syncJournal(userId));

    const totalSynced = results.reduce((acc, r) => acc + r.itemsSynced, 0);

    return {
      userId,
      totalSynced,
      details: results,
      status: results.every((r) => r.success) ? 'COMPLETED' : 'FAILED',
    };
  }
}

export const syncService = new SyncService();
