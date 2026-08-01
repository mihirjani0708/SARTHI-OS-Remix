export type NavTab = 'home' | 'habits' | 'planner' | 'calendar' | 'goals' | 'journal' | 'profile' | 'admin';

export type GoalCategory = 'Business' | 'Health' | 'Finance' | 'Personal' | 'Mindset';
export type GoalTimeframe = 'Q3 2026' | 'Yearly' | 'Monthly' | 'Long-term';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  timeframe: GoalTimeframe;
  targetDate: string; // YYYY-MM-DD
  currentProgress: number; // e.g. 60
  targetProgress: number; // e.g. 100
  unit?: string; // e.g. '%', '$', 'k', 'steps', 'books'
  status: 'active' | 'completed' | 'on_hold';
  description?: string;
  milestones?: Milestone[];
}

export type HabitCategory = 'Mind' | 'Body' | 'Spirit' | 'Discipline' | 'Business';
export type RoutineType = 'morning' | 'evening';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  routine?: RoutineType;
  iconName: string; // Lucide icon name string representation
  completedDates: Record<string, boolean>; // key YYYY-MM-DD -> boolean
  completionTimestamps?: Record<string, string>; // key YYYY-MM-DD -> HH:MM AM/PM
  streak: number;
  bestStreak?: number;
  description?: string;
  isCustom?: boolean;
}

export type Priority = 'High' | 'Medium' | 'Low';
export type TaskCategory = 'Business' | 'Personal' | 'Health' | 'Finance';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  time?: string;
  notes?: string;
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'Business' | 'Client' | 'Personal' | 'Review';
  locationOrLink?: string;
  attendees?: string[];
  notes?: string;
  completed?: boolean;
  date?: string; // YYYY-MM-DD
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  isPinned?: boolean;
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  moodRating: number; // 1 to 5
  gratitude: string[];
  dailyWins: string[];
  learnings: string;
  journalText: string;
  manifestationFocus: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category?: string;
}

export interface UserProfile {
  uid: string; // Unique identifier for multi-user system / Firebase Auth UID
  name: string;
  role: string;
  email: string;
  phone?: string;
  currentStreak: number;
  bestStreak: number;
  totalHabitsCompleted: number;
  avatarUrl: string;
  themeColor: string;
  joinDate: string;
  targetDailyHabits: number;
  location: string;
  theme?: 'light' | 'dark' | 'system';
  language?: 'english' | 'gujarati' | 'hindi';
  notificationsEnabled?: boolean;
  profileType?: string;
  profileTypes?: string[];
  needsOnboarding?: boolean;
  voiceSettings?: VoiceSettings;
  timezone?: string;
  dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  timeFormat?: '12h' | '24h';
  fontSize?: 'small' | 'medium' | 'large';
  animationsEnabled?: boolean;
  calendarDefaultView?: 'month' | 'week' | 'day' | 'agenda';
  calendarStartOfWeek?: 'monday' | 'sunday';
  workingHoursStart?: string;
  workingHoursEnd?: string;
}

export type VoiceSpeed = 'slow' | 'normal' | 'fast';
export type VoiceLanguage = 'english' | 'hindi' | 'gujarati';

export interface VoiceSettings {
  enabled: boolean;
  autoSpeak: boolean;
  speed: VoiceSpeed;
  volume: number; // 0 to 100
  pitch?: number; // 0.8 to 1.2 (default 1.0)
  continuousMode?: boolean; // Auto resume listening after AI speech response finishes
  preferredLanguage: VoiceLanguage;
  preferredVoiceGender?: 'default' | 'male' | 'female';
}

// --- SMART NOTIFICATION & REMINDER ENGINE TYPES ---
export type ReminderModule = 'habit' | 'task' | 'planner' | 'goal' | 'meeting' | 'birthday' | 'journal' | 'water' | 'medicine' | 'custom';
export type RepeatPattern = 'one_time' | 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'weekends' | 'custom';
export type NotificationPriority = 'low' | 'normal' | 'medium' | 'high' | 'critical';
export type NotificationStatus = 'pending' | 'triggered' | 'completed' | 'dismissed' | 'snoozed';

