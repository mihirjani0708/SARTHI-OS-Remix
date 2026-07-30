import { Habit, Task, Meeting, Note, JournalEntry, UserProfile, Goal } from '../types';
import { dataService } from '../services/dataService';

export function loadHabits(userId: string): Habit[] {
  return dataService.getHabits(userId);
}

export function saveHabits(userId: string, habits: Habit[]): void {
  dataService.saveHabits(userId, habits);
}

export function loadTasks(userId: string): Task[] {
  return dataService.getTasks(userId);
}

export function saveTasks(userId: string, tasks: Task[]): void {
  dataService.saveTasks(userId, tasks);
}

export function loadMeetings(userId: string): Meeting[] {
  return dataService.getMeetings(userId);
}

export function saveMeetings(userId: string, meetings: Meeting[]): void {
  dataService.saveMeetings(userId, meetings);
}

export function loadNotes(userId: string): Note[] {
  return dataService.getNotes(userId);
}

export function saveNotes(userId: string, notes: Note[]): void {
  dataService.saveNotes(userId, notes);
}

export function loadJournal(userId: string): Record<string, JournalEntry> {
  return dataService.getJournalEntries(userId);
}

export function saveJournal(userId: string, journal: Record<string, JournalEntry>): void {
  dataService.saveJournalEntries(userId, journal);
}

export function loadGoals(userId: string): Goal[] {
  return dataService.getGoals(userId);
}

export function saveGoals(userId: string, goals: Goal[]): void {
  dataService.saveGoals(userId, goals);
}

export function loadProfile(userId: string): UserProfile {
  return dataService.getCurrentUser(userId);
}

export function saveProfile(userId: string, profile: UserProfile): void {
  dataService.saveCurrentUser(userId, profile);
}

export function resetAllData(userId: string): void {
  dataService.resetUserData(userId);
}
