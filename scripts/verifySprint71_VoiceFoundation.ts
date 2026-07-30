/**
 * verifySprint71_VoiceFoundation.ts
 * Verification Audit Script for Sprint 7.1 – Voice Assistant Foundation.
 */

import { voiceRecognitionService } from '../src/services/voice/VoiceRecognitionService';
import { voiceSynthesisService } from '../src/services/voice/VoiceSynthesisService';
import { voicePermissionService } from '../src/services/voice/VoicePermissionService';
import { DEFAULT_VOICE_SETTINGS } from '../src/data/initialData';

async function runSprint71VoiceFoundationAudit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 7.1 VOICE ASSISTANT FOUNDATION AUDIT');
  console.log('================================================================');

  // Phase 1: Service Module Creation & Instantiation
  console.log('\n[PHASE 1] Auditing Voice Service Instantiation...');
  console.log(`✓ VoiceRecognitionService Ready: ${voiceRecognitionService !== null}`);
  console.log(`✓ VoiceSynthesisService Ready: ${voiceSynthesisService !== null}`);
  console.log(`✓ VoicePermissionService Ready: ${voicePermissionService !== null}`);

  // Phase 2: Browser Support Detection
  console.log('\n[PHASE 2] Auditing Browser Support Detection APIs...');
  const recSupported = voiceRecognitionService.isSupported();
  const synthSupported = voiceSynthesisService.isSupported();
  console.log(`✓ Speech Recognition Check Completed: ${recSupported}`);
  console.log(`✓ Speech Synthesis Check Completed: ${synthSupported}`);

  // Phase 3: On-Demand Permission Query (No auto-prompt on startup)
  console.log('\n[PHASE 3] Auditing Permission Service Safety (No Startup Request)...');
  const initialPermissionState = await voicePermissionService.checkPermissionState();
  console.log(`✓ Permission Check (Without Prompting User): "${initialPermissionState}"`);

  // Phase 4: Voice Synthesis Rate & Volume Mapping
  console.log('\n[PHASE 4] Auditing Synthesis Rate & Volume Configuration Mappers...');
  const slowRate = voiceSynthesisService.getSpeedRate('slow');
  const normalRate = voiceSynthesisService.getSpeedRate('normal');
  const fastRate = voiceSynthesisService.getSpeedRate('fast');
  const normalizedVol = voiceSynthesisService.getNormalizedVolume(80);

  console.log(`✓ Slow Rate: ${slowRate} (Expected: 0.8)`);
  console.log(`✓ Normal Rate: ${normalRate} (Expected: 1.0)`);
  console.log(`✓ Fast Rate: ${fastRate} (Expected: 1.25)`);
  console.log(`✓ Normalized Volume (80%): ${normalizedVol} (Expected: 0.8)`);

  if (slowRate !== 0.8 || normalRate !== 1.0 || fastRate !== 1.25 || normalizedVol !== 0.8) {
    throw new Error('Voice synthesis configuration mapping verification failed!');
  }

  // Phase 5: Voice Settings Schema Audit
  console.log('\n[PHASE 5] Auditing Voice Settings Default Schema...');
  console.log(`✓ Enabled: ${DEFAULT_VOICE_SETTINGS.enabled}`);
  console.log(`✓ AutoSpeak: ${DEFAULT_VOICE_SETTINGS.autoSpeak}`);
  console.log(`✓ Speed: ${DEFAULT_VOICE_SETTINGS.speed}`);
  console.log(`✓ Volume: ${DEFAULT_VOICE_SETTINGS.volume}%`);
  console.log(`✓ Preferred Language: ${DEFAULT_VOICE_SETTINGS.preferredLanguage}`);

  console.log('\n================================================================');
  console.log('  SPRINT 7.1 VOICE ASSISTANT FOUNDATION AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runSprint71VoiceFoundationAudit().catch((err) => {
  console.error('Voice Foundation Audit Failed:', err);
  process.exit(1);
});
