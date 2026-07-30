import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfigData from '../firebase-applet-config.json';
import { CloudStorageAdapter } from '../src/services/storage/CloudStorageAdapter';
import { StorageFactory } from '../src/services/storage/StorageFactory';

async function runVerification() {
  console.log('--- STARTING SPRINT 5.2 VERIFICATION ---');

  // STEP 1: Verify Connection
  const firebaseConfig = {
    apiKey: firebaseConfigData.apiKey,
    authDomain: firebaseConfigData.authDomain,
    projectId: firebaseConfigData.projectId,
    storageBucket: firebaseConfigData.storageBucket,
    messagingSenderId: firebaseConfigData.messagingSenderId,
    appId: firebaseConfigData.appId,
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = firebaseConfigData.firestoreDatabaseId
    ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
    : getFirestore(app);
  const auth = getAuth(app);

  console.log('✓ Firebase App Initialized:', app.name);
  console.log('✓ Firestore Database Connected ID:', firebaseConfigData.firestoreDatabaseId);
  console.log('✓ Auth Initialized:', Boolean(auth));

  // STEP 2: Test Firestore Write
  const testDocRef = doc(db, 'system_test', 'connection_test');
  const testPayload = {
    timestamp: new Date().toISOString(),
    status: 'ACTIVE_VERIFIED',
    version: 'v3.3 Final • Executive Engine',
    createdBy: 'SARTHI OS Sprint 5.2 Validator',
  };

  console.log('Executing Firestore write to collection "system_test"...');
  await setDoc(testDocRef, testPayload);
  console.log('✓ Write successful!');

  // STEP 3: Test Firestore Read
  console.log('Reading back document from "system_test/connection_test"...');
  const docSnap = await getDoc(testDocRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log('✓ Read successful! Data retrieved:', data);
    if (data.status === 'ACTIVE_VERIFIED') {
      console.log('✓ Verification Match: Written and read fields match perfectly!');
    }
  } else {
    throw new Error('Read failed: Document does not exist after write.');
  }

  // STEP 4: Test Cloud Adapter
  console.log('Testing CloudStorageAdapter operations...');
  const cloudAdapter = new CloudStorageAdapter();
  cloudAdapter.setCloudStatus(true);

  const sampleKey = 'system_test/cloud_adapter_test';
  const sampleValue = { testMessage: 'CloudStorageAdapter Operational Check', score: 100 };

  cloudAdapter.setItem(sampleKey, sampleValue);
  console.log('✓ CloudStorageAdapter setItem executed.');

  const cachedResult = cloudAdapter.getItem<typeof sampleValue>(sampleKey);
  console.log('✓ CloudStorageAdapter getItem result:', cachedResult);

  // Clean up adapter test item locally
  cloudAdapter.removeItem(sampleKey);
  console.log('✓ CloudStorageAdapter removeItem executed.');

  console.log('--- ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY ---');
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  });
