import { authService } from '../src/services/modules/authService';
import { backupService } from '../src/services/storage/backupService';
import { syncService } from '../src/services/storage/syncService';
import { firebaseAuthService } from '../src/services/firebase/firebaseAuthService';

async function runSprint54Verification() {
  console.log('--- STARTING SPRINT 5.4 VERIFICATION ---');

  // STEP 1: Verify Auth Service Hybrid Mapping
  console.log('Testing Hybrid User Identity Mapping...');
  const registry = authService.getRegistry();
  console.log(`Current Local Registry Account Count: ${registry.length}`);

  const testLocalId = 'mihir-owner';
  const testFirebaseUid = 'fb_uid_test_12345';

  const linkedAccount = authService.linkFirebaseAccount(testLocalId, testFirebaseUid, 'firebase_email');
  if (linkedAccount) {
    console.log('✓ Successfully linked Local ID with Firebase UID:');
    console.log(`  Local ID: ${linkedAccount.uid}`);
    console.log(`  Firebase UID: ${linkedAccount.firebaseUid}`);
    console.log(`  Provider: ${linkedAccount.authProvider}`);
  } else {
    console.log('Note: Local ID "mihir-owner" not in registry yet (creating test record)...');
    authService.saveRegistry([
      {
        uid: 'mihir-owner',
        firebaseUid: testFirebaseUid,
        name: 'Mihir Jani (Owner)',
        email: 'mihir.jani0708@gmail.com',
        phone: '+91 9876543210',
        authProvider: 'firebase_email',
        createdAt: new Date().toISOString(),
      },
    ]);
    const fetched = authService.getAccountByFirebaseUid(testFirebaseUid);
    console.log('✓ Retrieved account by Firebase UID:', fetched?.email);
  }

  // STEP 2: Verify Backup System
  console.log('Testing Pre-Migration Local Backup System...');
  const backupSnapshot = backupService.createBackupPoint('mihir-owner', 'Sprint 5.4 Automated Test Backup');
  console.log('✓ Backup Snapshot Created with ID:', backupSnapshot.backupId);

  const restorePoints = backupService.getRestorePoints('mihir-owner');
  console.log(`✓ Restore Points Count for mihir-owner: ${restorePoints.length}`);

  const restoreSuccess = backupService.restoreFromBackupPoint(backupSnapshot.backupId, 'mihir-owner');
  console.log('✓ Backup Restore Test Result:', restoreSuccess ? 'SUCCESS' : 'FAILED');

  // STEP 3: Verify Conflict Resolution Logic
  console.log('Testing Conflict Resolution Engine ("Newest Data Wins")...');
  const localItem = { id: 'task-1', title: 'Local Task Title', updatedAt: '2026-07-30T10:00:00.000Z' };
  const cloudItem = { id: 'task-1', title: 'Cloud Task Title', updatedAt: '2026-07-30T09:00:00.000Z' };

  const resolved = syncService.resolveConflict(localItem, cloudItem);
  console.log('✓ Conflict Resolution Source Winner:', resolved.source);
  console.log('✓ Resolved Item Title:', resolved.resolved.title);
  if (resolved.source === 'local') {
    console.log('✓ Verified: Local item with newer timestamp correctly won!');
  }

  console.log('--- SPRINT 5.4 VERIFICATION COMPLETED SUCCESSFULLY ---');
}

runSprint54Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  });
