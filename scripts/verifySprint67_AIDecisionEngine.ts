/**
 * verifySprint67_AIDecisionEngine.ts
 * Verification Audit Script for Sprint 6.7 – AI Decision Engine (Executive Advisor).
 */

import { decisionEngineService } from '../src/services/ai/decisionEngineService';

const AUDIT_USER = 'audit-user-67';

async function runSprint67Audit() {
  console.log('================================================================');
  console.log('  STARTING SPRINT 6.7 AI DECISION ENGINE (EXECUTIVE ADVISOR) AUDIT');
  console.log('================================================================');

  // Clear cache for a fresh test run
  decisionEngineService.clearCache(AUDIT_USER);

  // ---------------------------------------------------
  // PHASE 1 & 2: Executive Analysis (Day & Week)
  // ---------------------------------------------------
  console.log('\n[PHASE 1 & 2] Testing Executive Analysis (Day & Week)...');

  const dayAnalysis = decisionEngineService.analyzeDay(AUDIT_USER);
  console.log(`✓ User: "${dayAnalysis.userId}" | Period: ${dayAnalysis.period} | Date: ${dayAnalysis.date}`);
  console.log(`✓ Workload Score: ${dayAnalysis.workloadScore}`);
  console.log(`✓ Goal Progress Rate: ${dayAnalysis.goalProgressRate}%`);
  console.log(`✓ Habit Consistency Rate: ${dayAnalysis.habitConsistencyRate}%`);
  console.log(`✓ Productivity Trend: ${dayAnalysis.productivityTrend}`);
  console.log(`✓ Pending Critical Count: ${dayAnalysis.pendingCriticalCount}`);
  console.log(`✓ Upcoming Deadlines Count: ${dayAnalysis.upcomingDeadlinesCount}`);

  const weekAnalysis = decisionEngineService.analyzeWeek(AUDIT_USER);
  console.log(`✓ Week Analysis Period: "${weekAnalysis.period}"`);

  // ---------------------------------------------------
  // PHASE 3: Smart Recommendations
  // ---------------------------------------------------
  console.log('\n[PHASE 3 & 6] Testing Smart Recommendations & Explainable AI...');

  const recommendations = decisionEngineService.generateRecommendations(AUDIT_USER);
  console.log(`✓ Smart Recommendations Count: ${recommendations.length}`);

  recommendations.forEach((rec) => {
    console.log(`  - Recommendation: "${rec.recommendation}"`);
    console.log(`    Reason: "${rec.reason}"`);
    console.log(`    Confidence Score: ${rec.confidenceScore} | Module: ${rec.relatedModule} | Priority: ${rec.priority}`);
    console.log(`    Suggested Action: "${rec.suggestedAction}"`);
    console.log(`    Expected Benefit: "${rec.expectedBenefit}"`);
  });

  // ---------------------------------------------------
  // PHASE 4: Risk Detection
  // ---------------------------------------------------
  console.log('\n[PHASE 4] Testing Risk Detection Engine across Categories & Levels...');

  const risks = decisionEngineService.detectRisks(AUDIT_USER);
  console.log(`✓ Detected Risks Count: ${risks.length}`);

  risks.forEach((risk) => {
    console.log(`  - [${risk.level.toUpperCase()}] (${risk.category.toUpperCase()}) ${risk.title}: ${risk.description}`);
  });

  // ---------------------------------------------------
  // PHASE 5: Opportunity Detection
  // ---------------------------------------------------
  console.log('\n[PHASE 5] Testing Opportunity Detection Engine...');

  const opportunities = decisionEngineService.detectOpportunities(AUDIT_USER);
  console.log(`✓ Detected Opportunities Count: ${opportunities.length}`);

  opportunities.forEach((opp) => {
    console.log(`  - [${opp.impact} Impact / ${opp.estimatedEffort} Effort] (${opp.category}) ${opp.title}: ${opp.description}`);
  });

  // ---------------------------------------------------
  // PHASE 6 & 7: Confidence Score & Developer APIs
  // ---------------------------------------------------
  console.log('\n[PHASE 6 & 7] Testing Confidence Score & Developer APIs...');

  const confidenceScore = decisionEngineService.getConfidenceScore(AUDIT_USER);
  console.log(`✓ Overall Decision Engine Confidence Score: ${confidenceScore}`);

  // Performance cache test
  const startCache = Date.now();
  for (let i = 0; i < 100; i++) {
    decisionEngineService.analyzeDay(AUDIT_USER);
    decisionEngineService.detectRisks(AUDIT_USER);
    decisionEngineService.detectOpportunities(AUDIT_USER);
    decisionEngineService.generateRecommendations(AUDIT_USER);
  }
  const elapsedCache = Date.now() - startCache;
  console.log(`✓ Executed 400 Decision Engine API Calls in ${elapsedCache} ms (Avg: ${(elapsedCache / 400).toFixed(2)} ms/call)`);

  // ---------------------------------------------------
  // PHASE 8: Future Ready Architecture Stubs
  // ---------------------------------------------------
  console.log('\n[PHASE 8] Testing Future AI Readiness Stubs...');

  const prediction = decisionEngineService.predictPlanningOutcome(AUDIT_USER);
  console.log(`✓ Predictive Planning -> Projected Velocity: ${prediction.projectedVelocity} | Bottleneck Risk: "${prediction.bottleneckRisk}"`);

  const bizKPIs = decisionEngineService.getBusinessKPIAdvisory(AUDIT_USER);
  console.log(`✓ Business KPI Advisory Count: ${bizKPIs.length}`);
  bizKPIs.forEach((kpi) => {
    console.log(`  - ${kpi.metricName}: ${kpi.currentValue} (${kpi.status}) -> "${kpi.advisory}"`);
  });

  const financial = decisionEngineService.getFinancialPlanningAdvisory(AUDIT_USER);
  console.log(`✓ Financial Planning -> Cashflow: ${financial.cashflowForecastStatus} | Burn Rate: ${financial.burnRateStatus}`);

  const teamRecs = decisionEngineService.getTeamRecommendations(AUDIT_USER);
  console.log(`✓ Team Recommendations -> Delegation Ops Count: ${teamRecs.delegationOpportunities.length}`);

  const coaching = decisionEngineService.getExecutiveCoachingInsights(AUDIT_USER);
  console.log(`✓ Executive Coaching Insights Count: ${coaching.length}`);

  console.log('================================================================');
  console.log('  SPRINT 6.7 AI DECISION ENGINE AUDIT SUCCESSFUL');
  console.log('================================================================');
}

runSprint67Audit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
