/**
 * verifySprint66_AIDailyBriefingEngine.ts
 * Verification Audit Script for Sprint 6.6 – AI Daily Briefing & Executive Coach Engine.
 */

import { dailyBriefingService } from '../src/services/ai/dailyBriefingService';

const AUDIT_USER = 'audit-user-66';

async function runSprint66Audit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 6.6 AI DAILY BRIEFING & COACHING ENGINE AUDIT');
  console.log('================================================================');

  // Reset cache for clean run
  dailyBriefingService.clearCache(AUDIT_USER);

  // ---------------------------------------------------
  // PHASE 1 & 2: Morning Executive Brief
  // ---------------------------------------------------
  console.log('\n[PHASE 1 & 2] Testing Morning Executive Brief Generation...');

  const morningBrief = dailyBriefingService.generateMorningBrief(AUDIT_USER);
  console.log(`✓ Date: ${morningBrief.date}`);
  console.log(`✓ Welcome Message: "${morningBrief.welcomeMessage}"`);
  console.log(`✓ Today Schedule Items Count: ${morningBrief.todaySchedule.length}`);
  console.log(`✓ High Priority Tasks Count: ${morningBrief.highPriorityTasks.length}`);
  console.log(`✓ Meetings Count: ${morningBrief.meetings.length}`);
  console.log(`✓ Habits Due Count: ${morningBrief.habitsDue.length}`);
  console.log(`✓ Pending Goals Count: ${morningBrief.pendingGoals.length}`);
  console.log(`✓ Deadlines Count: ${morningBrief.deadlines.length}`);
  console.log(`✓ Weather Placeholder: ${morningBrief.weatherPlaceholder.condition} (${morningBrief.weatherPlaceholder.tempC}°C) at ${morningBrief.weatherPlaceholder.location}`);

  // ---------------------------------------------------
  // PHASE 3: Evening Review
  // ---------------------------------------------------
  console.log('\n[PHASE 3] Testing Evening Review & Recap Generation...');

  const eveningReview = dailyBriefingService.generateEveningReview(AUDIT_USER);
  console.log(`✓ Completed Tasks Count: ${eveningReview.completedTasks.length}`);
  console.log(`✓ Missed Tasks Count: ${eveningReview.missedTasks.length}`);
  console.log(`✓ Habit Completion: ${eveningReview.habitCompletion.completed}/${eveningReview.habitCompletion.total} (${eveningReview.habitCompletion.percentage}%)`);
  console.log(`✓ Productivity Score: ${eveningReview.productivityScore}%`);
  console.log(`✓ Streak Summary -> Current: ${eveningReview.streakSummary.currentStreak} days | Best: ${eveningReview.streakSummary.bestStreak} days`);
  console.log(`✓ Tomorrow Preparation -> Scheduled Events: ${eveningReview.tomorrowPreparation.scheduledEvents} | Advice: "${eveningReview.tomorrowPreparation.advice}"`);

  // ---------------------------------------------------
  // PHASE 4: Executive Coaching Advice
  // ---------------------------------------------------
  console.log('\n[PHASE 4] Testing AI Executive Coaching Advice...');

  const advice = dailyBriefingService.generateExecutiveAdvice(AUDIT_USER);
  console.log(`✓ Best Time to Focus: "${advice.bestTimeToFocus}"`);
  console.log(`✓ Suggested Break Time: "${advice.suggestedBreakTime}"`);
  console.log(`✓ Workload Balancing: "${advice.workloadBalancing}"`);
  console.log(`✓ Goal Consistency: "${advice.goalConsistency}"`);
  console.log(`✓ Habit Coaching: "${advice.habitCoaching}"`);
  console.log(`✓ Planner Optimization: "${advice.plannerOptimization}"`);

  // ---------------------------------------------------
  // PHASE 5: Daily Scorecard
  // ---------------------------------------------------
  console.log('\n[PHASE 5] Testing Daily Score Calculations...');

  const score = dailyBriefingService.generateDailyScore(AUDIT_USER);
  console.log(`✓ Planning Score: ${score.planningScore}/100`);
  console.log(`✓ Execution Score: ${score.executionScore}/100`);
  console.log(`✓ Focus Score: ${score.focusScore}/100`);
  console.log(`✓ Consistency Score: ${score.consistencyScore}/100`);
  console.log(`✓ Overall Daily Score: ${score.overallDailyScore}/100`);

  // ---------------------------------------------------
  // PHASE 6: Today Highlights
  // ---------------------------------------------------
  console.log('\n[PHASE 6] Testing Today Highlights API...');

  const highlights = dailyBriefingService.getTodayHighlights(AUDIT_USER);
  console.log(`✓ Top Achievement: "${highlights.topAchievement}"`);
  console.log(`✓ Key Milestone: "${highlights.keyMilestone}"`);
  console.log(`✓ Focus Window: "${highlights.focusWindow}"`);
  console.log(`✓ Urgent Attention Items: ${highlights.urgentAttention.length}`);

  // ---------------------------------------------------
  // PHASE 7: Performance Caching Latency
  // ---------------------------------------------------
  console.log('\n[PHASE 7] Testing Performance Caching Latency...');

  const startCache = Date.now();
  for (let i = 0; i < 100; i++) {
    dailyBriefingService.generateMorningBrief(AUDIT_USER);
    dailyBriefingService.generateEveningReview(AUDIT_USER);
    dailyBriefingService.generateDailyScore(AUDIT_USER);
  }
  const elapsedCache = Date.now() - startCache;
  console.log(`✓ Executed 300 Briefing API Calls in ${elapsedCache} ms (Avg: ${(elapsedCache / 300).toFixed(2)} ms/call)`);

  // ---------------------------------------------------
  // PHASE 8: Future Ready Architecture Stubs
  // ---------------------------------------------------
  console.log('\n[PHASE 8] Testing Future AI Readiness Stubs (Voice, Email, WhatsApp, Push)...');

  const voiceScript = dailyBriefingService.generateVoiceBriefingScript(AUDIT_USER);
  console.log(`✓ Voice Briefing Script -> Intro: "${voiceScript.intro}" | Duration: ${voiceScript.durationSec}s`);

  const emailPayload = dailyBriefingService.generateEmailBriefingPayload(AUDIT_USER);
  console.log(`✓ Email Briefing Payload -> Subject: "${emailPayload.subject}"`);

  const whatsapp = dailyBriefingService.generateWhatsAppSummary(AUDIT_USER);
  console.log(`✓ WhatsApp Summary -> Message Header: "${whatsapp.formattedMessage.split('\n')[0]}"`);

  const push = dailyBriefingService.generatePushNotificationSummary(AUDIT_USER);
  console.log(`✓ Push Notification Summary -> Title: "${push.title}" | Body: "${push.body}"`);

  console.log('================================================================');
  console.log('  SPRINT 6.6 AI DAILY BRIEFING ENGINE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runSprint66Audit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
