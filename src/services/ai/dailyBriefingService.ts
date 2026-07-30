/**
 * dailyBriefingService.ts
 * Sprint 6.6 – AI Daily Briefing & Executive Coach Engine for SARTHI OS.
 *
 * Provides proactive daily guidance with morning executive briefs, evening reviews,
 * AI executive coaching, daily scoring, and performance caching.
 *
 * STORAGE MODE: Local mode (DEFAULT_STORAGE_MODE = "local").
 * READ ONLY: Consumes existing data without modifying business state.
 */

import { CentralDataServiceFacade } from '../dataService';
import { calendarService } from '../calendar/calendarService';
import { notificationService } from '../notifications/notificationService';
import { aiMemoryService } from './memoryService';
import { analyticsService } from '../analytics/analyticsService';
import {
  Task,
  Habit,
  Meeting,
  Goal,
  MorningBrief,
  EveningReview,
  ExecutiveCoachingAdvice,
  DailyScore,
  TodayHighlights,
  VoiceBriefingScript,
  EmailBriefingPayload,
  WhatsAppSummaryPayload,
  PushNotificationPayload,
  WeatherInfo,
} from '../../types';

const dataService = new CentralDataServiceFacade();

interface CachedBriefingData {
  timestamp: number;
  data: {
    morningBrief: MorningBrief;
    eveningReview: EveningReview;
    coachingAdvice: ExecutiveCoachingAdvice;
    dailyScore: DailyScore;
    highlights: TodayHighlights;
  };
}

export class DailyBriefingService {
  private static instance: DailyBriefingService;
  private cacheMap: Map<string, CachedBriefingData> = new Map();
  private cacheTTLMs = 5000; // 5-second performance cache

  private constructor() {}

  public static getInstance(): DailyBriefingService {
    if (!DailyBriefingService.instance) {
      DailyBriefingService.instance = new DailyBriefingService();
    }
    return DailyBriefingService.instance;
  }

  /**
   * Helper: Get YYYY-MM-DD format for today
   */
  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Helper: Get YYYY-MM-DD for tomorrow
   */
  private getTomorrowDateString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  /**
   * Phase 7: Clear performance cache
   */
  public clearCache(userId: string = 'mihir'): void {
    const normUser = (userId || 'mihir').toLowerCase().trim();
    this.cacheMap.delete(normUser);
  }

