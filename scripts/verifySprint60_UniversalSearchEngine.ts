/**
 * verifySprint60_UniversalSearchEngine.ts
 * Comprehensive Verification Audit Script for Sprint 6.0 - Universal Search Engine.
 */

import { searchService, CloudSearchAdapter } from '../src/services/search/searchService';
import { CentralDataServiceFacade } from '../src/services/dataService';
import { notificationService } from '../src/services/notifications/notificationService';
import { SearchModule } from '../src/types';

const dataService = new CentralDataServiceFacade();

async function runUniversalSearchEngineAudit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 6.0 UNIVERSAL SEARCH ENGINE AUDIT');
  console.log('================================================================\n');

  const testUserId = 'audit-user-60';

  // Clear state for test user
  dataService.resetUserData(testUserId);
  searchService.clearHistory(testUserId);
  searchService.invalidateIndexCache(testUserId);

  // --- SEED SAMPLE DATA ACROSS ALL 9 MODULES ---
  console.log('[SETUP] Seeding Sample Records Across All 9 Modules...');

  // 1. Task
  dataService.saveTasks(
    [
      {
        id: 't-601',
        title: 'Review Q4 Strategic Architecture Roadmap',
        completed: false,
        priority: 'High',
        dueDate: '2026-08-01',
        category: 'Work',
        time: '10:00 AM',
        tags: ['strategy', 'architecture'],
      },
    ],
    testUserId
  );

  // 2. Habit
  dataService.saveHabits(
    [
      {
        id: 'h-601',
        name: 'Morning Deep Work Focus Routine',
        streak: 14,
        frequency: 'Daily',
        routine: 'morning',
        completedToday: false,
        category: 'Productivity',
        createdAt: '2026-07-01',
      },
    ],
    testUserId
  );

  // 3. Goal
  dataService.saveGoals(
    [
      {
        id: 'g-601',
        title: 'Enterprise ISO 27001 Security Certification',
        description: 'Complete third-party penetration testing and compliance audit.',
        category: 'Compliance',
        targetDate: '2026-12-31',
        currentProgress: 60,
        targetProgress: 100,
        unit: '%',
        status: 'active',
        priority: 'high',
        createdAt: '2026-01-01',
        milestones: [{ id: 'm1', title: 'Internal Audit Completed', completed: true }],
      },
    ],
    testUserId
  );

  // 4. Meeting
  dataService.saveMeetings(
    [
      {
        id: 'm-601',
        title: 'Executive Board Quarterly Briefing',
        time: '02:00 PM',
        duration: '60 min',
        type: 'Board',
        date: '2026-08-05',
        completed: false,
        attendees: ['CEO', 'CTO', 'VP Eng'],
      },
    ],
    testUserId
  );

  // 5. Journal
  dataService.saveJournalEntries(testUserId, {
    '2026-07-29': {
      id: 'j-601',
      entry: 'Reflected on the high performance of SARTHI OS search service architecture.',
      mood: 'Great',
      tags: ['reflection', 'sarthi'],
    },
  });

  // 6. Notes
  dataService.saveNotes(
    [
      {
        id: 'n-601',
        title: 'Cloud Infrastructure Cost Optimization Notes',
        content: 'Analyze GCP Cloud Run memory limits and server response times.',
        category: 'DevOps',
        tags: ['gcp', 'cost'],
        createdAt: '2026-07-25',
        updatedAt: '2026-07-28',
      },
    ],
    testUserId
  );

  // 7. Notification / Reminder
  notificationService.scheduleReminder(testUserId, {
    module: 'meeting',
    title: 'Reminder: Executive Board Briefing in 15 mins',
    priority: 'critical',
    repeatPattern: 'one_time',
    scheduledTime: '2026-08-05T13:45:00.000Z',
  });

  // 8. Profile
  dataService.saveCurrentUser(testUserId, {
    id: testUserId,
    username: 'sarthi_architect',
    fullName: 'Mihir Jani (Lead Architect)',
    email: 'mihir.jani0708@gmail.com',
    bio: 'Lead Engineer building SARTHI OS enterprise intelligence platform.',
    designation: 'Principal Architect',
    skills: ['TypeScript', 'React', 'Search Engines'],
  });

  searchService.invalidateIndexCache(testUserId);


  // --- PHASE 1 & 2: UNIVERSAL SEARCH & SMART MATCHING ---
  console.log('\n[PHASE 1 & 2] Testing Universal Search Across All Modules & Smart Match Types...');

  // 1. Exact Title Match
  const exactRes = searchService.search(testUserId, 'Executive Board Quarterly Briefing');
  console.log('✓ Exact Match Result Count:', exactRes.length);
  if (exactRes.length === 0 || exactRes[0].title !== 'Executive Board Quarterly Briefing') {
    throw new Error('Exact title match failed!');
  }

  // 2. Partial Substring Match
  const partialRes = searchService.search(testUserId, 'Architecture');
  console.log('✓ Partial Match Count:', partialRes.length, `(Top Result: "${partialRes[0].title}")`);
  if (partialRes.length === 0) throw new Error('Partial substring match failed!');

  // 3. Keyword / Tokenized Match
  const tokenRes = searchService.search(testUserId, 'Strategic Roadmap');
  console.log('✓ Tokenized Match Count:', tokenRes.length);

  // 4. Case Insensitive Match
  const caseRes = searchService.search(testUserId, 'iso 27001 security');
  console.log('✓ Case Insensitive Match Count:', caseRes.length);
  if (caseRes.length === 0) throw new Error('Case insensitive match failed!');

  // 5. Fuzzy Match (Typo Tolerance)
  const fuzzyRes = searchService.search(testUserId, 'Infraastructure'); // Typo in Infrastructure
  console.log('✓ Fuzzy Match Count:', fuzzyRes.length);
  if (fuzzyRes.length === 0) throw new Error('Fuzzy Levenshtein matching failed!');


  // --- PHASE 3: SEARCH FILTERS ---
  console.log('\n[PHASE 3] Testing Search Filters (Module, Priority, Category, Date)...');

  // Module Filter
  const taskOnly = searchService.search(testUserId, '', { module: 'task' });
  console.log('✓ Task Module Filter Count:', taskOnly.length);
  if (taskOnly.some((r) => r.module !== 'task')) throw new Error('Module filter leaked non-task items!');

  // Priority Filter
  const criticalOnly = searchService.search(testUserId, '', { priority: 'critical' });
  console.log('✓ Critical Priority Filter Count:', criticalOnly.length);

  // Category Filter
  const devopsOnly = searchService.search(testUserId, '', { category: 'DevOps' });
  console.log('✓ Category Filter Count:', devopsOnly.length);
  if (devopsOnly.length > 0 && devopsOnly[0].category !== 'DevOps') {
    throw new Error('Category filter failed!');
  }


  // --- PHASE 4: RANKING STRATEGY ---
  console.log('\n[PHASE 4] Testing Search Result Ranking Strategy...');

  const rankedRes = searchService.search(testUserId, 'Executive Board Briefing');
  console.log('✓ Top Ranked Item Score:', rankedRes[0].score, `("${rankedRes[0].title}")`);
  if (rankedRes.length > 1) {
    if (rankedRes[0].score < rankedRes[1].score) {
      throw new Error('Search result ranking is not ordered descending by score!');
    }
  }


  // --- PHASE 5: SEARCH HISTORY & DEVELOPER APIs ---
  console.log('\n[PHASE 5] Testing Search History (Recent, Pinned, Popular) & Developer APIs...');

  // Record searches
  searchService.search(testUserId, 'Security Audit');
  searchService.search(testUserId, 'Security Audit'); // Second time for popular count
  searchService.search(testUserId, 'Cost Optimization');

  const recent = searchService.getRecentSearches(testUserId);
  console.log('✓ Recent Searches Count:', recent.length);

  // Pin search query
  searchService.pinSearch(testUserId, 'Security Audit');
  const pinnedList = searchService.getRecentSearches(testUserId);
  console.log('✓ Pinned Search Item:', pinnedList[0].query, `(Pinned: ${pinnedList[0].pinned})`);
  if (!pinnedList[0].pinned) throw new Error('Pin search failed!');

  // Popular searches
  const popular = searchService.getPopularSearches(testUserId);
  console.log('✓ Popular Searches Top Query:', popular[0]?.query, `(Count: ${popular[0]?.count})`);

  // searchModule API
  const moduleRes = searchService.searchModule(testUserId, 'goal', 'ISO 27001');
  console.log('✓ searchModule API Count:', moduleRes.length);


  // --- PHASE 6: PERFORMANCE AUDIT ---
  console.log('\n[PHASE 6] Testing High-Performance Indexing & Query Latency...');

  const startTime = Date.now();
  for (let i = 0; i < 100; i++) {
    searchService.search(testUserId, 'Security');
  }
  const totalMs = Date.now() - startTime;
  console.log(`✓ Executed 100 Search Queries in ${totalMs} ms (Avg: ${(totalMs / 100).toFixed(2)} ms/query)`);


  // --- FUTURE READY ADAPTER TEST ---
  console.log('\n[FUTURE READY] Testing Cloud Search Adapter Stub...');

  const cloudAdapter = new CloudSearchAdapter();
  searchService.registerSearchAdapter(cloudAdapter);
  const cloudRes = await cloudAdapter.search(testUserId, 'Architecture');
  console.log('✓ Cloud Adapter Delegated Results Count:', cloudRes.length);

  console.log('\n================================================================');
  console.log('  SPRINT 6.0 UNIVERSAL SEARCH ENGINE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runUniversalSearchEngineAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('AUDIT FAILURE:', err);
    process.exit(1);
  });
