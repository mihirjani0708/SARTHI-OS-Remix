/**
 * commandPaletteService.ts
 * Global Command Palette Service for SARTHI OS (Sprint 6.1).
 *
 * Provides:
 * - Quick Actions Registry & Execution
 * - Keyboard Shortcut Mappings (Ctrl/Cmd + K, Up/Down, Enter, Esc, Tab)
 * - Integration with Universal SearchEngine (searchService)
 * - Recent, Pinned, and Frequently Used Command Persistence
 * - Future AI & Cloud Search Readiness Stubs
 */

import { searchService } from '../search/searchService';
import { StorageFactory } from '../storage/StorageFactory';
import { errorService } from '../error/errorService';
import {
  CommandItem,
  CommandGroup,
  SearchResult,
  SearchHistoryItem,
  SearchModule,
} from '../../types';

export class CommandPaletteService {
  private storage = StorageFactory.getAdapter();

  private getUserKey(userId: string, key: string): string {
    const activeUser = userId || 'mansi';
    return `sarthi_${activeUser}_cmd_${key}`;
  }

  /**
   * Default System Quick Actions Registry
   */
  public getDefaultQuickActions(): CommandItem[] {
    return [
      {
        id: 'action_create_task',
        title: 'Create Task',
        description: 'Add a new priority task to your daily planner',
        category: 'quick_action',
        shortcut: '⌘T',
        iconName: 'PlusCircle',
        keywords: ['task', 'todo', 'add', 'create', 'planner', 'action'],
        module: 'task',
        actionId: 'create_task',
      },
      {
        id: 'action_create_habit',
        title: 'Create Habit',
        description: 'Start tracking a new daily habit & streak',
        category: 'quick_action',
        shortcut: '⌘H',
        iconName: 'Flame',
        keywords: ['habit', 'routine', 'streak', 'daily', 'add'],
        module: 'habit',
        actionId: 'create_habit',
      },
      {
        id: 'action_create_goal',
        title: 'Create Goal',
        description: 'Set a strategic objective with target milestone date',
        category: 'quick_action',
        shortcut: '⌘G',
        iconName: 'Target',
        keywords: ['goal', 'target', 'milestone', 'objective', 'sprint'],
        module: 'goal',
        actionId: 'create_goal',
      },
      {
        id: 'action_open_planner',
        title: 'Open Planner',
        description: 'View daily timeline, tasks, meetings & notes',
        category: 'navigation',
        shortcut: '⌘P',
        iconName: 'Calendar',
        keywords: ['planner', 'calendar', 'schedule', 'today', 'timeline'],
        module: 'planner',
        actionId: 'open_planner',
      },
      {
        id: 'action_open_journal',
        title: 'Open Journal',
        description: 'Reflect on learnings, mood & gratitude entries',
        category: 'navigation',
        shortcut: '⌘J',
        iconName: 'BookOpen',
        keywords: ['journal', 'reflection', 'learnings', 'diary', 'mood'],
        module: 'journal',
        actionId: 'open_journal',
      },
      {
        id: 'action_add_note',
        title: 'Add Note',
        description: 'Jot down a quick note or quick thought',
        category: 'quick_action',
        shortcut: '⌘N',
        iconName: 'FileText',
        keywords: ['note', 'memo', 'idea', 'scratchpad', 'write'],
        module: 'note',
        actionId: 'add_note',
      },
      {
        id: 'action_create_reminder',
        title: 'Create Reminder',
        description: 'Schedule a time-based notification alert',
        category: 'quick_action',
        shortcut: '⌘R',
        iconName: 'Bell',
        keywords: ['reminder', 'alert', 'notification', 'alarm', 'schedule'],
        module: 'notification',
        actionId: 'create_reminder',
      },
      {
        id: 'action_open_ai_coach',
        title: 'Open AI Assistant',
        description: 'Launch SARTHI Executive AI Coach workspace',
        category: 'ai_tools',
        shortcut: '⌘A',
        iconName: 'Sparkles',
        keywords: ['ai', 'coach', 'sarthi', 'assistant', 'chat', 'intelligence'],
        module: 'system',
        actionId: 'open_ai_coach',
      },
      {
        id: 'action_open_profile',
        title: 'Open Profile',
        description: 'View stats, bio, skills and profile settings',
        category: 'navigation',
        shortcut: '⌘U',
        iconName: 'User',
        keywords: ['profile', 'user', 'stats', 'bio', 'account'],
        module: 'profile',
        actionId: 'open_profile',
      },
      {
        id: 'action_open_settings',
        title: 'Open Settings',
        description: 'Manage preferences, language & storage mode',
        category: 'navigation',
        shortcut: '⌘S',
        iconName: 'Settings',
        keywords: ['settings', 'preferences', 'configuration', 'language'],
        module: 'system',
        actionId: 'open_settings',
      },
      {
        id: 'action_toggle_frame',
        title: 'Toggle Device Frame',
        description: 'Switch between Responsive Desktop & Mobile Shell views',
        category: 'quick_action',
        shortcut: '⌘M',
        iconName: 'Smartphone',
        keywords: ['mobile', 'desktop', 'frame', 'view', 'layout'],
        module: 'system',
        actionId: 'toggle_frame',
      },
    ];
  }