export interface Reminder {
  id: string;
  userId: string;
  module: ReminderModule;
  targetEntityId?: string;
  title: string;
  description?: string;
  priority: NotificationPriority;
  repeatPattern: RepeatPattern;
  customRepeatDays?: number;
  scheduledTime: string; // ISO String or YYYY-MM-DDTHH:mm
  triggeredTime?: string;
  status: NotificationStatus;
  snoozeUntil?: string;
  actionUrl?: string;
  retryCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationHistoryItem {
  id: string;
  reminderId: string;
  userId: string;
  module: ReminderModule;
  type?: string;
  title: string;
  priority: NotificationPriority;
  createdTime?: string;
  scheduledTime: string;
  triggeredTime: string;
  actionTaken: 'triggered' | 'completed' | 'dismissed' | 'snoozed';
  actionTimestamp: string;
  completed?: boolean;
  dismissed?: boolean;
  snoozed?: boolean;
  retryCount?: number;
  details?: string;
}

export interface PushPayload {
  title: string;
  body: string;
  priority: NotificationPriority;
  data?: Record<string, any>;
  icon?: string;
  tag?: string;
}

export interface IPushNotificationAdapter {
  platformName: 'fcm' | 'web_push' | 'android' | 'ios' | 'local_stub';
  isSupported(): boolean;
  getToken(): Promise<string | null>;
  sendPushNotification(payload: PushPayload): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface AICoachMessage {
  id: string;
  sender: 'user' | 'sarthi';
  text: string;
  timestamp: string;
  mode?: 'daily_review' | 'habit_advice' | 'planner_boost' | 'chat';
}

// --- UNIVERSAL SEARCH ENGINE TYPES ---
export type SearchModule =
  | 'task'
  | 'habit'
  | 'goal'
  | 'planner'
  | 'meeting'
  | 'journal'
  | 'note'
  | 'notification'
  | 'profile';

export interface SearchFilters {
  module?: SearchModule | 'all' | SearchModule[];
  startDate?: string;
  endDate?: string;
  priority?: string;
  status?: string;
  category?: string;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  module: SearchModule;
  title: string;
  description?: string;
  snippet?: string;
  date?: string;
  priority?: string;
  status?: string;
  category?: string;
  tags?: string[];
  score: number;
  matchedFields: string[];
  item: any;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: string;
  pinned?: boolean;
  count: number;
}

export interface PopularSearchItem {
  query: string;
  count: number;
  lastSearched: string;
}

export interface ISearchAdapter {
  adapterName: 'local_index' | 'cloud_search_stub';
  search(userId: string, query: string, filters?: SearchFilters): Promise<SearchResult[]>;
}

// --- GLOBAL COMMAND PALETTE TYPES (Sprint 6.1) ---
export type CommandCategory = 'quick_action' | 'navigation' | 'recent' | 'pinned' | 'frequent' | 'ai_tools';

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: CommandCategory;
  shortcut?: string;
  iconName: string;
  keywords: string[];
  module?: SearchModule | 'system';
  actionId?: string;
  pinned?: boolean;
  frequency?: number;
  lastUsed?: string;
}

export interface CommandGroup {
  id: string;
  title: string;
  items: (CommandItem | SearchResult)[];
}

// --- UNIFIED CALENDAR & TIMELINE ENGINE TYPES (Sprint 6.2) ---
export type CalendarEventType =
  | 'task'
  | 'habit'
  | 'goal'
  | 'meeting'
  | 'birthday'
  | 'reminder'
  | 'event'
  | 'planner';

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export type CalendarViewMode = 'today' | 'tomorrow' | 'week' | 'month' | 'agenda' | 'timeline';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm or hh:mm AM/PM
  endDate?: string;
  endTime?: string;
  isAllDay?: boolean;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  location?: string;
  attendees?: string[];
  recurrence?: RecurrencePattern;
  customRecurrenceRule?: string;
  sourceModule?: SearchModule;
  sourceId?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  type: CalendarEventType | 'ai_suggestion' | 'notification';
  status: 'completed' | 'upcoming' | 'overdue' | 'suggested';
  event?: CalendarEvent;
  suggestionReason?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingEventIds: string[];
  conflictType?: 'overlap' | 'duplicate_reminder' | 'unavailable';
  message: string;
  suggestedResolutions: string[];
}

