/**
 * executiveDashboardService.ts
 * Sprint 6.5 – Executive Intelligence Dashboard Engine for SARTHI OS.
 *
 * Aggregates operational data across Planner, Tasks, Habits, Goals, Calendar,
 * Notifications, AI Memory, and Analytics to deliver an integrated Executive Brief,
 * AI Recommendations, Productivity Insights, and Executive KPIs.
 *
 * STORAGE MODE: Local mode (DEFAULT_STORAGE_MODE = "local").
 */

import { CentralDataServiceFacade } from '../dataService';
import { calendarService } from '../calendar/calendarService';
import { notificationService } from '../notifications/notificationService';
import { aiMemoryService } from '../ai/memoryService';
import {
  Task,
  Habit,
  Meeting,
  Goal,
  TodaySummary,
  ProductivityInsights,
  ExecutiveKPIs,
  AIInsight,
  AIRecommendation,
  ExecutiveBrief,
  ExecutiveReport,
  PredictiveOutcome,
} from '../../types';

const dataService = new CentralDataServiceFacade();

interface CachedDashboardData {
  timestamp: number;
  data: {
    brief: ExecutiveBrief;
    todaySummary: TodaySummary;
    productivity: ProductivityInsights;
    kpis: ExecutiveKPIs;
    insights: AIInsight[];
    recommendations: AIRecommendation[];
  };
}

export class ExecutiveDashboardService {
  private static instance: ExecutiveDashboardService;
  private cacheMap: Map<string, CachedDashboardData> = new Map();
  private cacheTTLMs = 5000; // 5 seconds cache to avoid duplicate calculations

  private constructor() {}

  public static getInstance(): ExecutiveDashboardService {
    if (!ExecutiveDashboardService.instance) {
      ExecutiveDashboardService.instance = new ExecutiveDashboardService();
    }
    return ExecutiveDashboardService.instance;
  }

  /**
   * Helper: Get today's YYYY-MM-DD string
   */
  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Phase 7: Performance & Caching Management
   */
  public clearCache(userId: string = 'mihir'): void {
    const key = (userId || 'mihir').toLowerCase().trim();
    this.cacheMap.delete(key);
  }

  /**
   * Evaluates all core dashboard metrics or returns cached instance if fresh.
   */
  private evaluateDashboardData(userId: string = 'mihir') {
    const normUser = (userId || 'mihir').toLowerCase().trim();
    const now = Date.now();
    const cached = this.cacheMap.get(normUser);

    if (cached && now - cached.timestamp < this.cacheTTLMs) {
      return cached.data;
    }

    const todayStr = this.getTodayDateString();

    // 1. PHASE 1: Data Aggregation from all services
    const tasks = dataService.getTasks(normUser) || [];
    const habits = dataService.getHabits(normUser) || [];
    const meetings = dataService.getMeetings(normUser) || [];
    const goals = dataService.getGoals(normUser) || [];
    const daySummary = calendarService.getSmartDaySummary(normUser, todayStr);
    const memories = aiMemoryService.getMemories(normUser, { isArchived: false });

    // 2. PHASE 2: Today's Executive Brief Generation
    const todayMeetings = meetings.filter((m) => {
      // Meetings can belong to today or default schedule
      return true;
    });

    const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.status === 'in_progress');
    const todayHabits = habits;

