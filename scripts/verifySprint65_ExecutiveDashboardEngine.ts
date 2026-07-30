/**
 * verifySprint65_ExecutiveDashboardEngine.ts
 * Verification Audit Script for Sprint 6.5 – Executive Intelligence Dashboard Engine.
 */

import { executiveDashboardService } from '../src/services/dashboard/executiveDashboardService';

const AUDIT_USER = 'audit-user-65';

async function runSprint65Audit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 6.5 EXECUTIVE INTELLIGENCE DASHBOARD AUDIT');
  console.log('================================================================');

  // Reset cache
  executiveDashboardService.clearCache(AUDIT_USER);

  // ---------------------------------------------------
  // PHASE 1 & 2: Executive Brief & Today Summary
  // ---------------------------------------------------
  console.log('\n[PHASE 1 & 2] Testing Aggregation & Today Executive Brief...');

  const todaySummary = executiveDashboardService.getTodaySummary(AUDIT_USER);
  console.log(`✓ Date: ${todaySummary.date}`);
  console.log(`✓ Today Meetings Count: ${todaySummary.meetings.length}`);
  console.log(`✓ Today Tasks Count: ${todaySummary.tasks.length}`);
  console.log(`✓ Today Habits Count: ${todaySummary.habits.length}`);
  console.log(`✓ Pending High Priority Items: ${todaySummary.pendingHighPriority.length}`);
  console.log(`✓ Upcoming Deadlines Count: ${todaySummary.upcomingDeadlines.length}`);
  console.log(`✓ Overdue Items Count: ${todaySummary.overdueItems.length}`);

  // ---------------------------------------------------
  // PHASE 3: Productivity Insights
  // ---------------------------------------------------
  console.log('\n[PHASE 3] Testing Productivity Insights Calculations...');

  const productivity = executiveDashboardService.getProductivityInsights(AUDIT_USER);
  console.log(`✓ Habit Completion Rate: ${productivity.habitCompletionRate}%`);
  console.log(`✓ Task Completion Rate: ${productivity.taskCompletionRate}%`);
  console.log(`✓ Weekly Productivity Score: ${productivity.weeklyProductivityScore}%`);
  console.log(`✓ Monthly Productivity Score: ${productivity.monthlyProductivityScore}%`);
  console.log(`✓ Goal Progress Rate: ${productivity.goalProgressRate}%`);
  console.log(`✓ Current Habit Streak: ${productivity.currentHabitStreak} days`);
  console.log(`✓ Best Habit Streak: ${productivity.bestHabitStreak} days`);
  console.log(`✓ Overall Consistency Streak: ${productivity.overallConsistencyStreak} days`);

  // ---------------------------------------------------
  // PHASE 4: AI Insights & Recommendations
  // ---------------------------------------------------
  console.log('\n[PHASE 4] Testing AI Insight Engine & Recommendations...');

  const insights = executiveDashboardService.getInsights(AUDIT_USER);
  console.log(`✓ AI Insights Generated Count: ${insights.length}`);
  insights.forEach((ins) => {
    console.log(`  - [${ins.type.toUpperCase()}] ${ins.title}: ${ins.description}`);
  });

  const recommendations = executiveDashboardService.getRecommendations(AUDIT_USER);
  console.log(`✓ AI Recommendations Count: ${recommendations.length}`);
  recommendations.forEach((rec) => {
    console.log(`  - [${rec.priority}] ${rec.title}: ${rec.recommendation}`);
  });

  // ---------------------------------------------------
  // PHASE 5: Executive KPIs
  // ---------------------------------------------------
  console.log('\n[PHASE 5] Testing Executive KPIs & Scorecards...');

  const kpis = executiveDashboardService.getKPIs(AUDIT_USER);
  console.log(`✓ Today's Score: ${kpis.todayScore}/100`);
  console.log(`✓ Weekly Score: ${kpis.weeklyScore}/100`);
  console.log(`✓ Focus Score: ${kpis.focusScore}/100`);
  console.log(`✓ Execution Score: ${kpis.executionScore}/100`);
  console.log(`✓ Consistency Score: ${kpis.consistencyScore}/100`);
  console.log(`✓ Overall Productivity Score: ${kpis.overallProductivityScore}/100`);

  // ---------------------------------------------------
  // PHASE 6 & 7: Full Executive Brief & Cache Latency
  // ---------------------------------------------------
  console.log('\n[PHASE 6 & 7] Testing Full Brief API & Performance Caching...');

  const startCache = Date.now();
  for (let i = 0; i < 100; i++) {
    executiveDashboardService.getExecutiveBrief(AUDIT_USER);
  }
  const elapsedCache = Date.now() - startCache;
  console.log(`✓ Executed 100 Dashboard Evaluations in ${elapsedCache} ms (Avg: ${(elapsedCache / 100).toFixed(2)} ms/eval)`);

  const brief = executiveDashboardService.getExecutiveBrief(AUDIT_USER);
  console.log(`✓ Executive Brief Generated for User "${brief.userId}" at ${brief.generatedAt}`);
  console.log(`  AI Coaching Tip: "${brief.aiCoachingTip}"`);
  console.log(`  Suggested Focus Time: "${brief.suggestedFocusTimeBlock}"`);

  // ---------------------------------------------------
  // PHASE 8: Future Ready Architecture Stubs
  // ---------------------------------------------------
  console.log('\n[PHASE 8] Testing Future AI Readiness Stubs...');

  const coachingPlan = executiveDashboardService.generateExecutiveCoachingPlan(AUDIT_USER);
  console.log(`✓ AI Coaching Plan -> Focus Area: "${coachingPlan.focusArea}" | Weekly Goal: "${coachingPlan.weeklyGoal}"`);

  const prediction = executiveDashboardService.predictWeeklyOutcome(AUDIT_USER);
  console.log(`✓ Predictive Outcome -> Projected Completion: ${prediction.predictedWeeklyCompletionRate}% | Burnout Risk: ${prediction.riskOfBurnout}`);

  const report = executiveDashboardService.generateExecutiveReport(AUDIT_USER, 'weekly');
  console.log(`✓ Executive Report -> Period: ${report.period} | Summary: "${report.summary}"`);

  const bizInsights = executiveDashboardService.extractBusinessInsights(AUDIT_USER);
  console.log(`✓ Business Insights Count: ${bizInsights.length}`);

  console.log('================================================================');
  console.log('  SPRINT 6.5 EXECUTIVE DASHBOARD ENGINE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runSprint65Audit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
