/**
 * searchService.ts
 * Universal Search Engine for SARTHI OS (Sprint 6.0).
 * Fast, intelligent, multi-module search indexing and query processing.
 *
 * Supports:
 * - Search across Tasks, Habits, Goals, Planner, Meetings, Journal, Notes, Notifications, Profile.
 * - Exact, Partial, Keyword, Case-Insensitive, Fuzzy Levenshtein Matching.
 * - Multi-criteria Filters (Module, Date, Priority, Status, Category, Tags).
 * - Multi-factor Ranking (Exact Match > Priority > Recency > Popularity/Frequency).
 * - Search History (Recent, Pinned, Popular/Most Used).
 * - High-performance local memory index caching.
 * - Future-ready Cloud Search Adapter architecture.
 */

import { CentralDataServiceFacade } from '../dataService';
import { notificationService } from '../notifications/notificationService';
import { StorageFactory } from '../storage/StorageFactory';
import { errorService } from '../error/errorService';
import {
  SearchModule,
  SearchFilters,
  SearchResult,
  SearchHistoryItem,
  PopularSearchItem,
  ISearchAdapter,
  Task,
  Habit,
  Goal,
  Meeting,
  JournalEntry,
  Note,
  UserProfile,
  Reminder,
} from '../../types';

// Central Data Service instance
const dataService = new CentralDataServiceFacade();

// Levenshtein Distance Helper for Fuzzy Search
function calcLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Snippet Extractor
function generateSnippet(text: string, query: string, maxLen: number = 90): string {
  if (!text) return '';
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  }

  const start = Math.max(0, index - 25);
  const end = Math.min(text.length, index + query.length + 55);
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet += '...';
  return snippet;
}

// Unified Index Item Schema
interface UnifiedIndexedItem {
  id: string;
  module: SearchModule;
  title: string;
  description: string;
  date?: string;
  priority: string;
  status: string;
  category: string;
  tags: string[];
  rawItem: any;
}

// --- FUTURE READY CLOUD SEARCH ADAPTER STUB ---
export class CloudSearchAdapter implements ISearchAdapter {
  public adapterName: 'cloud_search_stub' = 'cloud_search_stub';

  public async search(userId: string, query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    console.log('[CloudSearchAdapter] [FUTURE_READY] Executing cloud search delegation:', { userId, query, filters });
    // Delegate to local search engine as fallback while cloud mode remains inactive
    return searchService.search(userId, query, filters);
  }
}

export class SearchService {
  private cacheIndex: Map<string, { items: UnifiedIndexedItem[]; timestamp: number }> = new Map();
  private CACHE_TTL_MS = 10000; // 10s local index cache TTL
  private activeAdapter: ISearchAdapter | null = null;

  private get storage() {
    return StorageFactory.getAdapter();
  }

  private getUserKey(userId: string, key: string): string {
    const activeUser = userId || 'mansi';
    return `sarthi_${activeUser}_${key}`;
  }

  public registerSearchAdapter(adapter: ISearchAdapter): void {
    if (adapter) {
      this.activeAdapter = adapter;
    }
  }

  // --- LOCAL INDEX BUILDING ---