export interface SmartDaySummary {
  date: string;
  todaySchedule: CalendarEvent[];
  pendingItems: CalendarEvent[];
  completedItems: CalendarEvent[];
  upcomingPriorities: CalendarEvent[];
  freeTimeBlocks: { startTime: string; endTime: string; durationMinutes: number }[];
  completionRate: number;
  aiDayTip?: string;
}

export interface ICalendarSyncAdapter {
  adapterName: 'google_calendar_stub' | 'outlook_calendar_stub' | 'apple_calendar_stub';
  syncEvents(userId: string, events: CalendarEvent[]): Promise<boolean>;
}

// --- AI ACTION ENGINE TYPES (Sprint 6.3) ---
export type AIActionIntent =
  | 'create'
  | 'update'
  | 'delete'
  | 'complete'
  | 'search'
  | 'schedule'
  | 'reschedule'
  | 'remind'
  | 'open'
  | 'navigate'
  | 'summarize';

export type AIActionModule =
  | 'task'
  | 'habit'
  | 'goal'
  | 'planner'
  | 'calendar'
  | 'meeting'
  | 'reminder'
  | 'journal'
  | 'note'
  | 'profile'
  | 'memory'
  | 'system';

export interface AIActionParsedIntent {
  intent: AIActionIntent;
  module: AIActionModule;
  confidence: number;
  parameters: Record<string, any>;
  requiresConfirmation: boolean;
  confirmationPrompt?: string;
  rawPrompt: string;
}

export interface AIActionResult {
  actionId: string;
  intent: AIActionIntent;
  module: AIActionModule;
  success: boolean;
  message: string;
  affectedItems?: any[];
  failureReason?: string;
  navTarget?: NavTab;
  timestamp: string;
}

export interface AIActionHistoryEntry {
  actionId: string;
  userId: string;
  intent: AIActionIntent;
  module: AIActionModule;
  timestamp: string;
  success: boolean;
  failureReason?: string;
  rawPrompt: string;
  parameters?: Record<string, any>;
  undoable?: boolean;
  previousState?: any;
}

export type MemoryCategory =
  | 'personal_preferences'
  | 'daily_routine'
  | 'work_preferences'
  | 'goals'
  | 'habits'
  | 'important_dates'
  | 'meetings'
  | 'projects'
  | 'business_information'
  | 'custom';

