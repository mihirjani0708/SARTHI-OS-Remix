/**
 * dataService.ts
 * Centralized Data Service Facade for SARTHI OS.
 * Connects UI and Contexts to modular services (Auth, Profile, Habits, Planner, Goals, Journal, Analytics)
 * backed by Storage Adapters (LocalStorageAdapter / CloudStorageAdapter via StorageFactory).
 */
import { Habit, Task, Meeting, Note, JournalEntry, UserProfile, Goal } from '../types';

// Import Modular Domain Services
import { profileService } from './modules/profileService';
import { habitsService } from './modules/habitsService';
import { plannerService } from './modules/plannerService';
import { goalsService } from './modules/goalsService';
import { journalService } from './modules/journalService';
import { StorageFactory } from './storage/StorageFactory';

export interface UserPlannerData {
  tasks: Task[];
  meetings: Meeting[];
  notes: Note[];
  taskSeededDate?: string;
}

export interface UserDataStore {
  profile: UserProfile;
  planner: UserPlannerData;
  habits: Habit[];
  journal: Record<string, JournalEntry>;
  goals: Goal[];
  settings: Record<string, any>;
}

function parseUserArgs<T>(arg1: any, arg2: any): { userId: string; data: T } {
  if (typeof arg1 === 'string') {
    return { userId: arg1, data: arg2 as T };
  } else {
    return { userId: arg2 as string, data: arg1 as T };
  }
}

export interface IDataService {
  getCurrentUser(userId: string): UserProfile;
  saveCurrentUser(userId: string, profile: UserProfile): void;
  saveCurrentUser(profile: UserProfile, userId: string): void;

  getTasks(userId: string): Task[];
  saveTasks(userId: string, tasks: Task[]): void;
  saveTasks(tasks: Task[], userId: string): void;

  getHabits(userId: string): Habit[];
  saveHabits(userId: string, habits: Habit[]): void;
  saveHabits(habits: Habit[], userId: string): void;

  getMeetings(userId: string): Meeting[];
  saveMeetings(userId: string, meetings: Meeting[]): void;
  saveMeetings(meetings: Meeting[], userId: string): void;

  getNotes(userId: string): Note[];
  saveNotes(userId: string, notes: Note[]): void;
  saveNotes(notes: Note[], userId: string): void;

  getJournalEntries(userId: string): Record<string, JournalEntry>;
  saveJournalEntries(userId: string, journal: Record<string, JournalEntry>): void;
  saveJournalEntries(journal: Record<string, JournalEntry>, userId: string): void;

  getGoals(userId: string): Goal[];
  saveGoals(userId: string, goals: Goal[]): void;
  saveGoals(goals: Goal[], userId: string): void;

  getSettings(userId: string): Record<string, any>;
  saveSettings(userId: string, settings: Record<string, any>): void;
  saveSettings(settings: Record<string, any>, userId: string): void;

  resetUserData(userId: string): void;
}

export class CentralDataServiceFacade implements IDataService {
  getCurrentUser(userId: string): UserProfile {
    return profileService.getProfile(userId);
  }

  saveCurrentUser(arg1: any, arg2: any): void {
    const { userId, data: profile } = parseUserArgs<UserProfile>(arg1, arg2);
    if (!userId) return;
    profileService.saveProfile(userId, profile);
  }

  getTasks(userId: string): Task[] {
    return plannerService.getTasks(userId);
  }

  saveTasks(arg1: any, arg2: any): void {
    const { userId, data: tasks } = parseUserArgs<Task[]>(arg1, arg2);
    if (!userId) return;
    plannerService.saveTasks(userId, tasks);
  }

  getHabits(userId: string): Habit[] {
    return habitsService.getHabits(userId);
  }

  saveHabits(arg1: any, arg2: any): void {
    const { userId, data: habits } = parseUserArgs<Habit[]>(arg1, arg2);
    if (!userId) return;
    habitsService.saveHabits(userId, habits);
  }

  getMeetings(userId: string): Meeting[] {
    return plannerService.getMeetings(userId);
  }

  saveMeetings(arg1: any, arg2: any): void {
    const { userId, data: meetings } = parseUserArgs<Meeting[]>(arg1, arg2);
    if (!userId) return;
    plannerService.saveMeetings(userId, meetings);
  }

  getNotes(userId: string): Note[] {
    return plannerService.getNotes(userId);
  }

  saveNotes(arg1: any, arg2: any): void {
    const { userId, data: notes } = parseUserArgs<Note[]>(arg1, arg2);
    if (!userId) return;
    plannerService.saveNotes(userId, notes);
  }

  getJournalEntries(userId: string): Record<string, JournalEntry> {
    return journalService.getJournalEntries(userId);
  }

  saveJournalEntries(arg1: any, arg2: any): void {
    const { userId, data: journal } = parseUserArgs<Record<string, JournalEntry>>(arg1, arg2);
    if (!userId) return;
    journalService.saveJournalEntries(userId, journal);
  }

  getGoals(userId: string): Goal[] {
    return goalsService.getGoals(userId);
  }

  saveGoals(arg1: any, arg2: any): void {
    const { userId, data: goals } = parseUserArgs<Goal[]>(arg1, arg2);
    if (!userId) return;
    goalsService.saveGoals(userId, goals);
  }

  getSettings(userId: string): Record<string, any> {
    return profileService.getSettings(userId);
  }

  saveSettings(arg1: any, arg2: any): void {
    const { userId, data: settings } = parseUserArgs<Record<string, any>>(arg1, arg2);
    if (!userId) return;
    profileService.saveSettings(userId, settings);
  }

  resetUserData(userId: string): void {
    if (!userId) return;
    const adapter = StorageFactory.getAdapter();
    adapter.clearUserData(userId);
  }
}

// Export singleton instance of centralized DataService
export const dataService: IDataService = new CentralDataServiceFacade();
