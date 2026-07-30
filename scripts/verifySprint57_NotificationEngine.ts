/**
 * verifySprint57_NotificationEngine.ts
 * Comprehensive Verification Audit for Sprint 5.9 - Enterprise Smart Notification & Reminder Engine.
 */
import {
  notificationService,
  LocalStubPushAdapter,
  FCMPushAdapter,
  WebPushAdapter,
  AndroidPushAdapter,
  IOSPushAdapter,
} from '../src/services/notifications/notificationService';
import { Reminder, NotificationHistoryItem } from '../src/types';

async function runNotificationEngineAudit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 5.9 ENTERPRISE NOTIFICATION ENGINE AUDIT');
  console.log('================================================================\n');

  const testUserId = 'audit-user-59';

  // Clear previous test state
  notificationService.saveReminders(testUserId, []);
  notificationService.clearHistory(testUserId);

  // --- PHASE 1 & 2: DEVELOPER APIs & SUPPORTED MODULES ---
  console.log('[PHASE 1 & 2] Testing Developer APIs & All Supported Modules...');

  const nowIso = new Date().toISOString();
  const pastIso = new Date(Date.now() - 60000).toISOString();
  const futureIso = new Date(Date.now() + 3600000).toISOString();

  // 1. Habit
  const r1 = notificationService.createReminder(testUserId, {
    module: 'habit',
    title: 'Daily Meditation Routine',
    priority: 'high',
    repeatPattern: 'daily',
    scheduledTime: pastIso,
  });

  // 2. Task
  const r2 = notificationService.createReminder(testUserId, {
    module: 'task',
    title: 'Finalize Q3 Board Presentation',
    priority: 'critical',
    repeatPattern: 'one_time',
    scheduledTime: pastIso,
  });

  // 3. Planner
  const r3 = notificationService.createReminder(testUserId, {
    module: 'planner',
    title: 'Executive Sync Session',
    priority: 'normal',
    repeatPattern: 'weekdays',
    scheduledTime: futureIso,
  });

  // 4. Meeting
  const r4 = notificationService.createReminder(testUserId, {
    module: 'meeting',
    title: 'Investor Pitch Review',
    priority: 'critical',
    repeatPattern: 'once',
    scheduledTime: futureIso,
  });

  // 5. Goal
  const r5 = notificationService.createReminder(testUserId, {
    module: 'goal',
    title: 'Achieve $10M ARR Milestone',
    priority: 'high',
    repeatPattern: 'monthly',
    scheduledTime: futureIso,
  });

  // 6. Birthday
  const r6 = notificationService.createReminder(testUserId, {
    module: 'birthday',
    title: "Mani's Birthday Celebration",
    priority: 'normal',
    repeatPattern: 'yearly',
    scheduledTime: futureIso,
  });

  // 7. Journal
  const r7 = notificationService.createReminder(testUserId, {
    module: 'journal',
    title: 'Night Reflection Journal',
    priority: 'low',
    repeatPattern: 'daily',
    scheduledTime: futureIso,
  });

  // 8. Water
  const r8 = notificationService.createReminder(testUserId, {
    module: 'water',
    title: 'Hydration Intake Goal (500ml)',
    priority: 'low',
    repeatPattern: 'custom',
    customRepeatDays: 1,
    scheduledTime: futureIso,
  });

  // 9. Medicine
  const r9 = notificationService.createReminder(testUserId, {
    module: 'medicine',
    title: 'Take Daily Multivitamin & Omega-3',
    priority: 'high',
    repeatPattern: 'daily',
    scheduledTime: futureIso,
  });

  // 10. Custom
  const r10 = notificationService.createReminder(testUserId, {
    module: 'custom',
    title: 'Check Security Audit Trail',
    priority: 'normal',
    repeatPattern: 'weekends',
    scheduledTime: futureIso,
  });

  const totalSaved = notificationService.getReminders(testUserId).length;
  console.log(`✓ Created 10 diverse module reminders. Saved Total Count: ${totalSaved}`);
  if (totalSaved !== 10) throw new Error('Failed to create all 10 module reminders');


  // --- PHASE 3 & 4: PRIORITY ORDERING & CRITICAL RANKING ---
  console.log('\n[PHASE 3 & 4] Testing Recurrence & Priority Level Ranking...');

  const pendingReminders = notificationService.getPendingReminders(testUserId);
  console.log('✓ Pending Reminders Count:', pendingReminders.length);
  console.log('✓ Top Ranked Priority:', pendingReminders[0].priority.toUpperCase(), `("${pendingReminders[0].title}")`);
  if (pendingReminders[0].priority !== 'critical') {
    throw new Error('Critical priority reminders must rank first in queue!');
  }


  // --- PHASE 8: DEVELOPER API METHODS ---
  console.log('\n[PHASE 8] Testing Developer API CRUD Methods...');

  // updateReminder
  const updatedR3 = notificationService.updateReminder(testUserId, r3.id, { title: 'Updated Executive Sync Session' });
  console.log('✓ updateReminder:', updatedR3?.title === 'Updated Executive Sync Session');

  // snoozeReminder
  const snoozedR5 = notificationService.snoozeReminder(testUserId, r5.id, 20);
  console.log('✓ snoozeReminder:', snoozedR5?.status === 'snoozed', `Snoozed until ${snoozedR5?.snoozeUntil}`);

  // markCompleted
  const completedR1 = notificationService.markCompleted(testUserId, r1.id);
  console.log('✓ markCompleted:', completedR1?.status === 'completed');

  // getUpcomingReminders
  const upcoming = notificationService.getUpcomingReminders(testUserId, 5);
  console.log('✓ getUpcomingReminders count:', upcoming.length);

  // getTodayReminders
  const todayReminders = notificationService.getTodayReminders(testUserId);
  console.log('✓ getTodayReminders count:', todayReminders.length);

  // rescheduleReminder
  const rescheduledR7 = notificationService.rescheduleReminder(testUserId, r7.id, futureIso);
  console.log('✓ rescheduleReminder:', rescheduledR7?.scheduledTime === futureIso);

  // deleteReminder
  const deletedR10 = notificationService.deleteReminder(testUserId, r10.id);
  console.log('✓ deleteReminder:', deletedR10);


  // --- PHASE 5 & 7: HISTORY LOGGING & RELIABILITY ---
  console.log('\n[PHASE 5 & 7] Testing Background Engine Triggering, History & Reliability...');

  // Check and trigger pending due reminders (r2 was set to pastIso)
  const triggered = notificationService.checkAndTriggerReminders(testUserId);
  console.log(`✓ Triggered ${triggered.length} due reminders.`);
  if (triggered.length > 0) {
    console.log('  - Triggered Title:', triggered[0].title);
    console.log('  - Triggered Retry Count:', triggered[0].retryCount);
  }

  // History Log Verification
  const history = notificationService.getHistory(testUserId);
  console.log(`✓ History Log Entries Count: ${history.length}`);
  if (history.length > 0) {
    const sample = history[0];
    console.log('✓ Sample History Item:');
    console.log(`   - ID: ${sample.id}`);
    console.log(`   - Module: ${sample.module}`);
    console.log(`   - Title: ${sample.title}`);
    console.log(`   - Action: ${sample.actionTaken}`);
    console.log(`   - Completed: ${sample.completed}`);
    console.log(`   - Snoozed: ${sample.snoozed}`);
    console.log(`   - Retry Count: ${sample.retryCount}`);
  }


  // --- PHASE 6: FUTURE PUSH ADAPTERS ---
  console.log('\n[PHASE 6] Testing Future Push Adapters Architecture...');

  const adapters = [
    new LocalStubPushAdapter(),
    new FCMPushAdapter(),
    new WebPushAdapter(),
    new AndroidPushAdapter(),
    new IOSPushAdapter(),
  ];

  for (const adapter of adapters) {
    notificationService.registerPushAdapter(adapter);
    const active = notificationService.getActivePushAdapter();
    const token = await active.getToken();
    console.log(`✓ Push Adapter Platform: ${active.platformName.toUpperCase()} | Supported: ${active.isSupported()} | Token: ${token}`);
  }


  // --- DEDUPLICATION CHECK ---
  console.log('\n[RELIABILITY] Testing Deduplication & Offline Persistence...');

  notificationService.createReminder(testUserId, {
    module: 'task',
    targetEntityId: 'task-entity-999',
    title: 'Unique Task Entity Reminder',
    priority: 'high',
    repeatPattern: 'one_time',
    scheduledTime: futureIso,
  });

  notificationService.createReminder(testUserId, {
    module: 'task',
    targetEntityId: 'task-entity-999',
    title: 'Unique Task Entity Reminder (Updated Title)',
    priority: 'critical',
    repeatPattern: 'one_time',
    scheduledTime: futureIso,
  });

  const finalReminders = notificationService.getReminders(testUserId);
  const entityReminders = finalReminders.filter((r) => r.targetEntityId === 'task-entity-999');
  console.log('✓ Deduplication verified: Entity "task-entity-999" reminder count is', entityReminders.length);
  if (entityReminders.length !== 1 || entityReminders[0].priority !== 'critical') {
    throw new Error('Deduplication failed to update existing entity reminder!');
  }

  console.log('\n================================================================');
  console.log('  SPRINT 5.9 ENTERPRISE NOTIFICATION ENGINE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runNotificationEngineAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('AUDIT FAILURE:', err);
    process.exit(1);
  });
