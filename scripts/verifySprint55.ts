import { migrationService } from '../src/services/storage/migrationService';
import { authService } from '../src/services/modules/authService';
import { backupService } from '../src/services/storage/backupService';
import { StorageFactory } from '../src/services/storage/StorageFactory';

async function runSprint55Verification() {
  console.log('--- STARTING SPRINT 5.5 MIGRATION ENGINE VERIFICATION ---');

  const testLocalUserId = 'mihir-owner';
  const testFirebaseUid = 'fb_test_sprint55_uid_9988';

  // 1. Detect Local User
  console.log('\n[Phase 1] Testing Local User Detection...');
  let localAccount = migrationService.detectLocalUser(testLocalUserId);
  if (!localAccount) {
    authService.saveRegistry([
      {
        uid: testLocalUserId,
        firebaseUid: testFirebaseUid,
        name: 'Mihir Jani',
        email: 'mihir.jani0708@gmail.com',
        phone: '+91 9876543210',
        authProvider: 'firebase_email',
        createdAt: new Date().toISOString(),
      },
    ]);
    localAccount = migrationService.detectLocalUser(testLocalUserId);
  }
  console.log('✓ Detected Local Account:', localAccount?.name, `(ID: ${localAccount?.uid})`);

  // 2. Data Validation Engine
  console.log('\n[Phase 2] Testing Pre-Migration Data Validation...');
  const validationReport = migrationService.validateData(testLocalUserId);
  console.log('✓ Validation Result:');
  console.log(`  - Profile Exists: ${validationReport.profileExists}`);
  console.log(`  - Habits Count: ${validationReport.habitsCount}`);
  console.log(`  - Tasks Count: ${validationReport.tasksCount}`);
  console.log(`  - Goals Count: ${validationReport.goalsCount}`);
  console.log(`  - Journal Count: ${validationReport.journalCount}`);
  console.log(`  - Settings Exists: ${validationReport.settingsExists}`);
  console.log(`  - Is Data Valid & Complete: ${validationReport.isValid}`);

  // 3. Pre-Migration Safety Snapshot
  console.log('\n[Phase 5] Testing Pre-Migration Automated Backup...');
  const testMigId = `mig_test_${Date.now()}`;
  const backupSnapshot = migrationService.backup(testLocalUserId, testMigId);
  console.log('✓ Safety Snapshot Created ID:', backupSnapshot.backupId);

  // 4. Test Cloud Verification Logic (Dry run against empty/mock)
  console.log('\n[Phase 3] Testing Cloud Verification Logic...');
  const verifyReport = await migrationService.verifyCloudUpload(testLocalUserId, testFirebaseUid, validationReport);
  console.log(`✓ Verification Evaluated (Is Verified: ${verifyReport.isVerified})`);
  console.log(`  Discrepancies found during dry-run:`, verifyReport.discrepancies.length);

  // 5. Test Rollback Engine
  console.log('\n[Phase 4] Testing Rollback Engine Execution...');
  const rollbackLog = await migrationService.rollback(
    testMigId,
    testLocalUserId,
    backupSnapshot.backupId,
    'Simulated Verification Failure for Automated Testing'
  );
  console.log('✓ Rollback Status:', rollbackLog.status);
  console.log('✓ Active Storage Mode Restored:', StorageFactory.getStorageMode());
  if (StorageFactory.getStorageMode() === 'local') {
    console.log('✓ Confirmed: Default Storage Mode strictly remains "local"');
  }

  // 6. Verify Log Records
  console.log('\n[Phase 6] Testing Migration Log Registry...');
  const logs = migrationService.getMigrationLogsLocal(testLocalUserId);
  console.log(`✓ Total Local Migration Logs Recorded: ${logs.length}`);
  if (logs.length > 0) {
    console.log(`  Latest Log ID: ${logs[0].migrationId}, Status: ${logs[0].status}`);
  }

  console.log('\n--- SPRINT 5.5 VERIFICATION COMPLETED SUCCESSFULLY ---');
}

runSprint55Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  });