export type MemoryPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AIMemory {
  id: string;
  userId: string;
  category: MemoryCategory;
  title: string;
  content: string;
  tags?: string[];
  priority: MemoryPriority;
  isPinned: boolean;
  isArchived: boolean;
  source?: 'auto_detected' | 'user_created' | 'system';
  confidence?: number;
  lastAccessedAt: string;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface MemorySearchResult {
  memory: AIMemory;
  score: number;
  matchType: 'exact' | 'semantic' | 'category' | 'tag';
}

export interface UserPersonaProfile {
  userId: string;
  summary: string;
  keyPreferences: string[];
  routines: string[];
  topGoals: string[];
  workStyle: string;
  businessContext: string[];
  lastUpdated: string;
}

// Sprint 6.5 – Executive Intelligence Dashboard Types
export interface TodaySummary {
  date: string;
  meetings: Meeting[];
  tasks: Task[];
  habits: Habit[];
  pendingHighPriority: (Task | Meeting)[];
  upcomingDeadlines: Task[];
  overdueItems: Task[];
}

export interface ProductivityInsights {
  habitCompletionRate: number;
  taskCompletionRate: number;
  weeklyProductivityScore: number;
  monthlyProductivityScore: number;
  goalProgressRate: number;
  currentHabitStreak: number;
  bestHabitStreak: number;
  overallConsistencyStreak: number;
}

export interface ExecutiveKPIs {
  todayScore: number;
  weeklyScore: number;
  focusScore: number;
  executionScore: number;
  consistencyScore: number;
  overallProductivityScore: number;
}

export type AIInsightType = 'priority' | 'focus_time' | 'busy_block' | 'free_block' | 'habit_tip' | 'goal_alert';

export interface AIInsight {
  id: string;
  type: AIInsightType;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionableStep?: string;
  category?: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
  targetModule: string;
}

export interface ExecutiveBrief {
  userId: string;
  generatedAt: string;
  todaySummary: TodaySummary;
  kpis: ExecutiveKPIs;
  productivity: ProductivityInsights;
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  topPriorityToday?: Task | Meeting | null;
  suggestedFocusTimeBlock?: string;
  aiCoachingTip?: string;
}

export interface ExecutiveReport {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  generatedAt: string;
  kpis: ExecutiveKPIs;
  summary: string;
  highlights: string[];
  areasForImprovement: string[];
  businessInsights: string[];
}

export interface PredictiveOutcome {
  predictedWeeklyCompletionRate: number;
  projectedGoalMilestones: number;
  riskOfBurnout: 'low' | 'moderate' | 'high';
  suggestedAdjustments: string[];
}

// Sprint 6.6 – AI Daily Briefing & Executive Coach Types
export interface WeatherInfo {
  condition: string;
  tempC: number;
  location: string;
  humidity?: number;
}

export interface MorningBrief {
  date: string;
  welcomeMessage: string;
  todaySchedule: (Task | Meeting)[];
  highPriorityTasks: Task[];
  meetings: Meeting[];
  habitsDue: Habit[];
  pendingGoals: Goal[];
  deadlines: Task[];
  weatherPlaceholder: WeatherInfo;
}

export interface EveningReview {
  date: string;
  completedTasks: Task[];
  missedTasks: Task[];
  habitCompletion: {
    total: number;
    completed: number;
    percentage: number;
  };
  productivityScore: number;
  streakSummary: {
    currentStreak: number;
    bestStreak: number;
  };
  tomorrowPreparation: {
    scheduledEvents: number;
    priorityTasks: Task[];
    advice: string;
  };
}

export interface ExecutiveCoachingAdvice {
  bestTimeToFocus: string;
  suggestedBreakTime: string;
  workloadBalancing: string;
  goalConsistency: string;
  habitCoaching: string;
  plannerOptimization: string;
}

export interface DailyScore {
  planningScore: number;
  executionScore: number;
  focusScore: number;
  consistencyScore: number;
  overallDailyScore: number;
}

export interface TodayHighlights {
  topAchievement: string;
  keyMilestone: string;
  focusWindow: string;
  urgentAttention: string[];
}

export interface VoiceBriefingScript {
  intro: string;
  body: string;
  signoff: string;
  durationSec: number;
}

export interface EmailBriefingPayload {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface WhatsAppSummaryPayload {
  formattedMessage: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
}

// Sprint 6.7 – AI Decision Engine (Executive Advisor) Types
export type ExecutiveRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ExecutiveRiskItem {
  id: string;
  title: string;
  description: string;
  level: ExecutiveRiskLevel;
  module: string;
  category: 'deadline' | 'overload' | 'streak_loss' | 'goal_delay' | 'backlog' | 'conflict';
  detectedAt: string;
}

export interface ExecutiveOpportunityItem {
  id: string;
  title: string;
  description: string;
  module: string;
  impact: 'High' | 'Medium' | 'Low';
  estimatedEffort: 'Low' | 'Medium' | 'High';
  category: 'focus_block' | 'free_slot' | 'quick_win' | 'high_impact';
}

export interface ExplainableRecommendation {
  id: string;
  recommendation: string;
  reason: string;
  confidenceScore: number; // e.g. 0.0 - 1.0 or 0 - 100
  relatedModule: string;
  suggestedAction: string;
  expectedBenefit: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ExecutiveAnalysis {
  userId: string;
  period: 'day' | 'week';
  date: string;
  workloadScore: number;
  goalProgressRate: number;
  habitConsistencyRate: number;
  productivityTrend: 'improving' | 'stable' | 'declining';
  pendingCriticalCount: number;
  upcomingDeadlinesCount: number;
  risks: ExecutiveRiskItem[];
  opportunities: ExecutiveOpportunityItem[];
  recommendations: ExplainableRecommendation[];
  overallConfidenceScore: number;
}

export interface PredictivePlanningModel {
  projectedVelocity: number;
  bottleneckRisk: string;
  recommendedAdjustments: string[];
}

export interface BusinessKPIAdvisorResult {
  metricName: string;
  currentValue: string;
  status: 'on_track' | 'at_risk' | 'lagging';
  advisory: string;
}

export interface FinancialPlanningStub {
  cashflowForecastStatus: string;
  burnRateStatus: string;
  advisoryNote: string;
}

export interface TeamRecommendationStub {
  delegationOpportunities: string[];
  crossTeamSynergies: string[];
}