  /**
   * Record execution of a quick action command for popularity & recency tracking
   */
  public recordCommandExecution(userId: string, commandId: string): void {
    errorService.tryExecute(
      () => {
        if (!userId || !commandId) return;
        const key = this.getUserKey(userId, 'execution_history');
        const historyMap = this.storage.getItem<Record<string, { count: number; lastUsed: string }>>(key) || {};

        const current = historyMap[commandId] || { count: 0, lastUsed: new Date().toISOString() };
        historyMap[commandId] = {
          count: current.count + 1,
          lastUsed: new Date().toISOString(),
        };

        this.storage.setItem(key, historyMap);
      },
      undefined,
      'STORAGE',
      'recordCommandExecution'
    );
  }

  /**
   * Get Pinned Command IDs
   */
  public getPinnedCommandIds(userId: string): string[] {
    return errorService.tryExecute(
      () => {
        const key = this.getUserKey(userId, 'pinned_commands');
        return this.storage.getItem<string[]>(key) || ['action_create_task'];
      },
      [],
      'STORAGE',
      'getPinnedCommandIds'
    );
  }

  /**
   * Toggle Pin state of a quick action command
   */
  public togglePinCommand(userId: string, commandId: string): string[] {
    return errorService.tryExecute(
      () => {
        const pinned = this.getPinnedCommandIds(userId);
        const exists = pinned.includes(commandId);
        const updated = exists ? pinned.filter((id) => id !== commandId) : [...pinned, commandId];
        const key = this.getUserKey(userId, 'pinned_commands');
        this.storage.setItem(key, updated);
        return updated;
      },
      [],
      'STORAGE',
      'togglePinCommand'
    );
  }