  public buildIndex(userId: string = 'mansi'): UnifiedIndexedItem[] {
    return errorService.tryExecute(
      () => {
        const cached = this.cacheIndex.get(userId);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
          return cached.items;
        }

        const indexed: UnifiedIndexedItem[] = [];

        // 1. Tasks
        const tasks: Task[] = dataService.getTasks(userId);
        if (Array.isArray(tasks)) {
          tasks.forEach((t) => {
            const extraTags = (t as any).tags && Array.isArray((t as any).tags) ? (t as any).tags : [];
            indexed.push({
              id: t.id,
              module: 'task',
              title: t.title || 'Untitled Task',
              description: `${t.time ? `Time: ${t.time} | ` : ''}${t.notes || ''} Category: ${t.category || 'General'}`.trim(),
              date: t.dueDate,
              priority: (t.priority || 'Medium').toLowerCase(),
              status: t.status === 'completed' ? 'completed' : 'pending',
              category: t.category || 'Task',
              tags: extraTags,
              rawItem: t,
            });
          });
        }

        // 2. Habits
        const habits: Habit[] = dataService.getHabits(userId);
        if (Array.isArray(habits)) {
          habits.forEach((h) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isDoneToday = Boolean(h.completedDates && h.completedDates[todayStr]);
            indexed.push({
              id: h.id,
              module: 'habit',
              title: h.name || 'Untitled Habit',
              description: `${h.description || ''} Streak: ${h.streak || 0} days | Routine: ${h.routine || 'Daily'}`,
              date: todayStr,
              priority: 'high',
              status: isDoneToday ? 'completed' : 'active',
              category: h.category || 'Habit',
              tags: h.routine ? [h.routine] : [],
              rawItem: h,
            });
          });
        }

        // 3. Goals
        const goals: Goal[] = dataService.getGoals(userId);
        if (Array.isArray(goals)) {
          goals.forEach((g) => {
            const priorityVal = (g as any).priority ? String((g as any).priority).toLowerCase() : 'high';
            indexed.push({
              id: g.id,
              module: 'goal',
              title: g.title || 'Untitled Goal',
              description: g.description || `Progress: ${g.currentProgress}/${g.targetProgress} ${g.unit || '%'}`,
              date: g.targetDate,
              priority: priorityVal,
              status: g.status || 'active',
              category: g.category || 'Goal',
              tags: Array.isArray(g.milestones) ? g.milestones.map((m) => m.title) : [],
              rawItem: g,
            });
          });
        }

        // 4. Planner Items & 5. Meetings
        const meetings: Meeting[] = dataService.getMeetings(userId);
        if (Array.isArray(meetings)) {
          meetings.forEach((m) => {
            const dateVal = (m as any).date || new Date().toISOString().split('T')[0];
            indexed.push({
              id: m.id,
              module: 'meeting',
              title: m.title || 'Untitled Meeting',
              description: `Time: ${m.time} | Duration: ${m.duration} | Type: ${m.type} | Notes: ${m.notes || ''}`,
              date: dateVal,
              priority: 'critical',
              status: m.completed ? 'completed' : 'pending',
              category: m.type || 'Meeting',
              tags: Array.isArray(m.attendees) ? m.attendees : [],
              rawItem: m,
            });

            // Also index under 'planner' module
            indexed.push({
              id: `planner_m_${m.id}`,
              module: 'planner',
              title: `Planner: ${m.title}`,
              description: `Meeting at ${m.time}`,
              date: dateVal,
              priority: 'high',
              status: m.completed ? 'completed' : 'pending',
              category: 'Meeting',
              tags: [],
              rawItem: m,
            });
          });
        }

        // 6. Journal Entries
        const journalMap = dataService.getJournalEntries(userId);
        if (journalMap && typeof journalMap === 'object') {
          Object.entries(journalMap).forEach(([dateKey, entry]) => {
            if (entry) {
              const textContent = entry.journalText || entry.learnings || (entry.gratitude ? entry.gratitude.join(', ') : '');
              const extraTags = (entry as any).tags && Array.isArray((entry as any).tags) ? (entry as any).tags : [];
              indexed.push({
                id: (entry as any).id || `journal_${dateKey}`,
                module: 'journal',
                title: `Journal (${dateKey})`,
                description: textContent,
                date: entry.date || dateKey,
                priority: 'medium',
                status: 'active',
                category: (entry as any).mood || 'Journal',
                tags: extraTags,
                rawItem: entry,
              });
            }
          });
        }

        // 7. Notes
        const notes: Note[] = dataService.getNotes(userId);
        if (Array.isArray(notes)) {
          notes.forEach((n) => {
            indexed.push({
              id: n.id,
              module: 'note',
              title: n.title || 'Untitled Note',
              description: n.content || '',
              date: n.updatedAt,
              priority: 'medium',
              status: 'active',
              category: (n as any).category || 'Notes',
              tags: n.tags || [],
              rawItem: n,
            });
          });
        }

        // 8. Notifications / Reminders
        const reminders: Reminder[] = notificationService.getReminders(userId);
        if (Array.isArray(reminders)) {
          reminders.forEach((r) => {
            indexed.push({
              id: r.id,
              module: 'notification',
              title: r.title || 'Reminder',
              description: r.description || `Module: ${r.module}`,
              date: r.scheduledTime,
              priority: r.priority || 'medium',
              status: r.status || 'pending',
              category: r.module,
              tags: [r.repeatPattern],
              rawItem: r,
            });
          });
        }

        // 9. Profile
        const profile: UserProfile = dataService.getCurrentUser(userId);
        if (profile) {
          const profileId = (profile as any).id || profile.uid || `profile_${userId}`;
          const displayName = (profile as any).fullName || profile.name || (profile as any).username || 'User Profile';
          const bioStr = (profile as any).bio || profile.role || '';
          const designationStr = (profile as any).designation || profile.role || '';
          const skillsList = (profile as any).skills || [];

          indexed.push({
            id: profileId,
            module: 'profile',
            title: displayName,
            description: `${profile.email || ''} ${bioStr} ${designationStr}`.trim(),
            date: (profile as any).updatedAt || profile.joinDate || new Date().toISOString(),
            priority: 'normal',
            status: 'active',
            category: 'Profile',
            tags: skillsList,
            rawItem: profile,
          });
        }

        this.cacheIndex.set(userId, { items: indexed, timestamp: Date.now() });
        return indexed;
      },
      [],
      'SYSTEM',
      'buildIndex'
    );
  }

  public invalidateIndexCache(userId?: string): void {
    if (userId) {
      this.cacheIndex.delete(userId);
    } else {
      this.cacheIndex.clear();
    }
  }

  // --- DEVELOPER API: UNIVERSAL SEARCH (PHASE 7) ---

  /**
   * Search across all modules with filters & ranking
   */
  public search(userId: string = 'mansi', query: string = '', filters?: SearchFilters): SearchResult[] {
    return errorService.tryExecute(
      () => {
        const cleanQuery = String(query || '').trim().toLowerCase();
        const indexedItems = this.buildIndex(userId);

        // Record history if non-empty query
        if (cleanQuery.length >= 2) {
          this.recordSearchQuery(userId, query.trim());
        }

        // Apply Module Filter
        let candidateItems = indexedItems;
        if (filters?.module) {
          if (Array.isArray(filters.module)) {
            const modulesSet = new Set(filters.module);
            candidateItems = candidateItems.filter((item) => modulesSet.has(item.module));
          } else if (filters.module !== 'all') {
            candidateItems = candidateItems.filter((item) => item.module === filters.module);
          }
        }

        // Apply Priority Filter
        if (filters?.priority) {
          const targetPriority = filters.priority.toLowerCase();
          candidateItems = candidateItems.filter((item) => item.priority === targetPriority);
        }

        // Apply Status Filter
        if (filters?.status) {
          const targetStatus = filters.status.toLowerCase();
          candidateItems = candidateItems.filter((item) => item.status === targetStatus);
        }

        // Apply Category Filter
        if (filters?.category) {
          const cat = filters.category.toLowerCase();
          candidateItems = candidateItems.filter((item) => item.category.toLowerCase().includes(cat));
        }

        // Apply Tags Filter
        if (filters?.tags && filters.tags.length > 0) {
          const filterTags = filters.tags.map((t) => t.toLowerCase());
          candidateItems = candidateItems.filter((item) =>
            item.tags.some((itemTag) => filterTags.includes(itemTag.toLowerCase()))
          );
        }

        // Apply Date Range Filter
        if (filters?.startDate || filters?.endDate) {
          candidateItems = candidateItems.filter((item) => {
            if (!item.date) return false;
            const itemDateStr = item.date.split('T')[0];
            if (filters.startDate && itemDateStr < filters.startDate) return false;
            if (filters.endDate && itemDateStr > filters.endDate) return false;
            return true;
          });
        }

        // If no search query provided, return recent/high priority items filtered
        if (!cleanQuery) {
          return candidateItems
            .map((item) => ({
              id: item.id,
              module: item.module,
              title: item.title,
              description: item.description,
              snippet: item.description ? item.description.substring(0, 80) : '',
              date: item.date,
              priority: item.priority,
              status: item.status,
              category: item.category,
              tags: item.tags,
              score: this.calculatePriorityScore(item.priority),
              matchedFields: [],
              item: item.rawItem,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);
        }

        // Execute Smart Matching & Scoring
        const results: SearchResult[] = [];
        const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

        for (const item of candidateItems) {
          const titleLower = item.title.toLowerCase();
          const descLower = item.description.toLowerCase();
          const catLower = item.category.toLowerCase();
          const tagsLower = item.tags.map((t) => t.toLowerCase()).join(' ');

          let score = 0;
          const matchedFields: string[] = [];

          // 1. Exact Title Match (+120)
          if (titleLower === cleanQuery) {
            score += 120;
            matchedFields.push('title_exact');
          } else if (titleLower.startsWith(cleanQuery)) {
            score += 80;
            matchedFields.push('title_prefix');
          } else if (titleLower.includes(cleanQuery)) {
            score += 60;
            matchedFields.push('title_substring');
          }

          // 2. Description Match (+35)
          if (descLower.includes(cleanQuery)) {
            score += 35;
            matchedFields.push('description');
          }

          // 3. Category / Tags Match (+25)
          if (catLower.includes(cleanQuery)) {
            score += 25;
            matchedFields.push('category');
          }
          if (tagsLower.includes(cleanQuery)) {
            score += 25;
            matchedFields.push('tags');
          }

          // 4. Tokenized Multi-word Matching
          if (queryTokens.length > 1) {
            let tokensMatched = 0;
            queryTokens.forEach((token) => {
              if (
                titleLower.includes(token) ||
                descLower.includes(token) ||
                catLower.includes(token) ||
                tagsLower.includes(token)
              ) {
                tokensMatched++;
              }
            });
            if (tokensMatched > 0) {
              score += tokensMatched * 15;
            }
          }

          // 5. Fuzzy Match (Levenshtein Distance for typo tolerance)
          if (score === 0 && cleanQuery.length >= 3) {
            const titleWords = titleLower.split(/\s+/);
            for (const word of titleWords) {
              if (Math.abs(word.length - cleanQuery.length) <= 2) {
                const dist = calcLevenshteinDistance(word, cleanQuery);
                if (dist <= 2) {
                  score += 20 - dist * 5; // Fuzzy score bonus
                  matchedFields.push('fuzzy_title');
                  break;
                }
              }
            }
          }

          // If item produced a match, apply Priority and Recency boosts
          if (score > 0) {
            // Priority Bonus
            score += this.calculatePriorityScore(item.priority);

            // Recency Bonus
            if (item.date) {
              const itemTime = new Date(item.date).getTime();
              const now = Date.now();
              const diffDays = (now - itemTime) / (1000 * 3600 * 24);
              if (diffDays >= 0 && diffDays <= 7) score += 15;
              else if (diffDays > 7 && diffDays <= 30) score += 5;
            }

            const snippet =
              generateSnippet(item.title, cleanQuery) || generateSnippet(item.description, cleanQuery);

            results.push({
              id: item.id,
              module: item.module,
              title: item.title,
              description: item.description,
              snippet,
              date: item.date,
              priority: item.priority,
              status: item.status,
              category: item.category,
              tags: item.tags,
              score,
              matchedFields,
              item: item.rawItem,
            });
          }
        }

        // Rank by final score descending
        return results.sort((a, b) => b.score - a.score);
      },
      [],
      'SYSTEM',
      'search'
    );
  }

  /**
   * DEVELOPER API: searchModule - Search within a specific module
   */
  public searchModule(
    userId: string = 'mansi',
    module: SearchModule,
    query: string = '',
    filters?: SearchFilters
  ): SearchResult[] {
    return this.search(userId, query, { ...filters, module });
  }

  private calculatePriorityScore(priority: string): number {
    switch ((priority || '').toLowerCase()) {
      case 'critical':
        return 25;
      case 'high':
        return 15;
      case 'normal':
      case 'medium':
        return 10;
      case 'low':
        return 5;
      default:
        return 0;
    }
  }

  // --- SEARCH HISTORY & POPULAR SEARCHES (PHASE 5) ---

  public getRecentSearches(userId: string = 'mansi'): SearchHistoryItem[] {
    return errorService.tryExecute(
      () => {
        const key = this.getUserKey(userId, 'search_history');
        const history = this.storage.getItem<SearchHistoryItem[]>(key);
        if (Array.isArray(history)) {
          return history.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
        }
        return [];
      },
      [],
      'STORAGE',
      'getRecentSearches'
    );
  }

  public getPopularSearches(userId: string = 'mansi'): PopularSearchItem[] {
    return errorService.tryExecute(
      () => {
        const history = this.getRecentSearches(userId);
        return history
          .map((item) => ({
            query: item.query,
            count: item.count || 1,
            lastSearched: item.timestamp,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      },
      [],
      'SYSTEM',
      'getPopularSearches'
    );
  }

  public recordSearchQuery(userId: string, query: string): void {
    errorService.tryExecute(
      () => {
        if (!userId || !query || query.trim().length < 2) return;
        const clean = query.trim();
        const history = this.getRecentSearches(userId);
        const nowIso = new Date().toISOString();

        const existingIdx = history.findIndex((h) => h.query.toLowerCase() === clean.toLowerCase());
        if (existingIdx >= 0) {
          history[existingIdx].count = (history[existingIdx].count || 1) + 1;
          history[existingIdx].timestamp = nowIso;
        } else {
          history.unshift({
            id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId,
            query: clean,
            timestamp: nowIso,
            pinned: false,
            count: 1,
          });
        }

        // Cap history at 50 entries
        const updated = history.slice(0, 50);
        const key = this.getUserKey(userId, 'search_history');
        this.storage.setItem(key, updated);
      },
      undefined,
      'STORAGE',
      'recordSearchQuery'
    );
  }

  public pinSearch(userId: string = 'mansi', query: string): void {
    errorService.tryExecute(
      () => {
        if (!query) return;
        const history = this.getRecentSearches(userId);
        const item = history.find((h) => h.query.toLowerCase() === query.trim().toLowerCase());
        if (item) {
          item.pinned = true;
          const key = this.getUserKey(userId, 'search_history');
          this.storage.setItem(key, history);
        }
      },
      undefined,
      'STORAGE',
      'pinSearch'
    );
  }

  public unpinSearch(userId: string = 'mansi', query: string): void {
    errorService.tryExecute(
      () => {
        if (!query) return;
        const history = this.getRecentSearches(userId);
        const item = history.find((h) => h.query.toLowerCase() === query.trim().toLowerCase());
        if (item) {
          item.pinned = false;
          const key = this.getUserKey(userId, 'search_history');
          this.storage.setItem(key, history);
        }
      },
      undefined,
      'STORAGE',
      'unpinSearch'
    );
  }

  public clearHistory(userId: string = 'mansi'): void {
    errorService.tryExecute(
      () => {
        const history = this.getRecentSearches(userId);
        // Retain pinned searches on clear
        const pinnedOnly = history.filter((h) => h.pinned);
        const key = this.getUserKey(userId, 'search_history');
        if (pinnedOnly.length > 0) {
          this.storage.setItem(key, pinnedOnly);
        } else {
          this.storage.removeItem(key);
        }
      },
      undefined,
      'STORAGE',
      'clearHistory'
    );
  }
}

export const searchService = new SearchService();
