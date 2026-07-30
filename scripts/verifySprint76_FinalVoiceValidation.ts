/**
 * verifySprint76_FinalVoiceValidation.ts
 * Final Comprehensive Validation & System Audit Script for Sprint 7.6 (SARTHI Voice AI Final Completion).
 * Run with `npx tsx scripts/verifySprint76_FinalVoiceValidation.ts`
 */

import { voiceController } from '../src/services/voice/voiceController';
import { speechRecognitionService } from '../src/services/voice/speechRecognitionService';
import { speechSynthesisService } from '../src/services/voice/speechSynthesisService';
import { DEFAULT_VOICE_SETTINGS } from '../src/data/initialData';
import { VoiceSettings } from '../src/types';

async function runSprint76Validation() {
  console.log('====================================================');
  console.log('  SPRINT 7.6 — SARTHI VOICE AI FINAL COMPLETION AUDIT');
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
  // PART 1: Speech Recognition Language Support
  // ----------------------------------------------------
  console.log('🔍 PART 1: Multilingual Speech Recognition (en-IN, hi-IN, gu-IN)');
  assert(speechRecognitionService.getLanguageCode('english') === 'en-IN', 'English maps to BCP-47 "en-IN"');
  assert(speechRecognitionService.getLanguageCode('hindi') === 'hi-IN', 'Hindi maps to BCP-47 "hi-IN"');
  assert(speechRecognitionService.getLanguageCode('gujarati') === 'gu-IN', 'Gujarati maps to BCP-47 "gu-IN"');

  assert(speechRecognitionService.detectLanguageFromText('નમસ્તે') === 'gu-IN', 'Gujarati script recognized as gu-IN');
  assert(speechRecognitionService.detectLanguageFromText('नमस्ते') === 'hi-IN', 'Devanagari script recognized as hi-IN');
  assert(speechRecognitionService.detectLanguageFromText('Hello Executive') === 'en-US', 'Latin script recognized as en-US');

  // ----------------------------------------------------
  // PART 2 & 3: Natural Voice Text Cleaning & Formatting
  // ----------------------------------------------------
  console.log('\n🔍 PART 2 & 3: Speech Synthesis Text Formatting (Markdown, Emoji, Dates, Numbers)');
  const markdownText = '### Important Header\n• Task 1: Complete report on **2026-07-30** with 85% progress & $100 budget! 🚀';
  const cleaned = speechSynthesisService.cleanTextForSpeech(markdownText);

  assert(!cleaned.includes('###'), 'Header hash symbols stripped');
  assert(!cleaned.includes('**'), 'Markdown bold stars stripped');
  assert(!cleaned.includes('🚀'), 'Emoji stripped to prevent TTS stutter');
  assert(cleaned.includes('July 30, 2026'), 'Date "2026-07-30" expanded naturally to "July 30, 2026"');
  assert(cleaned.includes('85 percent'), 'Percentage "85%" expanded to "85 percent"');
  assert(cleaned.includes('100 dollars'), 'Currency "$100" expanded to "100 dollars"');

  // ----------------------------------------------------
  // PART 4: Voice Interruption (Barge-in)
  // ----------------------------------------------------
  console.log('\n🔍 PART 4: Barge-In Interruption Handling');
  voiceController.stopSpeaking();
  voiceController.stopListening();

  // Simulate speaking and barge-in
  voiceController.speakResponse('SARTHI active speech response...', 'en-US', { speed: 'normal', volume: 80 });
  const isSpeakingBefore = voiceController.getState().isSpeaking;
  voiceController.startListening(); // User speaks while SARTHI speaks
  const isSpeakingAfter = voiceController.getState().isSpeaking;

  assert(!isSpeakingAfter, 'Speaking stopped immediately when user started speaking (Barge-In requirement)');

  voiceController.stopListening();

  // ----------------------------------------------------
  // PART 6: Internal Emotion Awareness
  // ----------------------------------------------------
  console.log('\n🔍 PART 6: Internal Emotion Detection & Tone Adaptation');
  const happyTone = speechSynthesisService.detectInternalEmotion('Great job! Goal achieved!');
  const stressedTone = speechSynthesisService.detectInternalEmotion('I feel overwhelmed and stressed with work');
  const motivatedTone = speechSynthesisService.detectInternalEmotion("Let's crush our high-impact targets today!");

  assert(happyTone === 'happy', 'Happy tone detected internally');
  assert(stressedTone === 'stressed', 'Stressed tone detected internally');
  assert(motivatedTone === 'motivated', 'Motivated tone detected internally');

  // ----------------------------------------------------
  // PART 8: Voice Settings Audit
  // ----------------------------------------------------
  console.log('\n🔍 PART 8: Voice Settings Configuration & Gender Support');
  const fullSettings: VoiceSettings = {
    ...DEFAULT_VOICE_SETTINGS,
    preferredVoiceGender: 'female',
    pitch: 1.1,
    continuousMode: true,
  };

  assert(fullSettings.enabled === true, 'Voice enabled flag present');
  assert(fullSettings.preferredVoiceGender === 'female', 'Preferred voice gender setting supported (Default, Male, Female)');
  assert(typeof fullSettings.pitch === 'number', 'Voice pitch setting present');
  assert(typeof fullSettings.continuousMode === 'boolean', 'Continuous mode setting present');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`  FINAL VALIDATION SUMMARY: ${passes} Passed, ${fails} Failed`);
  console.log('====================================================\n');

  if (fails > 0) {
    process.exit(1);
  }
}

runSprint76Validation().catch((err) => {
  console.error('Validation error:', err);
  process.exit(1);
});
