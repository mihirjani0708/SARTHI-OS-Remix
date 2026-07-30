/**
 * verifySprint61_CommandPalette.ts
 * Comprehensive Verification Audit Script for Sprint 6.1 - Global Command Palette (Spotlight Experience).
 */

import { commandPaletteService } from '../src/services/command/commandPaletteService';
import { searchService } from '../src/services/search/searchService';
import { CentralDataServiceFacade } from '../src/services/dataService';

const dataService = new CentralDataServiceFacade();

async function runCommandPaletteAudit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 6.1 GLOBAL COMMAND PALETTE AUDIT');
  console.log('================================================================\n');

  const testUserId = 'audit-user-61';

  // --- PHASE 1: QUICK ACTIONS REGISTRY AUDIT ---
  console.log('[PHASE 1] Testing Default Quick Actions Registry...');
  const quickActions = commandPaletteService.getDefaultQuickActions();
  console.log('✓ Registered Quick Actions Count:', quickActions.length);

  const requiredActionIds = [
    'create_task',
    'create_habit',
    'create_goal',
    'open_planner',
    'open_journal',
    'add_note',
    'create_reminder',
    'open_ai_coach',
    'open_profile',
    'open_settings',
  ];

  requiredActionIds.forEach((actionId) => {
    const found = quickActions.some((a) => a.actionId === actionId);
    if (!found) {
      throw new Error(`Missing required quick action: ${actionId}`);
    }
  });
  console.log('✓ All 10 Required Quick Actions Verified!');


  // --- PHASE 2: COMMAND PINNING & FREQUENCY AUDIT ---
  console.log('\n[PHASE 2] Testing Command Pinning & Execution Frequency Tracking...');

  // Record execution
  commandPaletteService.recordCommandExecution(testUserId, 'action_create_task');
  commandPaletteService.recordCommandExecution(testUserId, 'action_create_task');

  // Toggle Pin
  commandPaletteService.togglePinCommand(testUserId, 'action_open_ai_coach');
  const pinnedList = commandPaletteService.getPinnedCommandIds(testUserId);
  console.log('✓ Pinned Command List:', pinnedList);
  if (!pinnedList.includes('action_open_ai_coach')) {
    throw new Error('Command pinning failed!');
  }


  // --- PHASE 3: EMPTY QUERY COMMAND GROUPS (Spotlight Home State) ---
  console.log('\n[PHASE 3] Testing Spotlight Default View (Empty Query)...');

  const defaultGroups = commandPaletteService.searchCommandPalette(testUserId, '');
  console.log('✓ Empty Query Generated Groups Count:', defaultGroups.length);

  const groupTitles = defaultGroups.map((g) => g.title);
  console.log('✓ Group Titles:', groupTitles);

  const hasQuickActionGroup = defaultGroups.some((g) => g.id === 'group_quick_actions');
  if (!hasQuickActionGroup) {
    throw new Error('Empty query failed to display Quick Actions group!');
  }


  // --- PHASE 4: COMMAND PALETTE SEARCH & SEARCH ENGINE INTEGRATION ---
  console.log('\n[PHASE 4] Testing Search Matching & Universal Search Engine Integration...');

  // Seed sample task and note
  dataService.saveTasks(
    [
      {
        id: 't-6101',
        title: 'Prepare Q3 Strategic Growth Presentation',
        completed: false,
        priority: 'High',
        dueDate: '2026-08-15',
        category: 'Strategy',
        tags: ['q3', 'growth'],
      },
    ],
    testUserId
  );

  searchService.invalidateIndexCache(testUserId);

  // 1. Action Keyword Search
  const actionMatchGroups = commandPaletteService.searchCommandPalette(testUserId, 'task');
  console.log('✓ Query "task" Matched Groups Count:', actionMatchGroups.length);

  const taskActionFound = actionMatchGroups.some((g) =>
    g.items.some((item) => item.title.toLowerCase().includes('task'))
  );
  if (!taskActionFound) {
    throw new Error('Command palette search failed to match task actions or results!');
  }

  // 2. Universal Search Result Integration
  const universalMatchGroups = commandPaletteService.searchCommandPalette(testUserId, 'Strategic Growth');
  console.log('✓ Query "Strategic Growth" Groups Count:', universalMatchGroups.length);
  const searchResultFound = universalMatchGroups.some((g) =>
    g.items.some((item) => item.title.includes('Q3 Strategic Growth'))
  );
  if (!searchResultFound) {
    throw new Error('Command palette failed to integrate universal search engine results!');
  }


  // --- PHASE 5: TAB FILTERING ---
  console.log('\n[PHASE 5] Testing Tab Category Filters (Tasks, Habits, AI, etc.)...');

  const taskFilterGroups = commandPaletteService.searchCommandPalette(testUserId, 'Strategic', 'task');
  console.log('✓ Filtered Task Tab Group Count:', taskFilterGroups.length);


  // --- PHASE 6: FUTURE AI READINESS STUBS AUDIT ---
  console.log('\n[PHASE 6] Testing Future AI Readiness Stubs (Voice & NL Search)...');

  const voiceRes = commandPaletteService.processVoiceCommand(testUserId, 'Add Task for tomorrow');
  console.log('✓ Voice Command Response:', voiceRes);
  if (voiceRes.recognizedAction !== 'create_task') {
    throw new Error('Voice command recognition stub failed!');
  }

  const nlRes = commandPaletteService.parseNaturalLanguageQuery('Find notes about Q3 strategy');
  console.log('✓ NL Search Parser Result:', nlRes);


  // --- PHASE 7: PERFORMANCE AUDIT ---
  console.log('\n[PHASE 7] Testing Command Palette Search Latency...');

  const startMs = Date.now();
  for (let i = 0; i < 100; i++) {
    commandPaletteService.searchCommandPalette(testUserId, 'Planner');
  }
  const durationMs = Date.now() - startMs;
  console.log(`✓ Executed 100 Command Palette Searches in ${durationMs} ms (Avg: ${(durationMs / 100).toFixed(2)} ms/search)`);

  console.log('\n================================================================');
  console.log('  SPRINT 6.1 GLOBAL COMMAND PALETTE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runCommandPaletteAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('AUDIT FAILURE:', err);
    process.exit(1);
  });
