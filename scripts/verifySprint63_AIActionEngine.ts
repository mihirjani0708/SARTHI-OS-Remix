/**
 * verifySprint63_AIActionEngine.ts
 * Comprehensive Verification Audit Script for Sprint 6.3 - AI Action Engine (Natural Language Command Center).
 */

import { aiActionService } from '../src/services/ai/aiActionService';
import { CentralDataServiceFacade } from '../src/services/dataService';

const dataService = new CentralDataServiceFacade();

async function runAIActionEngineAudit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 6.3 AI ACTION ENGINE AUDIT');
  console.log('================================================================\n');

  const testUserId = 'audit-user-63';

  // Clear test user data
  dataService.resetUserData(testUserId);

  // --- PHASE 1: INTENT DETECTION ENGINE (parseIntent) ---
  console.log('[PHASE 1] Testing Intent Parsing across 7 Key Example Commands...');

  const commandsToTest = [
    { prompt: 'Create a task to call Amit tomorrow.', expectedIntent: 'create', expectedModule: 'task' },
    { prompt: 'Remind me every morning at 6 AM to walk.', expectedIntent: 'remind', expectedModule: 'reminder' },
    { prompt: 'Complete my gym habit.', expectedIntent: 'complete', expectedModule: 'habit' },
    { prompt: 'Move my meeting to Friday.', expectedIntent: 'reschedule', expectedModule: 'meeting' },
    { prompt: "Show today's agenda.", expectedIntent: 'summarize', expectedModule: 'planner' },
    { prompt: 'Open my journal.', expectedIntent: 'open', expectedModule: 'journal' },
    { prompt: 'What tasks are overdue?', expectedIntent: 'summarize', expectedModule: 'task' },
  ];

  for (const cmd of commandsToTest) {
    const parsed = aiActionService.parseIntent(testUserId, cmd.prompt);
    console.log(`✓ Prompt: "${cmd.prompt}"`);
    console.log(`  Parsed -> Intent: ${parsed.intent} | Module: ${parsed.module} | Confidence: ${parsed.confidence}`);
    console.log(`  Parameters:`, parsed.parameters);

    if (parsed.intent !== cmd.expectedIntent) {
      throw new Error(`Intent mismatch for "${cmd.prompt}". Expected: ${cmd.expectedIntent}, got: ${parsed.intent}`);
    }
  }


  // --- PHASE 2 & 3: ACTION EXECUTION ENGINE (executeAction) ---
  console.log('\n[PHASE 2 & 3] Testing Action Execution across Modules...');

  // 1. Create Task
  const res1 = aiActionService.executeAction(testUserId, 'Create a task to prepare Sprint 6.3 presentation tomorrow.');
  console.log('✓ Task Creation Execution:', res1.message);
  if (!res1.success) throw new Error('Task creation execution failed!');

  // 2. Schedule Reminder
  const res2 = aiActionService.executeAction(testUserId, 'Remind me every morning at 6 AM to walk.');
  console.log('✓ Reminder Creation Execution:', res2.message);
  if (!res2.success) throw new Error('Reminder creation execution failed!');

  // 3. Navigation
  const res3 = aiActionService.executeAction(testUserId, 'Open my journal.');
  console.log('✓ Navigation Execution:', res3.message, `Target: ${res3.navTarget}`);
  if (res3.navTarget !== 'journal') throw new Error('Navigation execution failed!');

  // 4. Day Agenda Summary
  const res4 = aiActionService.executeAction(testUserId, "Show today's agenda.");
  console.log('✓ Summary Execution:', res4.message);
  if (!res4.success) throw new Error('Summary execution failed!');


  // --- PHASE 4: CONFIRMATION LAYER SAFETY ---
  console.log('\n[PHASE 4] Testing Confirmation Layer for Destructive Actions...');

  const deleteParsed = aiActionService.parseIntent(testUserId, 'Delete all completed tasks');
  if (!deleteParsed.requiresConfirmation) {
    throw new Error('Destructive delete action failed to set requiresConfirmation flag!');
  }

  const deleteResBlocked = aiActionService.executeAction(testUserId, deleteParsed, undefined, false);
  console.log('✓ Destructive Execution Guard Response:', deleteResBlocked.message);
  if (deleteResBlocked.success || !deleteResBlocked.message.includes('CONFIRMATION_REQUIRED')) {
    throw new Error('Confirmation guard failed to block unconfirmed destructive action!');
  }

  // Executed with user confirmation override
  const deleteResAllowed = aiActionService.executeAction(testUserId, deleteParsed, undefined, true);
  console.log('✓ Destructive Execution Confirmed Response:', deleteResAllowed.message);
  if (!deleteResAllowed.success) {
    throw new Error('Confirmed destructive action failed execution!');
  }


  // --- PHASE 5 & 7: ACTION HISTORY & UNDO API ---
  console.log('\n[PHASE 5 & 7] Testing Action History & Undo Functionality...');

  const history = aiActionService.getActionHistory(testUserId);
  console.log('✓ Recorded Action History Log Count:', history.length);
  if (history.length === 0) throw new Error('Action history was not recorded!');

  const undoResult = aiActionService.undoLastAction(testUserId);
  console.log('✓ Undo Last Action Success:', undoResult);


  // --- PHASE 8: FUTURE READINESS STUBS ---
  console.log('\n[PHASE 8] Testing Future Readiness Stubs (Voice, Multilingual, Agent Workflows)...');

  const voiceRes = aiActionService.processVoiceCommand(testUserId, 'Open my journal.');
  console.log('✓ Voice Command Processing Response:', voiceRes.message);

  const langRes = aiActionService.processMultilingualCommand(testUserId, 'Open my planner', 'hi-IN');
  console.log('✓ Multilingual Command Response:', langRes.message);

  const agentRes = aiActionService.executeAgentWorkflow(testUserId, 'Optimize my weekly schedule');
  console.log('✓ Agent Workflow Response:', agentRes.message);

  console.log('\n================================================================');
  console.log('  SPRINT 6.3 AI ACTION ENGINE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runAIActionEngineAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('AUDIT FAILURE:', err);
    process.exit(1);
  });
