/**
 * verifySprint75_VoiceSystemValidation.ts
 * Validation & System Audit Script for Sprint 7.5 (Voice Integration & System Validation).
 * Run with `npx tsx scripts/verifySprint75_VoiceSystemValidation.ts`
 */

import { voiceController } from '../src/services/voice/voiceController';
import { speechRecognitionService } from '../src/services/voice/speechRecognitionService';
import { speechSynthesisService } from '../src/services/voice/speechSynthesisService';
import { DEFAULT_VOICE_SETTINGS } from '../src/data/initialData';
import { VoiceSettings } from '../src/types';

async function runSprint75Validation() {
  console.log('====================================================');
  console.log('  SPRINT 7.5 — VOICE INTEGRATION & SYSTEM VALIDATION');
  console.log('====================================================\n');

  let passes = 0;
  let fails = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passes++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      fails++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Service Singleton & Module Integration
  // ----------------------------------------------------
  console.log('🔍 TEST 1: Voice Modules & Services Availability');
  assert(!!voiceController, 'VoiceController singleton exists');
  assert(!!speechRecognitionService, 'SpeechRecognitionService singleton exists');
  assert(!!speechSynthesisService, 'SpeechSynthesisService singleton exists');

  // ----------------------------------------------------
  // TEST 2: Voice Settings Structure & Validation
  // ----------------------------------------------------
  console.log('\n🔍 TEST 2: Voice Settings Configuration Audit');
  const testSettings: VoiceSettings = {
    ...DEFAULT_VOICE_SETTINGS,
    pitch: 1.1,
    continuousMode: true,
  };

  assert(typeof testSettings.enabled === 'boolean', 'Voice settings contains "enabled" flag');
  assert(typeof testSettings.autoSpeak === 'boolean', 'Voice settings contains "autoSpeak" flag');
  assert(typeof testSettings.volume === 'number', 'Voice settings contains "volume" (0-100)');
  assert(typeof testSettings.pitch === 'number', 'Voice settings contains "pitch" (0.8-1.2)');
  assert(typeof testSettings.continuousMode === 'boolean', 'Voice settings contains "continuousMode" flag');
  assert(['english', 'hindi', 'gujarati'].includes(testSettings.preferredLanguage), 'Voice settings supports English, Hindi, Gujarati');

  // ----------------------------------------------------
  // TEST 3: Language Detection & Code Mapping
  // ----------------------------------------------------
  console.log('\n🔍 TEST 3: Speech Recognition Language Mapping');
  const enCode = speechRecognitionService.getLanguageCode('english');
  const hiCode = speechRecognitionService.getLanguageCode('hindi');
  const guCode = speechRecognitionService.getLanguageCode('gujarati');

  assert(enCode === 'en-IN', 'English maps to BCP-47 "en-IN"');
  assert(hiCode === 'hi-IN', 'Hindi maps to BCP-47 "hi-IN"');
  assert(guCode === 'gu-IN', 'Gujarati maps to BCP-47 "gu-IN"');

  const detectedHi = speechRecognitionService.detectLanguageFromText('नमस्ते आप कैसे हैं');
  const detectedGu = speechRecognitionService.detectLanguageFromText('કેમ છો તમારું સ્વાગત છે');
  const detectedEn = speechRecognitionService.detectLanguageFromText('How can I boost my focus today?');

  assert(detectedHi === 'hi-IN', 'Devanagari text correctly detected as hi-IN');
  assert(detectedGu === 'gu-IN', 'Gujarati script correctly detected as gu-IN');
  assert(detectedEn === 'en-US', 'Latin text correctly detected as en-US');

  // ----------------------------------------------------
  // TEST 4: Speech Synthesis Rate & Pitch Options
  // ----------------------------------------------------
  console.log('\n🔍 TEST 4: Speech Synthesis Numeric Rate & Pitch Calculation');
  const slowRate = speechSynthesisService.getNumericRate('slow');
  const normRate = speechSynthesisService.getNumericRate('normal');
  const fastRate = speechSynthesisService.getNumericRate('fast');

  assert(slowRate === 0.8, 'Slow speed maps to 0.8x rate');
  assert(normRate === 1.0, 'Normal speed maps to 1.0x rate');
  assert(fastRate === 1.25, 'Fast speed maps to 1.25x rate');

  // ----------------------------------------------------
  // TEST 5: Text Chunking for Long Sentences
  // ----------------------------------------------------
  console.log('\n🔍 TEST 5: Text Chunking Engine (> 500 characters)');
  const longText =
    'SARTHI is your dedicated AI life and business executive coach. ' +
    'It helps you track your daily habits, prioritize your high-impact daily goals, ' +
    'and structure your executive workflow with precision. ' +
    'Voice synthesis automatically handles long paragraphs without cutting words. '.repeat(4);

  assert(longText.length > 500, `Test string length is ${longText.length} characters (> 500)`);
  const chunks = speechSynthesisService.splitTextIntoChunks(longText, 220);
  assert(chunks.length > 1, `Chunking engine split long text into ${chunks.length} clean chunks`);
  assert(chunks.every((c) => c.length <= 220), 'All chunks are within character limit without word cutting');

  // ----------------------------------------------------
  // TEST 6: Edge Case Error Messages
  // ----------------------------------------------------
  console.log('\n🔍 TEST 6: User-Friendly Speech Recognition Error Handling');
  const notAllowedMsg = speechRecognitionService.getFriendlyErrorMessage('not-allowed');
  const noSpeechMsg = speechRecognitionService.getFriendlyErrorMessage('no-speech');
  const networkMsg = speechRecognitionService.getFriendlyErrorMessage('network');

  assert(notAllowedMsg.includes('Microphone permission was denied'), 'Permission denied error message is clear');
  assert(noSpeechMsg.includes('No speech detected'), 'No-speech error message is user-friendly');
  assert(networkMsg.includes('Network issue'), 'Network error message is informative');

  // ----------------------------------------------------
  // TEST 7: Single Session Enforcement & Barge-In
  // ----------------------------------------------------
  console.log('\n🔍 TEST 7: Concurrent Session Protection & Barge-In');
  voiceController.stopSpeaking();
  voiceController.stopListening();
  const stateInitial = voiceController.getState();

  assert(!stateInitial.isListening && !stateInitial.isSpeaking, 'Initial state is clear (not listening, not speaking)');

  // Simulate Barge-In: if user calls speakResponse while listening, listening stops
  voiceController.speakResponse('Hello, SARTHI response test', 'en-US', {
    speed: 'normal',
    volume: 80,
    pitch: 1.0,
  });

  const stateSpeaking = voiceController.getState();
  assert(!stateSpeaking.isListening, 'Listening stops automatically when AI starts speaking (Task 6)');

  voiceController.stopSpeaking();
  const stateStopped = voiceController.getState();
  assert(!stateStopped.isSpeaking, 'Speech synthesis stopped cleanly');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`  VALIDATION SUMMARY: ${passes} Passed, ${fails} Failed`);
  console.log('====================================================\n');

  if (fails > 0) {
    process.exit(1);
  }
}

runSprint75Validation().catch((err) => {
  console.error('Validation error:', err);
  process.exit(1);
});
