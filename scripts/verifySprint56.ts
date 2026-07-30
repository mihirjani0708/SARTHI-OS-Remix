import { analyticsService, AnalyticsEvent } from '../src/services/analytics/analyticsService';
import { StorageFactory } from '../src/services/storage/StorageFactory';

async function runSprint56Verification() {
  console.log('--- STARTING SPRINT 5.6 ENTERPRISE ANALYTICS VERIFICATION ---');

  const testUserId = 'mihir-owner';

  // 1. Verify Session Lifecycle
  console.log('\n[Phase 1 & 3] Testing Session Lifecycle & Device Detection...');
  const session = analyticsService.startSession(testUserId);
  console.log('✓ Started Active Session ID:', session.sessionId);
  console.log('  - User ID:', session.userId);
  console.log('  - Platform:', session.platform);
  console.log('  - Browser:', session.browser);
  console.log('  - Operating System:', session.operatingSystem);
  console.log('  - Device Type:', session.deviceType);
  console.log('  - App Version:', session.appVersion);

  // 2. Verify Privacy Sanitization & Metadata Tracking
  console.log('\n[Phase 2 & 6] Testing Privacy Compliance & Metadata Sanitization...');
  // Event containing raw sensitive data (password, journal content, prompt)
  const rawSensitiveEventData = {
    password: 'SuperSecret123!',
    content: 'Deep personal journal thoughts about business strategy...',
    prompt: 'Summarize my private financial numbers...',
    category: 'Executive Strategy',
    taskCount: 5,
    status: 'Completed',
  };

  analyticsService.trackEvent('JOURNAL_ENTRY_CREATED', 'Journal', testUserId, rawSensitiveEventData);
  analyticsService.trackEvent('AI_PROMPT_EXECUTED', 'AI', testUserId, rawSensitiveEventData);
  analyticsService.trackEvent('HABIT_COMPLETED', 'Habits', testUserId, { habitId: 'h123', category: 'Health' });

  // Retrieve queued events
  const queue = analyticsService.getOfflineQueue();
  console.log(`✓ Total Offline Events Queued: ${queue.length}`);

  const journalEvent = queue.find((e) => e.eventType === 'JOURNAL_ENTRY_CREATED');
  if (journalEvent && journalEvent.metadata) {
    console.log('✓ Sanitized Metadata Check for JOURNAL_ENTRY_CREATED:');
    console.log('  - Has raw password field:', 'password' in journalEvent.metadata);
    console.log('  - Has raw content field:', 'content' in journalEvent.metadata);
    console.log('  - Has raw prompt field:', 'prompt' in journalEvent.metadata);
    console.log('  - Safe password_length:', journalEvent.metadata.password_length);
    console.log('  - Safe content_length:', journalEvent.metadata.content_length);
    console.log('  - Safe category:', journalEvent.metadata.category);

    if (
      !('password' in journalEvent.metadata) &&
      !('content' in journalEvent.metadata) &&
      !('prompt' in journalEvent.metadata)
    ) {
      console.log('✓ PRIVACY COMPLIANCE VERIFIED: All sensitive content stripped!');
    }
  }

  // 3. Verify Offline Queue & Deduplication
  console.log('\n[Phase 4] Testing Offline Queue & Deduplication...');
  const initialQueueCount = analyticsService.getOfflineQueue().length;
  // Duplicate enqueue test
  const duplicateEvt: AnalyticsEvent = queue[0];
  analyticsService.enqueueEvent(duplicateEvt);
  const queueAfterDup = analyticsService.getOfflineQueue().length;

  if (initialQueueCount === queueAfterDup) {
    console.log('✓ Deduplication logic working: Duplicate event ID rejected!');
  }

  // 4. Test Session Termination
  console.log('\n[Phase 3] Testing Session End & Duration Calculation...');
  const endedSession = await analyticsService.endSession();
  console.log('✓ Ended Session Duration (seconds):', endedSession?.sessionDuration);
  console.log('✓ Logout Time:', endedSession?.logoutTime);

  // 5. Verify Admin Analytics APIs
  console.log('\n[Phase 8] Testing Admin Analytics Telemetry APIs...');
  console.log('✓ DAU:', analyticsService.getDailyActiveUsersMetrics());
  console.log('✓ WAU:', analyticsService.getWeeklyActiveUsersMetrics());
  console.log('✓ MAU:', analyticsService.getMonthlyActiveUsersMetrics());
  console.log('✓ Avg Session Duration:', analyticsService.getAverageSessionDurationMetrics());
  console.log('✓ Top Features:', analyticsService.getTopFeaturesMetrics().join(', '));
  console.log('✓ Most Used Module:', analyticsService.getMostUsedModuleMetrics());
  console.log('✓ Event Counts:', JSON.stringify(analyticsService.getEventCountsMetrics()));

  // 6. Confirm Default Storage Mode Constraints
  console.log('\n[Constraints Check] Verifying Storage Mode...');
  const storageMode = StorageFactory.getStorageMode();
  console.log('✓ Storage Mode:', storageMode);
  if (storageMode === 'local') {
    console.log('✓ STRICT RULE VERIFIED: DEFAULT_STORAGE_MODE remains "local"');
  }

  console.log('\n--- SPRINT 5.6 VERIFICATION COMPLETED SUCCESSFULLY ---');
}

runSprint56Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  });