    const overdueItems = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'completed');
    const upcomingDeadlines = tasks.filter((t) => t.dueDate && t.dueDate > todayStr && t.status !== 'completed');

    const pendingHighPriority: (Task | Meeting)[] = [
      ...tasks.filter((t) => t.priority === 'High' && t.status !== 'completed'),
      ...meetings.filter((m) => m.type === 'Business' && !m.completed),
    ];

    const todaySummary: TodaySummary = {
      date: todayStr,
      meetings: todayMeetings,
      tasks: todayTasks,
      habits: todayHabits,
      pendingHighPriority,
      upcomingDeadlines,
      overdueItems,
    };

    // 3. PHASE 3: Productivity Insights
    const totalHabits = habits.length || 1;
    const completedHabitsToday = habits.filter((h) => h.completedDates && h.completedDates[todayStr]).length;
    const habitCompletionRate = Math.round((completedHabitsToday / totalHabits) * 100);

    const totalTodayTasks = todayTasks.length || 1;
    const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed').length;
    const taskCompletionRate = Math.round((completedTodayTasks / totalTodayTasks) * 100);

    const activeGoals = goals.filter((g) => g.status === 'active');
    const avgGoalProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + (g.currentProgress / (g.targetProgress || 100)) * 100, 0) / activeGoals.length)
      : 75;

    const currentHabitStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0)) : 0;
    const bestHabitStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.bestStreak || h.streak || 0)) : 0;
    const overallConsistencyStreak = Math.max(currentHabitStreak, 5);

    const weeklyProductivityScore = Math.min(100, Math.round((taskCompletionRate + habitCompletionRate + avgGoalProgress) / 3));
    const monthlyProductivityScore = Math.min(100, Math.round(weeklyProductivityScore * 0.95 + 5));

    const productivity: ProductivityInsights = {
      habitCompletionRate,
      taskCompletionRate,
      weeklyProductivityScore,
      monthlyProductivityScore,
      goalProgressRate: avgGoalProgress,
      currentHabitStreak,
      bestHabitStreak,
      overallConsistencyStreak,
    };

    // 4. PHASE 5: Executive KPIs
    const todayScore = Math.round(taskCompletionRate * 0.4 + habitCompletionRate * 0.4 + (daySummary.completionRate || 50) * 0.2);
    const weeklyScore = weeklyProductivityScore;
    const focusScore = Math.min(100, Math.max(40, 100 - pendingHighPriority.length * 10 + daySummary.freeTimeBlocks.length * 5));
    const executionScore = Math.round((taskCompletionRate * 0.6 + avgGoalProgress * 0.4));
    const consistencyScore = Math.min(100, overallConsistencyStreak * 8 + habitCompletionRate * 0.5);
    const overallProductivityScore = Math.round((todayScore * 0.25 + weeklyScore * 0.25 + focusScore * 0.2 + executionScore * 0.15 + consistencyScore * 0.15));

    const kpis: ExecutiveKPIs = {
      todayScore,
      weeklyScore,
      focusScore,
      executionScore,
      consistencyScore,
      overallProductivityScore,
    };

    // 5. PHASE 4: AI Insights & Recommendations
    const topPriorityTask = pendingHighPriority.length > 0 ? pendingHighPriority[0] : null;
    const suggestedFocusTime = daySummary.freeTimeBlocks.length > 0
      ? `${daySummary.freeTimeBlocks[0].startTime} - ${daySummary.freeTimeBlocks[0].endTime}`
      : '09:00 AM - 11:30 AM';

    const insights: AIInsight[] = [];
    const recommendations: AIRecommendation[] = [];

    // Highest Priority Today
    if (topPriorityTask) {
      const isTask = 'dueDate' in topPriorityTask;
      insights.push({
        id: 'ins_priority_1',
        type: 'priority',
        title: 'Highest Priority Item Today',
        description: `Focus on completing "${topPriorityTask.title}" to unlock executive progress.`,
        impact: 'critical',
        actionableStep: isTask ? `Execute task "${topPriorityTask.title}"` : `Attend meeting "${topPriorityTask.title}"`,
        category: 'Execution',
      });
    }

    // Suggested Focus Time & Free Time Blocks
    insights.push({
      id: 'ins_focus_1',
      type: 'focus_time',
      title: 'Suggested Deep Focus Block',
      description: `Optimal focus window identified at ${suggestedFocusTime} without schedule interruptions.`,
      impact: 'high',
      actionableStep: `Reserve ${suggestedFocusTime} for uninterrupted execution.`,
      category: 'Time Management',
    });

    const scheduledWithTime = daySummary.todaySchedule.filter((e) => e.startTime);
    if (scheduledWithTime.length > 0) {
      const busyStart = scheduledWithTime[0].startTime || '02:00 PM';
      const busyEnd = scheduledWithTime[0].endTime || '04:00 PM';
      insights.push({
        id: 'ins_busy_1',
        type: 'busy_block',
        title: 'High Density Schedule Window',
        description: `Busy window detected between ${busyStart} and ${busyEnd}.`,
        impact: 'medium',
        actionableStep: 'Prepare notes prior to entering this meeting/task block.',
        category: 'Schedule',
      });
    }


    // Habit Improvement Suggestions
    const lowHabits = habits.filter((h) => (h.streak || 0) < 3);
    if (lowHabits.length > 0) {
      insights.push({
        id: 'ins_habit_1',
        type: 'habit_tip',
        title: 'Habit Consistency Improvement',
        description: `Habit "${lowHabits[0].name}" is currently on a ${lowHabits[0].streak || 0}-day streak.`,
        impact: 'medium',
        actionableStep: `Complete "${lowHabits[0].name}" today to rebuild consistency.`,
        category: 'Habits',
      });
      recommendations.push({
        id: 'rec_habit_1',
        title: 'Build Morning Habit Momentum',
        recommendation: `Schedule habit "${lowHabits[0].name}" during your morning routine.`,
        priority: 'Medium',
        targetModule: 'habits',
      });
    }

    // Goal Progress Alerts
    const laggingGoals = goals.filter((g) => g.status === 'active' && g.currentProgress < 50);
    if (laggingGoals.length > 0) {
      insights.push({
        id: 'ins_goal_1',
        type: 'goal_alert',
        title: 'Goal Milestone Alert',
        description: `Goal "${laggingGoals[0].title}" is at ${laggingGoals[0].currentProgress}% progress.`,
        impact: 'high',
        actionableStep: `Break down "${laggingGoals[0].title}" into actionable daily sub-tasks.`,
        category: 'Goals',
      });
      recommendations.push({
        id: 'rec_goal_1',
        title: 'Accelerate lagging goal milestones',
        recommendation: `Allocate 45 minutes today toward goal "${laggingGoals[0].title}".`,
        priority: 'High',
        targetModule: 'goals',
      });
    }

    // Memory Context Recommendation
    if (memories.length > 0) {
      const topMem = memories[0];
      recommendations.push({
        id: 'rec_memory_1',
        title: 'Personalized Strategy Alignment',
        recommendation: `Align today's workflow with saved memory context: "${topMem.title}".`,
        priority: 'High',
        targetModule: 'ai_coach',
      });
    }

    const topPriorityObj = topPriorityTask as Task | Meeting | null;

    const brief: ExecutiveBrief = {
      userId: normUser,
      generatedAt: new Date().toISOString(),
      todaySummary,
      kpis,
      productivity,
      insights,
      recommendations,
      topPriorityToday: topPriorityObj,
      suggestedFocusTimeBlock: suggestedFocusTime,
      aiCoachingTip: daySummary.aiDayTip || 'Focus on high-impact strategic tasks during morning focus blocks.',
    };

    const calculated = {
      brief,
      todaySummary,
      productivity,
      kpis,
      insights,
      recommendations,
    };

    // Cache the result
    this.cacheMap.set(normUser, {
      timestamp: now,
      data: calculated,
    });

    return calculated;
  }

  // ====================================================
  // PHASE 6: Developer APIs
  // ====================================================

  /**
   * getExecutiveBrief - Full Executive Dashboard Overview
   */
  public getExecutiveBrief(userId: string = 'mihir'): ExecutiveBrief {
    return this.evaluateDashboardData(userId).brief;
  }

  /**
   * getTodaySummary - Aggregated daily view across all 7 sources
   */
  public getTodaySummary(userId: string = 'mihir'): TodaySummary {
    return this.evaluateDashboardData(userId).todaySummary;
  }

  /**
   * getInsights - Smart AI Insights
   */
  public getInsights(userId: string = 'mihir'): AIInsight[] {
    return this.evaluateDashboardData(userId).insights;
  }

  /**
   * getKPIs - Prepared Executive Scorecards
   */
  public getKPIs(userId: string = 'mihir'): ExecutiveKPIs {
    return this.evaluateDashboardData(userId).kpis;
  }

  /**
   * getRecommendations - Actionable Executive Guidance
   */
  public getRecommendations(userId: string = 'mihir'): AIRecommendation[] {
    return this.evaluateDashboardData(userId).recommendations;
  }

  /**
   * getProductivityInsights - Computed completion & streak statistics
   */
  public getProductivityInsights(userId: string = 'mihir'): ProductivityInsights {
    return this.evaluateDashboardData(userId).productivity;
  }

  // ====================================================
  // PHASE 8: Future Ready Architecture Stubs
  // ====================================================

  /**
   * Generates AI Coaching Plan based on user KPI performance
   */
  public generateExecutiveCoachingPlan(userId: string = 'mihir'): {
    focusArea: string;
    weeklyGoal: string;
    dailyAction: string;
  } {
    const kpis = this.getKPIs(userId);
    let focusArea = 'High Priority Execution';
    if (kpis.consistencyScore < 70) focusArea = 'Habit & Daily Routine Consistency';
    else if (kpis.focusScore < 70) focusArea = 'Schedule Block Protection & Deep Work';

    return {
      focusArea,
      weeklyGoal: `Increase overall executive productivity score to ${Math.min(100, kpis.overallProductivityScore + 10)}%`,
      dailyAction: 'Protect morning 2-hour focus block and complete top 1 high priority task before 12 PM.',
    };
  }

  /**
   * Predicts weekly completion rate and burnout risk based on schedule density
   */
  public predictWeeklyOutcome(userId: string = 'mihir'): PredictiveOutcome {
    const insights = this.getProductivityInsights(userId);
    const kpis = this.getKPIs(userId);

    const predictedRate = Math.min(100, Math.round(insights.weeklyProductivityScore * 1.05));
    const burnoutRisk = kpis.focusScore < 50 ? 'high' : kpis.focusScore < 75 ? 'moderate' : 'low';

    return {
      predictedWeeklyCompletionRate: predictedRate,
      projectedGoalMilestones: 3,
      riskOfBurnout: burnoutRisk,
      suggestedAdjustments: [
        'Delegate non-critical review meetings',
        'Insert 15-minute breaks after high density time blocks',
        'Consolidate daily communication updates into single end-of-day block',
      ],
    };
  }

  /**
   * Generates formal Executive Report for leadership/management view
   */
  public generateExecutiveReport(
    userId: string = 'mihir',
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' = 'weekly'
  ): ExecutiveReport {
    const kpis = this.getKPIs(userId);
    const summary = this.getTodaySummary(userId);

    return {
      userId,
      period,
      generatedAt: new Date().toISOString(),
      kpis,
      summary: `Executive Performance Report (${period.toUpperCase()}): Overall Productivity Score ${kpis.overallProductivityScore}%. Execution score at ${kpis.executionScore}%.`,
      highlights: [
        `Completed ${summary.tasks.filter((t) => t.status === 'completed').length} key tasks today`,
        `Maintained focus score of ${kpis.focusScore}% across active focus blocks`,
        `Consistency score sitting strong at ${kpis.consistencyScore}%`,
      ],
      areasForImprovement: [
        summary.overdueItems.length > 0 ? `Clear ${summary.overdueItems.length} overdue task(s)` : 'Maintain zero overdue task count',
        'Optimize calendar free time allocation for high impact goals',
      ],
      businessInsights: [
        'Strategic alignment across active goals remains on track for quarterly review',
        'Focus time protection correlates directly with higher milestone achievement',
      ],
    };
  }

  /**
   * Extracts high-level business insights from user metrics
   */
  public extractBusinessInsights(userId: string = 'mihir'): string[] {
    const summary = this.getTodaySummary(userId);
    const kpis = this.getKPIs(userId);

    return [
      `Active workspace productivity score is at ${kpis.overallProductivityScore}%`,
      `Pending high-priority items: ${summary.pendingHighPriority.length}`,
      `Schedule balance: ${summary.meetings.length} meeting(s), ${summary.tasks.length} task(s) scheduled today`,
    ];
  }
}

export const executiveDashboardService = ExecutiveDashboardService.getInstance();
