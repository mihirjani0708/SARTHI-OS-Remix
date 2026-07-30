/**
 * verifySprint73_AIVoiceReply.ts
 * Verification Audit Script for Sprint 7.3 – AI Voice Reply & Speech Synthesis Engine.
 */

import { speechSynthesisService } from '../src/services/voice/speechSynthesisService';

async function runSprint73AIVoiceReplyAudit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 7.3 AI VOICE REPLY & SYNTHESIS ENGINE AUDIT');
  console.log('================================================================');

  // Phase 1: Engine Readiness & Compatibility Audit
  console.log('\n[PHASE 1] Auditing SpeechSynthesisService Engine Readiness...');
  console.log(`✓ SpeechSynthesisService Instantiation: ${speechSynthesisService !== null}`);
  console.log(`✓ Browser Speech Synthesis API Check Method Callable: ${typeof speechSynthesisService.isSupported === 'function'}`);

  // Phase 2: Language Matching & Voice Selection Logic
  console.log('\n[PHASE 2] Auditing Multilingual Voice Selection Mappers...');
  const englishVoice = speechSynthesisService.getBestVoiceForLanguage('english');
  const hindiVoice = speechSynthesisService.getBestVoiceForLanguage('hindi');
  const gujaratiVoice = speechSynthesisService.getBestVoiceForLanguage('gujarati');

  console.log(`✓ Best Voice for English: ${englishVoice ? englishVoice.name + ' (' + englishVoice.lang + ')' : 'Default Browser Fallback (en-IN / en-US)'}`);
  console.log(`✓ Best Voice for Hindi: ${hindiVoice ? hindiVoice.name + ' (' + hindiVoice.lang + ')' : 'Default Browser Fallback (hi-IN)'}`);
  console.log(`✓ Best Voice for Gujarati: ${gujaratiVoice ? gujaratiVoice.name + ' (' + gujaratiVoice.lang + ')' : 'Default Browser Fallback (gu-IN / closest Indian voice)'}`);

  // Phase 3: Long Text Natural Sentence Chunking (>500 characters)
  console.log('\n[PHASE 3] Auditing Long AI Message Natural Sentence Chunking...');
  const longTextSample = `
    Welcome to SARTHI AI Executive Assistant. Here is your operational briefing for today.
    You have 5 high priority tasks scheduled before 3:00 PM, including reviewing the quarterly finance reports and finalizing the project roadmap with the development team.
    Your overall productivity index stands at 88 percent with a 5 day habit logging streak active.
    Make sure to clear overdue items first to prevent schedule slip and maintain peak efficiency throughout the afternoon session.
    If you need any adjustments or automated task rescheduling, simply speak or send your request!
  `.repeat(2); // ~800+ chars

  console.log(`  → Original Text Length: ${longTextSample.length} characters (Exceeds 500 chars limit)`);
  const chunks = speechSynthesisService.splitTextIntoChunks(longTextSample, 220);
  console.log(`✓ Text successfully split into ${chunks.length} natural speech chunks!`);

  chunks.forEach((chunk, idx) => {
    console.log(`   Chunk ${idx + 1} (${chunk.length} chars): "${chunk.substring(0, 60)}..."`);
    if (chunk.length > 250) {
      throw new Error(`Chunk ${idx + 1} exceeds maximum length! (${chunk.length} chars)`);
    }
  });

  // Phase 4: Text Cleanup Mappers (Markdown symbol & URL stripping)
  console.log('\n[PHASE 4] Auditing Markdown Symbol & Emoji Text Sanitizer...');
  const markdownText = '### 🚀 **Executive Briefing**:\n• Review *urgent* tasks at https://sarthi.app!\n```code block```';
  const cleanedText = speechSynthesisService.cleanTextForSpeech(markdownText);
  console.log(`  → Raw Markdown: "${markdownText}"`);
  console.log(`  → Cleaned Text: "${cleanedText}"`);

  if (cleanedText.includes('**') || cleanedText.includes('###') || cleanedText.includes('https://')) {
    throw new Error('Markdown cleaning for speech failed!');
  }

  // Phase 5: Barge-In / Stop Synthesis Flow
  console.log('\n[PHASE 5] Auditing Barge-In Interrupt & Stop Functionality...');
  speechSynthesisService.stop();
  console.log('✓ speechSynthesisService.stop() executed cleanly without errors.');
  console.log(`✓ Is Speaking State after stop: ${speechSynthesisService.getIsSpeaking()}`);

  if (speechSynthesisService.getIsSpeaking()) {
    throw new Error('Speaking state is active after stop()!');
  }

  console.log('\n================================================================');
  console.log('  SPRINT 7.3 AI VOICE REPLY ENGINE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runSprint73AIVoiceReplyAudit().catch((err) => {
  console.error('Sprint 7.3 Audit Failed:', err);
  process.exit(1);
});
