/**
 * verifySprint62_CalendarEngine.ts
 * Comprehensive Verification Audit Script for Sprint 6.2 - Unified Calendar & Timeline Engine.
 */

import { calendarService, GoogleCalendarSyncAdapter } from '../src/services/calendar/calendarService';
import { CentralDataServiceFacade } from '../src/services/dataService';
import { notificationService } from '../src/services/notifications/notificationService';

const dataService = new CentralDataServiceFacade();

async function runCalendarEngineAudit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 6.2 UNIFIED CALENDAR & TIMELINE ENGINE AUDIT');
  console.log('================================================================\n');

  const testUserId = 'audit-user-62';
  const todayStr = new Date().toISOString().split('T')[0];

  // Clear test user data
  dataService.resetUserData(testUserId);
  calendarService.saveCustomEvents(testUserId, []);

  // --- SETUP: SEED SAMPLE TIME-BASED DATA ACROSS SOURCES ---
  console.log('[SETUP] Seeding Sample Records Across 7 Sources...');

  // 1. Task
  dataService.saveTasks(
    [
      {
        id: 't-621',
        title: 'Review Sprint 6.2 Architecture Spec',
        completed: false,
        priority: 'High',
        dueDate: todayStr,
        time: '09:30 AM',
        category: 'Engineering',
      },
    ],
    testUserId
  );

  // 2. Habit
  dataService.saveHabits(
    [
      {
        id: 'h-621',
        name: 'Morning Mindfulness & Hydration',
        streak: 10,
        frequency: 'Daily',
        routine: 'morning',
        completedToday: true,
        category: 'Health',
        createdAt: '2026-07-01',
      },
    ],
    testUserId
  );

  // 3. Goal
  dataService.saveGoals(
    [
      {
        id: 'g-621',
        title: 'Launch Enterprise Calendar Engine',
        description: 'Complete cross-module scheduling consolidation.',
        category: 'Product',
        targetDate: todayStr,
        currentProgress: 80,
        targetProgress: 100,
        unit: '%',
        status: 'active',
        priority: 'high',
      },
    ],
    testUserId
  );

  // 4. Meeting
  dataService.saveMeetings(
    [
      {
        id: 'm-621',
        title: 'Sprint 6.2 Architecture Review',
        time: '11:00 AM',
        duration: '45 min',
        type: 'Technical',
        date: todayStr,
        completed: false,
        attendees: ['Mihir', 'Lead Architect'],
      },
      {
        id: 'm-622',
        title: 'Conflicting Design Meeting',
        time: '11:15 AM', // Overlap with m-621
        duration: '30 min',
        type: 'Design',
        date: todayStr,
        completed: false,
        attendees: ['UI Designer'],
      },
    ],
    testUserId
  );

  // 5. Birthday User Profile
  dataService.saveCurrentUser(testUserId, {
    id: testUserId,
    username: 'sarthi_lead',
    fullName: 'Mihir Jani',
    email: 'mihir.jani0708@gmail.com',
    birthday: '2026-08-07',
    designation: 'Principal Architect',
  } as any);

  // 6. Reminder
  notificationService.scheduleReminder(testUserId, {
    module: 'meeting',
    title: 'Reminder: Architecture Review in 15 mins',
    priority: 'critical',
    repeatPattern: 'one_time',
    scheduledTime: `${todayStr}T10:45:00.000Z`,
  });

  // 7. Custom Calendar Event
  const customEvt = calendarService.createEvent(testUserId, {
    title: 'Executive Board Sync',
    type: 'event',
    startDate: todayStr,
    startTime: '03:00 PM',
    priority: 'critical',
    recurrence: 'weekly',
  });
  console.log('✓ Created Custom Calendar Event:', customEvt.title, `(ID: ${customEvt.id})`);


  // --- PHASE 1 & 2: EVENT SOURCES AGGREGATION & VIEWS ---
  console.log('\n[PHASE 1 & 2] Testing Aggregation & Calendar Views (Today, Week, Month, Agenda)...');

  const todayEvents = calendarService.getToday(testUserId);
  console.log('✓ Today Events Count:', todayEvents.length);
  if (todayEvents.length < 5) {
    throw new Error('Aggregation failed! Expected at least 5 events across sources for today.');
  }

  const weekEvents = calendarService.getWeek(testUserId, todayStr);
  console.log('✓ Week Events Count:', weekEvents.length);

  const monthEvents = calendarService.getMonth(testUserId, todayStr);
  console.log('✓ Month Events Count:', monthEvents.length);


  // --- PHASE 3: TIMELINE ENGINE ---
  console.log('\n[PHASE 3] Testing Chronological Timeline Engine...');

  const timeline = calendarService.getTimeline(testUserId, todayStr);
  console.log('✓ Timeline Items Count:', timeline.length);
  console.log('✓ First Timeline Item:', timeline[0]?.time, `("${timeline[0]?.title}")`);

  const hasAISuggestion = timeline.some((t) => t.type === 'ai_suggestion');
  console.log('✓ Timeline AI Suggestion Included:', hasAISuggestion);


  // --- PHASE 5: EVENT MANAGEMENT CRUD ---
  console.log('\n[PHASE 5] Testing Event Management CRUD Operations...');

  // Update
  const updated = calendarService.updateEvent(testUserId, customEvt.id, {
    title: 'Updated Executive Board Sync',
  });
  console.log('✓ Updated Event Title:', updated?.title);
  if (updated?.title !== 'Updated Executive Board Sync') throw new Error('Event update failed!');

  // Move
  const moved = calendarService.moveEvent(testUserId, customEvt.id, todayStr, '04:00 PM');
  console.log('✓ Moved Event Time:', moved?.startTime);

  // Complete
  const completed = calendarService.completeEvent(testUserId, customEvt.id, true);
  console.log('✓ Completed Event State:', completed?.completed);


  // --- PHASE 6: CONFLICT DETECTION ENGINE ---
  console.log('\n[PHASE 6] Testing Conflict Detection Engine...');

  const conflicts = calendarService.detectConflicts(testUserId, todayStr);
  console.log('✓ Has Conflicts Detected:', conflicts.hasConflict);
  console.log('✓ Conflict Message:', conflicts.message);
  console.log('✓ Suggested Resolutions:', conflicts.suggestedResolutions);

  if (!conflicts.hasConflict) {
    throw new Error('Conflict detection failed to flag overlapping 11:00 AM & 11:15 AM meetings!');
  }


  // --- PHASE 7: SMART DAY SUMMARY ---
  console.log('\n[PHASE 7] Testing Smart Day Summary & Free Time Blocks...');

  const summary = calendarService.getSmartDaySummary(testUserId, todayStr);
  console.log('✓ Today Schedule Total:', summary.todaySchedule.length);
  console.log('✓ Pending Items:', summary.pendingItems.length);
  console.log('✓ Completed Items:', summary.completedItems.length);
  console.log('✓ Completion Rate:', `${summary.completionRate}%`);
  console.log('✓ Free Time Blocks Count:', summary.freeTimeBlocks.length);
  console.log('✓ First Free Block:', summary.freeTimeBlocks[0]?.startTime, 'to', summary.freeTimeBlocks[0]?.endTime);
  console.log('✓ AI Day Tip:', `"${summary.aiDayTip}"`);


  // --- FUTURE READY SYNC ADAPTER AUDIT ---
  console.log('\n[FUTURE READY] Testing Calendar Sync Adapter Stubs...');

  const googleAdapter = new GoogleCalendarSyncAdapter();
  const syncSuccess = await googleAdapter.syncEvents(testUserId, todayEvents);
  console.log('✓ Google Calendar Sync Adapter Stub Success:', syncSuccess);

  console.log('\n================================================================');
  console.log('  SPRINT 6.2 UNIFIED CALENDAR ENGINE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runCalendarEngineAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('AUDIT FAILURE:', err);
    process.exit(1);
  });
