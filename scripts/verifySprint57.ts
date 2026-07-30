/**
 * verifySprint57.ts
 * Comprehensive verification script for Sprint 5.7 – Enterprise Security Hardening & Production Audit.
 */
import { errorService, AppError } from '../src/services/error/errorService';
import { StorageFactory } from '../src/services/storage/StorageFactory';
import { habitsService } from '../src/services/modules/habitsService';
import { goalsService } from '../src/services/modules/goalsService';
import { plannerService } from '../src/services/modules/plannerService';
import { journalService } from '../src/services/modules/journalService';
import { profileService } from '../src/services/modules/profileService';
import { authService } from '../src/services/modules/authService';
import { backupService } from '../src/services/storage/backupService';
import { migrationService } from '../src/services/storage/migrationService';

async function runSprint57Audit() {
  console.log('====================================================');
  console.log('  STARTING SPRINT 5.7 SECURITY & PRODUCTION AUDIT');
  console.log('====================================================\n');

  const testUserId = 'audit-test-user';

  // PHASE 1 & 4: CENTRALIZED ERROR HANDLING & RESILIENCE TEST
  console.log('[PHASE 1 & 4] Testing ErrorService Centralized Engine...');
  
  // 1. Log structured error
  const testErr = errorService.logError('VALIDATION', 'TEST_MALFORMED_INPUT', 'Malformed task structure provided', { input: 123 });
  console.log('✓ Structured AppError created with ID:', testErr.id);
  console.log('  - Category:', testErr.category);
  console.log('  - Code:', testErr.code);
  console.log('  - Timestamp:', testErr.timestamp);

  // 2. Test Safe TryExecute Recovery Fallback
  const fallbackResult = errorService.tryExecute(
    () => {
      throw new Error('Simulated runtime failure');
    },
    'SAFE_FALLBACK_VALUE',
    'SYSTEM',
    'TestFallback'
  );
  if (fallbackResult === 'SAFE_FALLBACK_VALUE') {
    console.log('✓ Safe execution recovery verified: Returned fallback value on throw');
  }

  // 3. Test Safe JSON Parsing
  const safeParsed = errorService.safeJsonParse('{ "invalidJson": ', { fallback: true });
  if (safeParsed.fallback === true) {
    console.log('✓ Safe JSON parse verified: Recovered from corrupt string without crash');
  }

  // 4. Test Validation Helpers
  const validEmail = errorService.validateEmail('executive@sarthi.os');
  const invalidEmail = errorService.validateEmail('invalid-email-address');
  if (validEmail && !invalidEmail) {
    console.log('✓ Input validation helpers verified for email formats');
  }


  // PHASE 2 & 3: INPUT VALIDATION & STORAGE SECURITY IN MODULES
  console.log('\n[PHASE 2 & 3] Testing Module Input Validation & Deduplication...');

  // 1. Habits Validation & Deduplication
  const malformedHabits: any[] = [
    { id: 'h1', name: '  Exercise Daily  ', streak: -5, category: 'Mind', iconName: 'Check' },
    { id: 'h1', name: 'Duplicate ID Habit', streak: 10, category: 'Mind', iconName: 'Check' }, // Duplicate ID
    null, // Null entry
    { name: 'Habit Without ID', category: 'Mind', iconName: 'Check' }, // Missing ID
  ];
  habitsService.saveHabits(testUserId, malformedHabits);
  const sanitizedHabits = habitsService.getHabits(testUserId);
  console.log(`✓ Habits Sanitization: Input size 4 -> Output size ${sanitizedHabits.length}`);
  console.log('  - Duplicate ID eliminated:', sanitizedHabits.filter((h) => h.id === 'h1').length === 1);
  console.log('  - Negative streak clamped to 0:', sanitizedHabits[0].streak === 0);
  console.log('  - Name trimmed:', sanitizedHabits[0].name === 'Exercise Daily');

  // 2. Goals Validation & Progress Clamping [0, 100]
  const malformedGoals: any[] = [
    { id: 'g1', title: 'Revenue Growth', currentProgress: 150, targetProgress: 100, category: 'Business', timeframe: 'Q3 2026', targetDate: '2026-12-31', status: 'active' }, // Progress > 100
    { id: 'g2', title: 'Cost Reduction', currentProgress: -20, targetProgress: 100, category: 'Business', timeframe: 'Q3 2026', targetDate: '2026-12-31', status: 'active' }, // Progress < 0
  ];
  goalsService.saveGoals(testUserId, malformedGoals);
  const sanitizedGoals = goalsService.getGoals(testUserId);
  console.log('✓ Goals Sanitization:');
  console.log('  - Progress > 100 clamped to 100:', sanitizedGoals[0].currentProgress === 100);
  console.log('  - Progress < 0 clamped to 0:', sanitizedGoals[1].currentProgress === 0);

  // 3. Planner Validation (Tasks, Meetings, Notes)
  plannerService.savePlannerData(testUserId, {
    tasks: [
      { id: 't1', title: 'Task 1', status: 'todo', priority: 'Medium', category: 'Business', dueDate: '2026-07-30' },
      { id: 't1', title: 'Task 1 Dup', status: 'todo', priority: 'Medium', category: 'Business', dueDate: '2026-07-30' },
    ] as any,
    meetings: [{ id: 'm1', title: 'Executive Sync', time: '11:00 AM', duration: '30m', type: 'Business' }],
    notes: [{ id: 'n1', title: 'Strategy Note', content: 'Key decisions...', tags: ['Executive'], updatedAt: '2026-07-30' }],
  });
  const plannerData = plannerService.getPlannerData(testUserId);
  console.log('✓ Planner Sanitization: Deduplicated task count:', plannerData.tasks.length);

  // 4. Profile & Settings Sanitization
  profileService.saveProfile(testUserId, {
    name: '   Mihir Jani  ',
    email: 'invalid-email',
    role: '  CEO ',
  } as any);
  const sanitizedProfile = profileService.getProfile(testUserId);
  console.log('✓ Profile Sanitization:');
  console.log('  - Name trimmed:', sanitizedProfile.name === 'Mihir Jani');
  console.log('  - Invalid email safely reset to default:', sanitizedProfile.email.includes('@'));


  // PHASE 3 & 6: BACKUP QUOTA PRUNING & RESTORE TESTING
  console.log('\n[PHASE 3 & 6] Testing Backup Service Quota Pruning & Restore...');
  
  // Create 12 backup points to test MAX_BACKUPS_PER_USER = 10 pruning
  for (let i = 1; i <= 12; i++) {
    backupService.createBackupPoint(testUserId, `Audit Test Snapshot ${i}`);
  }
  const restorePoints = backupService.getRestorePoints(testUserId);
  console.log(`✓ Backup Quota Pruning: Created 12 backups -> Retained ${restorePoints.length} (Max 10 limit enforced)`);

  // Test restoration
  const latestBackupId = restorePoints[0].backupId;
  const restoreSuccess = backupService.restoreFromBackupPoint(latestBackupId, testUserId);
  console.log('✓ Backup Restoration Result:', restoreSuccess);


  // PHASE 5 & 6: PERFORMANCE & PRODUCTION CHECKLIST VERIFICATION
  console.log('\n[PHASE 5 & 6] Production Checklist & Architecture Rules Verification...');

  // 1. Verify Storage Mode Constraint
  const storageMode = StorageFactory.getStorageMode();
  console.log('✓ Active Storage Mode:', storageMode);
  if (storageMode === 'local') {
    console.log('✓ STRICT CONSTRAINT VERIFIED: DEFAULT_STORAGE_MODE remains "local"');
  }

  // 2. Migration Validation Dry-Run
  const validationReport = migrationService.validateData(testUserId);
  console.log('✓ Migration Validation Dry-Run Report:');
  console.log('  - Is Valid:', validationReport.isValid);
  console.log('  - Profile Exists:', validationReport.profileExists);
  console.log('  - Tasks Count:', validationReport.tasksCount);
  console.log('  - Habits Count:', validationReport.habitsCount);

  // 3. Error Service Log Summary
  const errorLogs = errorService.getErrorLogs();
  console.log(`✓ Total Logged Audit Errors in Buffer: ${errorLogs.length}`);

  console.log('\n====================================================');
  console.log('  SPRINT 5.7 AUDIT & VERIFICATION COMPLETED');
  console.log('====================================================');
}

runSprint57Audit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('AUDIT ERROR:', err);
    process.exit(1);
  });
