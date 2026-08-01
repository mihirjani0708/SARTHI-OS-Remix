/**
 * smartSuggestionService.ts
 * Smart Suggestion & Auto-Complete Engine for SARTHI OS.
 * Provides fuzzy matching, case-insensitive search, preset suggestions,
 * and dynamic history learning across Habits, Tasks, Meetings, Goals, and Journal.
 */

export interface SuggestionItem {
  value: string;
  category?: string;
  icon?: string;
  isHistory?: boolean;
}

export type SuggestionType =
  | 'habit_name'
  | 'task_category'
  | 'priority'
  | 'planner_type'
  | 'goal_category'
  | 'journal_mood'
  | 'note_category';

export class SmartSuggestionService {
  private static instance: SmartSuggestionService;

  // Preset dictionaries
  private presets: Record<SuggestionType, SuggestionItem[]> = {
    habit_name: [
      { value: 'Gym', category: 'Body' },
      { value: 'Walking', category: 'Body' },
      { value: 'Meditation', category: 'Mind' },
      { value: 'Yoga', category: 'Body' },
      { value: 'Drink Water', category: 'Body' },
      { value: 'Reading', category: 'Mind' },
      { value: 'Prayer', category: 'Spirit' },
      { value: 'Exercise', category: 'Body' },
      { value: 'Running', category: 'Body' },
      { value: 'Stretching', category: 'Body' },
      { value: 'Journaling', category: 'Mind' },
      { value: 'Deep Work', category: 'Discipline' },
      { value: 'No Mobile Browsing', category: 'Discipline' },
      { value: 'Healthy Diet', category: 'Body' },
      { value: 'Early Wakeup', category: 'Discipline' },
    ],
    task_category: [
      { value: 'Office', category: 'Work' },
      { value: 'Personal', category: 'Life' },
      { value: 'Business', category: 'Work' },
      { value: 'Family', category: 'Life' },
      { value: 'Health', category: 'Life' },
      { value: 'Finance', category: 'Life' },
      { value: 'Shopping', category: 'Life' },
      { value: 'Travel', category: 'Life' },
      { value: 'Education', category: 'Mind' },
      { value: 'Tech', category: 'Work' },
      { value: 'Fitness', category: 'Body' },
    ],
    priority: [
      { value: 'High', category: 'Urgent' },
      { value: 'Medium', category: 'Normal' },
      { value: 'Low', category: 'Routine' },
    ],
    planner_type: [
      { value: 'Meeting', category: 'Work' },
      { value: 'Call', category: 'Work' },
      { value: 'Reminder', category: 'Personal' },
      { value: 'Travel', category: 'Life' },
      { value: 'Shopping', category: 'Life' },
      { value: 'Follow-up', category: 'Work' },
      { value: 'Payment', category: 'Finance' },
      { value: 'Review', category: 'Work' },
      { value: 'Appointment', category: 'Personal' },
      { value: 'Brainstorming', category: 'Work' },
    ],
    goal_category: [
      { value: 'Business', category: 'Career' },
      { value: 'Career', category: 'Career' },
      { value: 'Finance', category: 'Life' },
      { value: 'Health', category: 'Life' },
      { value: 'Learning', category: 'Mind' },
      { value: 'Relationship', category: 'Life' },
      { value: 'Spiritual', category: 'Spirit' },
      { value: 'Fitness', category: 'Body' },
      { value: 'Personal Growth', category: 'Mind' },
    ],
    journal_mood: [
      { value: 'Happy', category: 'Positive' },
      { value: 'Excited', category: 'Positive' },
      { value: 'Normal', category: 'Neutral' },
      { value: 'Tired', category: 'Low Energy' },
      { value: 'Sad', category: 'Low Energy' },
      { value: 'Motivated', category: 'Positive' },
      { value: 'Stressed', category: 'High Energy' },
      { value: 'Calm Mind', category: 'Positive' },
      { value: 'Grateful', category: 'Positive' },
      { value: 'Focus', category: 'Positive' },
    ],
    note_category: [
      { value: 'Work', category: 'Work' },
      { value: 'Personal', category: 'Life' },
      { value: 'Ideas', category: 'Mind' },
      { value: 'Projects', category: 'Work' },
      { value: 'Meeting Notes', category: 'Work' },
      { value: 'Strategy', category: 'Business' },
      { value: 'Research', category: 'Mind' },
    ],
  };

  private userHistory: Record<SuggestionType, Set<string>> = {
    habit_name: new Set(),
    task_category: new Set(),
    priority: new Set(),
    planner_type: new Set(),
    goal_category: new Set(),
    journal_mood: new Set(),
    note_category: new Set(),
  };

  public static getInstance(): SmartSuggestionService {
    if (!SmartSuggestionService.instance) {
      SmartSuggestionService.instance = new SmartSuggestionService();
    }
    return SmartSuggestionService.instance;
  }

  /**
   * Adds a newly entered custom string into dynamic user history for future auto-complete.
   */
  public addHistory(type: SuggestionType, value: string): void {
    if (!value || value.trim().length === 0) return;
    this.userHistory[type].add(value.trim());
  }

  /**
   * Get filtered suggestions matching query using prefix and fuzzy matching.
   */
  public getSuggestions(type: SuggestionType, query: string = '', limit: number = 8): SuggestionItem[] {
    const cleanQuery = query.toLowerCase().trim();
    const presetItems = this.presets[type] || [];
    const historyItems = Array.from(this.userHistory[type] || []).map((val) => ({
      value: val,
      category: 'Recent',
      isHistory: true,
    }));

    // Combine history items first, followed by presets (avoiding duplicates)
    const combinedMap = new Map<string, SuggestionItem>();
    
    // Add history items
    historyItems.forEach((item) => combinedMap.set(item.value.toLowerCase(), item));

    // Add preset items
    presetItems.forEach((item) => {
      if (!combinedMap.has(item.value.toLowerCase())) {
        combinedMap.set(item.value.toLowerCase(), item);
      }
    });

    const allItems = Array.from(combinedMap.values());

    if (!cleanQuery) {
      return allItems.slice(0, limit);
    }

    // Relevance scoring:
    // 1. Exact prefix match = highest priority
    // 2. Substring match = medium priority
    // 3. Fuzzy character sequence match = lower priority
    const scored = allItems.map((item) => {
      const valLower = item.value.toLowerCase();
      let score = 0;

      if (valLower === cleanQuery) {
        score = 100;
      } else if (valLower.startsWith(cleanQuery)) {
        score = 80 + (10 - Math.min(10, valLower.length));
      } else if (valLower.includes(cleanQuery)) {
        score = 50;
      } else if (this.fuzzyMatch(cleanQuery, valLower)) {
        score = 30;
      }

      return { item, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item)
      .slice(0, limit);
  }

  /**
   * Simple fuzzy string match helper.
   */
  private fuzzyMatch(query: string, text: string): boolean {
    let qIdx = 0;
    let tIdx = 0;
    while (qIdx < query.length && tIdx < text.length) {
      if (query[qIdx] === text[tIdx]) {
        qIdx++;
      }
      tIdx++;
    }
    return qIdx === query.length;
  }
}

export const smartSuggestionService = SmartSuggestionService.getInstance();
