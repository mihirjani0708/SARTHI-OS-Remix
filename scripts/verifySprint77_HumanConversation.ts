/**
 * verifySprint77_HumanConversation.ts
 * Verification and automated testing script for Sprint 7.7 (Human Conversation Quality Upgrade).
 * Run with `npx tsx scripts/verifySprint77_HumanConversation.ts`
 */

import { autoCorrectService } from '../src/services/conversation/AutoCorrectService';
import { conversationFormatter } from '../src/services/conversation/ConversationFormatter';
import { naturalLanguageRewriter } from '../src/services/conversation/NaturalLanguageRewriter';
import { voiceSanitizer } from '../src/services/conversation/VoiceSanitizer';
import { conversationPipeline } from '../src/services/conversation';

async function runSprint77Validation() {
  console.log('====================================================');
  console.log('  SPRINT 7.7 — HUMAN CONVERSATION QUALITY AUDIT    ');
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

  // 1. AutoCorrectService Test
  console.log('🔍 1. AutoCorrectService (Typing, STT, Hindi/Gujarati Transliteration)');
  const typo1 = autoCorrectService.autoCorrectInput('pariotize my taks and schedul tomorow');
  assert(typo1.correctedText.includes('prioritize'), 'Spelling "pariotize" -> "prioritize"');
  assert(typo1.correctedText.includes('tasks'), 'Spelling "taks" -> "tasks"');
  assert(typo1.correctedText.includes('schedule'), 'Spelling "schedul" -> "schedule"');

  const hindi1 = autoCorrectService.autoCorrectInput('aaj ka plan kya hai');
  assert(hindi1.correctedText.includes("today's schedule and plan"), 'Hindi transliteration "aaj ka plan" expanded naturally');

  const gujarati1 = autoCorrectService.autoCorrectInput('kem cho sarthi, aaj no plan batavo');
  assert(gujarati1.correctedText.includes("how are you doing"), 'Gujarati transliteration "kem cho" recognized');
  assert(gujarati1.correctedText.includes("today's plan and goals"), 'Gujarati transliteration "aaj no plan" recognized');

  // 2. ConversationFormatter Test
  console.log('\n🔍 2. ConversationFormatter (Stripping JSON, Headers, AI Artifacts)');
  const rawAiMessage = '🤖 **SARTHI AI Workspace Insights:**\n\n```json\n{"status":"ok"}\n```\n### Agenda Overview\nBased on your live local dataset, you have **3 pending tasks**.';
  const formatted = conversationFormatter.formatResponse(rawAiMessage);
  assert(!formatted.includes('🤖'), 'Robotic bot emoji removed');
  assert(!formatted.includes('```json'), 'Raw JSON fence stripped');
  assert(!formatted.includes('Based on your live local dataset'), 'Robotic dataset prefix removed');
  assert(formatted.includes('Agenda Overview'), 'Header hashes converted gracefully');

  // 3. NaturalLanguageRewriter Test
  console.log('\n🔍 3. NaturalLanguageRewriter (Human Writing Style - Executive Assistant Tone)');
  const roboticAction = '⚡ **AI Action Executed:**\n\nTask created successfully: Review Board Deck';
  const humanizedAction = naturalLanguageRewriter.rewriteToHumanTone(roboticAction);
  assert(!humanizedAction.includes('⚡ **AI Action Executed:**'), 'Action banner stripped');
  assert(humanizedAction.includes("I've added that to your tasks"), 'Warm assistant phrasing applied');

  // 4. VoiceSanitizer Test
  console.log('\n🔍 4. VoiceSanitizer (TTS Formatting, Punctuation, Symbols, Numbers)');
  const markdownVoiceInput = '• **Meeting on 2026-07-30** at 04:30 PM with $150 budget (85% completed) 🚀 link: https://example.com';
  const sanitizedVoice = voiceSanitizer.sanitizeForSpeech(markdownVoiceInput);
  assert(!sanitizedVoice.includes('•'), 'Bullet points removed for speech');
  assert(!sanitizedVoice.includes('**'), 'Markdown stars stripped for speech');
  assert(!sanitizedVoice.includes('🚀'), 'Emojis removed for speech');
  assert(!sanitizedVoice.includes('https://example.com'), 'URLs stripped for speech');
  assert(sanitizedVoice.includes('July 30, 2026'), 'Date expanded to natural words');
  assert(sanitizedVoice.includes('150 dollars'), 'Currency expanded to words');
  assert(sanitizedVoice.includes('85 percent'), 'Percentage expanded to words');

  // 5. Unified ConversationPipeline Test
  console.log('\n🔍 5. Unified ConversationPipeline E2E Test');
  const e2eInput = 'pariotize my taks for aaje shu kaam chhe';
  const pipelineResult = conversationPipeline.processUserInput(e2eInput);
  assert(pipelineResult.correctedText.includes('prioritize'), 'Pipeline auto-corrected input');

  const rawAiOutput = '🤖 **SARTHI AI Workspace Insights:**\n\nClick any suggested prompt below or ask a question to optimize your workflow!';
  const pipelineAiOutput = conversationPipeline.processAIResponse(rawAiOutput);
  assert(!pipelineAiOutput.includes('🤖'), 'Pipeline cleaned output');
  assert(pipelineAiOutput.includes('Let me know if you would like me to adjust your priorities'), 'Pipeline rewritten to human tone');

  // SUMMARY
  console.log('\n====================================================');
  console.log(`  FINAL SPRINT 7.7 VALIDATION: ${passes} Passed, ${fails} Failed`);
  console.log('====================================================\n');

  if (fails > 0) {
    process.exit(1);
  }
}

runSprint77Validation().catch((err) => {
  console.error('Validation error:', err);
  process.exit(1);
});