  /**
   * Internal evaluator to aggregate data across 8 sources and compute briefs.
   */
  private evaluateBriefingData(userId: string = 'mihir') {
    const normUser = (userId || 'mihir').toLowerCase().trim();
    const now = Date.now();
    const cached = this.cacheMap.get(normUser);

    if (cached && now - cached.timestamp < this.cacheTTLMs) {
      return cached.data;
    }

    const todayStr = this.getTodayDateString();
    const tomorrowStr = this.getTomorrowDateString();

    // 1. PHASE 1: Data Collection across 8 Sources
    const tasks = dataService.getTasks(normUser) || [];
    const habits = dataService.getHabits(normUser) || [];
    const meetings = dataService.getMeetings(normUser) || [];
    const goals = dataService.getGoals(normUser) || [];
    const daySummary = calendarService.getSmartDaySummary(normUser, todayStr);
    const notifications = notificationService.getPendingReminders(normUser);
    const memories = aiMemoryService.getRelevantMemories(normUser, 'schedule routine goal preference', 3);
    const analytics = analyticsService.getEventCountsMetrics();

    // 2. PHASE 2: Morning Executive Brief
    const todaySchedule = [
      ...meetings.filter((m) => !m.completed),
      ...tasks.filter((t) => t.dueDate === todayStr || t.status === 'in_progress'),
    ];

    const highPriorityTasks = tasks.filter((t) => t.priority === 'High' && t.status !== 'completed');
    const todayMeetings = meetings.filter((m) => !m.completed);
    const habitsDue = habits;
    const pendingGoals = goals.filter((g) => g.status === 'active' && g.currentProgress < (g.targetProgress || 100));
    const deadlines = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed');

    const weatherPlaceholder: WeatherInfo = {
      condition: 'Partly Cloudy',
      tempC: 24,
      location: 'San Francisco, CA (Future Ready)',
      humidity: 55,
    };

    let welcomeMessage = `Good morning, Executive! You have ${todaySchedule.length} total item(s) scheduled for today.`;
    if (memories.length > 0) {
      welcomeMessage += ` Remember your personal context: "${memories[0].title}".`;
    }

    const morningBrief: MorningBrief = {
      date: todayStr,
      welcomeMessage,
      todaySchedule,
      highPriorityTasks,
      meetings: todayMeetings,
      habitsDue,
      pendingGoals,
      deadlines,
      weatherPlaceholder,
    };

    // 3. PHASE 3: Evening Review
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const missedTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed');

    const totalHabits = habits.length || 1;
    const completedHabitsCount = habits.filter((h) => h.completedDates && h.completedDates[todayStr]).length;
    const habitCompletionPercentage = Math.round((completedHabitsCount / totalHabits) * 100);

    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 100;
    const productivityScore = Math.round((taskCompletionRate * 0.6 + habitCompletionPercentage * 0.4));

    const currentStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0)) : 0;
    const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.bestStreak || h.streak || 0)) : 0;

    const tomorrowTasks = tasks.filter((t) => t.dueDate === tomorrowStr);
    const tomorrowPreparation = {
      scheduledEvents: tomorrowTasks.length,
      priorityTasks: tomorrowTasks.filter((t) => t.priority === 'High'),
      advice: tomorrowTasks.length > 0
        ? `You have ${tomorrowTasks.length} task(s) set for tomorrow. Rest early to maintain executive focus.`
        : 'Tomorrow has a clean schedule. Use it to work on long-term strategic goals.',
    };

    const eveningReview: EveningReview = {
      date: todayStr,
      completedTasks,
      missedTasks,
      habitCompletion: {
        total: totalHabits,
        completed: completedHabitsCount,
        percentage: habitCompletionPercentage,
      },
      productivityScore,
      streakSummary: {
        currentStreak,
        bestStreak,
      },
      tomorrowPreparation,
    };

    // 4. PHASE 4: Executive Coaching Recommendations
    const freeBlockStr = daySummary.freeTimeBlocks.length > 0
      ? `${daySummary.freeTimeBlocks[0].startTime} - ${daySummary.freeTimeBlocks[0].endTime}`
      : '09:00 AM - 11:30 AM';

    const coachingAdvice: ExecutiveCoachingAdvice = {
      bestTimeToFocus: `Your optimal deep work block is ${freeBlockStr}, offering maximum uninterrupted focus.`,
      suggestedBreakTime: 'Take a 15-minute recovery break after 90 minutes of intensive execution.',
      workloadBalancing: highPriorityTasks.length > 3
        ? `High workload detected (${highPriorityTasks.length} urgent tasks). Consider delegating or deferring low-impact items.`
        : 'Workload is well-balanced. You have manageable daily priority targets.',
      goalConsistency: pendingGoals.length > 0
        ? `Focus progress on goal "${pendingGoals[0].title}" (currently at ${pendingGoals[0].currentProgress}%).`
        : 'All active goals are progressing according to plan.',
      habitCoaching: habitCompletionPercentage < 50
        ? 'Complete morning habits early in the day to trigger momentum for executive execution.'
        : 'Strong habit consistency! Keep up the daily streak.',
      plannerOptimization: 'Block out dedicated time slots in your calendar for unassigned high-priority tasks.',
    };

    // 5. PHASE 5: Daily Score Calculation
    const planningScore = Math.min(100, Math.max(50, 100 - missedTasks.length * 10 + todaySchedule.length * 5));
    const executionScore = productivityScore;
    const focusScore = Math.min(100, Math.max(40, 100 - highPriorityTasks.length * 5 + daySummary.freeTimeBlocks.length * 10));
    const consistencyScore = Math.min(100, currentStreak * 10 + habitCompletionPercentage * 0.5);
    const overallDailyScore = Math.round(
      planningScore * 0.25 + executionScore * 0.3 + focusScore * 0.25 + consistencyScore * 0.2
    );

    const dailyScore: DailyScore = {
      planningScore,
      executionScore,
      focusScore,
      consistencyScore,
      overallDailyScore,
    };

    // 6. Highlights
    const topAchievement = completedTasks.length > 0
      ? `Completed key task "${completedTasks[0].title}"`
      : 'Prepared daily operational schedule and executive goals';
    const keyMilestone = goals.length > 0 ? `Active goal "${goals[0].title}" at ${goals[0].currentProgress}%` : 'No active milestones';
    const urgentAttention = highPriorityTasks.map((t) => t.title);

    const highlights: TodayHighlights = {
      topAchievement,
      keyMilestone,
      focusWindow: freeBlockStr,
      urgentAttention,
    };

    const calculated = {
      morningBrief,
      eveningReview,
      coachingAdvice,
      dailyScore,
      highlights,
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
   * generateMorningBrief - Morning Executive Briefing
   */
  public generateMorningBrief(userId: string = 'mihir'): MorningBrief {
    return this.evaluateBriefingData(userId).morningBrief;
  }

  /**
   * generateEveningReview - Evening Review & Recap
   */
  public generateEveningReview(userId: string = 'mihir'): EveningReview {
    return this.evaluateBriefingData(userId).eveningReview;
  }

  /**
   * generateDailyScore - 5-Metric Daily Scorecard
   */
  public generateDailyScore(userId: string = 'mihir'): DailyScore {
    return this.evaluateBriefingData(userId).dailyScore;
  }

  /**
   * generateExecutiveAdvice - AI Productivity Coaching Advice
   */
  public generateExecutiveAdvice(userId: string = 'mihir'): ExecutiveCoachingAdvice {
    return this.evaluateBriefingData(userId).coachingAdvice;
  }

  /**
   * getTodayHighlights - Key Highlights & Top Achievements
   */
  public getTodayHighlights(userId: string = 'mihir'): TodayHighlights {
    return this.evaluateBriefingData(userId).highlights;
  }

  // ====================================================
  // PHASE 8: Future Ready Architecture Stubs
  // ====================================================

  /**
   * Generates a spoken script formatted for AI Voice Assistants (TTS)
   */
  public generateVoiceBriefingScript(userId: string = 'mihir'): VoiceBriefingScript {
    const brief = this.generateMorningBrief(userId);
    const advice = this.generateExecutiveAdvice(userId);

    const intro = `Good morning! Here is your SARTHI OS daily executive briefing for ${brief.date}.`;
    const body = `You have ${brief.todaySchedule.length} scheduled items today and ${brief.highPriorityTasks.length} high priority tasks. ${advice.bestTimeToFocus}`;
    const signoff = 'Have a productive and focused day!';

    return {
      intro,
      body,
      signoff,
      durationSec: 45,
    };
  }

  /**
   * Formats HTML and Text email payload for daily executive dispatch
   */
  public generateEmailBriefingPayload(userId: string = 'mihir'): EmailBriefingPayload {
    const brief = this.generateMorningBrief(userId);
    const score = this.generateDailyScore(userId);

    const subject = `Executive Morning Briefing - ${brief.date} [Score: ${score.overallDailyScore}%]`;
    const textBody = `${brief.welcomeMessage}\n\nSchedule Items: ${brief.todaySchedule.length}\nHigh Priority Tasks: ${brief.highPriorityTasks.length}\nWeather: ${brief.weatherPlaceholder.condition}, ${brief.weatherPlaceholder.tempC}°C`;
    const htmlBody = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Executive Morning Briefing</h2>
        <p><strong>${brief.welcomeMessage}</strong></p>
        <ul>
          <li><strong>Schedule Count:</strong> ${brief.todaySchedule.length}</li>
          <li><strong>High Priority Tasks:</strong> ${brief.highPriorityTasks.length}</li>
          <li><strong>Overall Daily Score:</strong> ${score.overallDailyScore}/100</li>
        </ul>
      </div>
    `;

    return {
      subject,
      htmlBody,
      textBody,
    };
  }

  /**
   * Formats concise text payload for WhatsApp integration
   */
  public generateWhatsAppSummary(userId: string = 'mihir'): WhatsAppSummaryPayload {
    const brief = this.generateMorningBrief(userId);
    const score = this.generateDailyScore(userId);

    const formattedMessage = `*SARTHI OS Daily Executive Briefing* (${brief.date})\n\n` +
      `📊 *Overall Score:* ${score.overallDailyScore}/100\n` +
      `📅 *Schedule Items:* ${brief.todaySchedule.length}\n` +
      `🔥 *High Priority Tasks:* ${brief.highPriorityTasks.length}\n` +
      `🎯 *Focus Window:* ${brief.weatherPlaceholder.condition}\n\n` +
      `*Action:* Focus on completing top priority targets early!`;

    return {
      formattedMessage,
    };
  }

  /**
   * Formats title & body push notification
   */
  public generatePushNotificationSummary(userId: string = 'mihir'): PushNotificationPayload {
    const brief = this.generateMorningBrief(userId);

    return {
      title: '🌅 Morning Executive Briefing Ready',
      body: `You have ${brief.highPriorityTasks.length} high priority task(s) and ${brief.meetings.length} meeting(s) scheduled today.`,
    };
  }
}

export const dailyBriefingService = DailyBriefingService.getInstance();