  /**
   * Search & Group Commands & Universal Content
   */
  public searchCommandPalette(
    userId: string = 'mansi',
    query: string = '',
    activeModuleFilter?: string
  ): CommandGroup[] {
    return errorService.tryExecute(
      () => {
        const cleanQuery = query.trim().toLowerCase();
        const allQuickActions = this.getDefaultQuickActions();
        const pinnedIds = this.getPinnedCommandIds(userId);
        const execHistory = this.storage.getItem<Record<string, { count: number; lastUsed: string }>>(
          this.getUserKey(userId, 'execution_history')
        ) || {};

        // Enhance quick actions with frequency & pinned status
        const enrichedActions: CommandItem[] = allQuickActions.map((act) => ({
          ...act,
          pinned: pinnedIds.includes(act.id),
          frequency: execHistory[act.id]?.count || 0,
          lastUsed: execHistory[act.id]?.lastUsed,
        }));

        const groups: CommandGroup[] = [];

        // --- SCENARIO A: EMPTY QUERY (Show Pinned, Quick Actions, Frequently Used, Recent Searches) ---
        if (!cleanQuery) {
          // 1. Pinned Commands
          const pinnedActions = enrichedActions.filter((a) => a.pinned);
          if (pinnedActions.length > 0) {
            groups.push({
              id: 'group_pinned',
              title: '📌 Pinned Commands',
              items: pinnedActions,
            });
          }

          // 2. All Quick Actions
          groups.push({
            id: 'group_quick_actions',
            title: '⚡ Quick Actions',
            items: enrichedActions,
          });

          // 3. Recent Searches (from searchService)
          const recentSearches: SearchHistoryItem[] = searchService.getRecentSearches(userId);
          if (recentSearches.length > 0) {
            const recentSearchItems: CommandItem[] = recentSearches.slice(0, 5).map((rs) => ({
              id: `search_hist_${rs.id}`,
              title: rs.query,
              description: `Recent Search (${new Date(rs.timestamp).toLocaleDateString()})`,
              category: 'recent',
              iconName: 'History',
              keywords: [rs.query],
              actionId: 'replay_search',
              pinned: rs.pinned,
            }));

            groups.push({
              id: 'group_recent_searches',
              title: '🕒 Recent Searches',
              items: recentSearchItems,
            });
          }

          return groups;
        }

        // --- SCENARIO B: WITH SEARCH QUERY ---
        // 1. Filter Quick Actions
        const matchedActions = enrichedActions.filter((action) => {
          const inTitle = action.title.toLowerCase().includes(cleanQuery);
          const inDesc = action.description ? action.description.toLowerCase().includes(cleanQuery) : false;
          const inKw = action.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery));
          return inTitle || inDesc || inKw;
        });

        if (matchedActions.length > 0) {
          groups.push({
            id: 'group_matched_actions',
            title: '⚡ Matching Actions',
            items: matchedActions,
          });
        }

        // 2. Query Universal Search Engine across indexed modules
        const searchFilters: any = {};
        if (activeModuleFilter && activeModuleFilter !== 'all') {
          searchFilters.module = activeModuleFilter as SearchModule;
        }

        const universalResults: SearchResult[] = searchService.search(userId, query, searchFilters);

        if (universalResults.length > 0) {
          // Group search results by module or present in unified ranked group
          if (activeModuleFilter && activeModuleFilter !== 'all') {
            groups.push({
              id: `group_module_${activeModuleFilter}`,
              title: `🔍 Results in ${activeModuleFilter.toUpperCase()}`,
              items: universalResults,
            });
          } else {
            // Segment into top categories if many, or single search results group
            const topResults = universalResults.slice(0, 15);
            groups.push({
              id: 'group_search_results',
              title: `🔍 Universal Search Results (${universalResults.length})`,
              items: topResults,
            });
          }
        }

        return groups;
      },
      [],
      'SYSTEM',
      'searchCommandPalette'
    );
  }

  // --- FUTURE READY STUBS FOR AI & CLOUD SEARCH (PHASE 8) ---

  /**
   * FUTURE READY: Voice Command Processing Stub
   */
  public processVoiceCommand(userId: string, transcript: string): { recognizedAction?: string; responseMessage: string } {
    console.log('[CommandPaletteService] [FUTURE_READY] Processing voice command transcript:', transcript);
    const clean = transcript.toLowerCase();
    if (clean.includes('task') || clean.includes('add task')) {
      return { recognizedAction: 'create_task', responseMessage: 'Creating a new task from voice prompt.' };
    }
    if (clean.includes('journal') || clean.includes('note')) {
      return { recognizedAction: 'open_journal', responseMessage: 'Opening journal reflections.' };
    }
    return { responseMessage: `Voice recognized: "${transcript}". Querying command palette...` };
  }

  /**
   * FUTURE READY: Natural Language Search Query Parser Stub
   */
  public parseNaturalLanguageQuery(query: string): { intent: string; extractedEntities: Record<string, string> } {
    console.log('[CommandPaletteService] [FUTURE_READY] Parsing NL query:', query);
    return {
      intent: 'universal_query',
      extractedEntities: { query },
    };
  }
}

export const commandPaletteService = new CommandPaletteService();
