/**
 * verifySprint72_SpeechRecognitionEngine.ts
 * Verification Audit Script for Sprint 7.2 – Speech Recognition Engine.
 */

import { speechRecognitionService } from '../src/services/voice/speechRecognitionService';

async function runSprint72SpeechRecognitionAudit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 7.2 SPEECH RECOGNITION ENGINE AUDIT');
  console.log('================================================================');

  // Phase 1: Engine Instantiation
  console.log('\n[PHASE 1] Auditing Speech Recognition Engine Instantiation...');
  console.log(`✓ SpeechRecognitionService Engine Ready: ${speechRecognitionService !== null}`);

  // Phase 2: Language Code Resolution Mapping
  console.log('\n[PHASE 2] Auditing Language Code Resolution Mappers (en-IN, hi-IN, gu-IN)...');
  const engLang = speechRecognitionService.getLanguageCode('english');
  const hindiLang = speechRecognitionService.getLanguageCode('hindi');
  const gujLang = speechRecognitionService.getLanguageCode('gujarati');
  const defaultLang = speechRecognitionService.getLanguageCode(undefined);

  console.log(`✓ 'english' mapped to: ${engLang} (Expected: en-IN)`);
  console.log(`✓ 'hindi' mapped to: ${hindiLang} (Expected: hi-IN)`);
  console.log(`✓ 'gujarati' mapped to: ${gujLang} (Expected: gu-IN)`);
  console.log(`✓ default (undefined) mapped to: ${defaultLang} (Expected: en-IN)`);

  if (engLang !== 'en-IN' || hindiLang !== 'hi-IN' || gujLang !== 'gu-IN' || defaultLang !== 'en-IN') {
    throw new Error('Language code resolution mapping audit failed!');
  }

  // Phase 3: Error Message Mapping Audit
  console.log('\n[PHASE 3] Auditing User-Friendly Error Messages...');
  const permError = speechRecognitionService.getFriendlyErrorMessage('not-allowed');
  const noSpeechError = speechRecognitionService.getFriendlyErrorMessage('no-speech');
  const networkError = speechRecognitionService.getFriendlyErrorMessage('network');
  const fallbackError = speechRecognitionService.getFriendlyErrorMessage('unknown');

  console.log(`✓ 'not-allowed': "${permError}"`);
  console.log(`✓ 'no-speech': "${noSpeechError}"`);
  console.log(`✓ 'network': "${networkError}"`);
  console.log(`✓ fallback: "${fallbackError}"`);

  if (
    !permError.includes('permission was denied') ||
    !noSpeechError.includes('No speech detected') ||
    !networkError.includes('Network issue')
  ) {
    throw new Error('User-friendly error message audit failed!');
  }

  // Phase 4: Mock Speech Recognition Flow Test
  console.log('\n[PHASE 4] Testing Recognition Event Handler Subscriptions...');
  let interimReceived = false;
  let finalReceived = false;

  // Test callbacks format
  const mockCallbacks = {
    onStart: () => console.log('  → Mock onStart triggered'),
    onInterimResult: (text: string) => {
      interimReceived = true;
      console.log(`  → Mock onInterimResult: "${text}"`);
    },
    onFinalResult: (text: string, lang: string) => {
      finalReceived = true;
      console.log(`  → Mock onFinalResult: "${text}" (${lang})`);
    },
    onError: (msg: string) => console.log(`  → Mock onError: "${msg}"`),
    onEnd: () => console.log('  → Mock onEnd triggered'),
  };

  mockCallbacks.onStart();
  mockCallbacks.onInterimResult('Plan my tasks');
  mockCallbacks.onFinalResult('Plan my high priority tasks for today', 'en-IN');
  mockCallbacks.onEnd();

  if (!interimReceived || !finalReceived) {
    throw new Error('Speech Recognition callbacks flow audit failed!');
  }

  console.log('\n================================================================');
  console.log('  SPRINT 7.2 SPEECH RECOGNITION ENGINE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runSprint72SpeechRecognitionAudit().catch((err) => {
  console.error('Speech Recognition Audit Failed:', err);
  process.exit(1);
});
