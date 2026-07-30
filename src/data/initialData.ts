import { Habit, Task, Meeting, Note, JournalEntry, Quote, UserProfile, Goal, VoiceSettings } from '../types';

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  autoSpeak: true,
  speed: 'normal',
  volume: 80,
  pitch: 1.0,
  continuousMode: false,
  preferredLanguage: 'english',
  preferredVoiceGender: 'default',
};

export const INITIAL_USER_PROFILES: Record<string, UserProfile> = {
  mihir: {
    uid: 'mihir',
    name: 'Mihir Jani',
    role: 'Founder & CEO',
    email: 'mihir.jani0708@gmail.com',
    phone: '+91 98765 43210',
    currentStreak: 14,
    bestStreak: 28,
    totalHabitsCompleted: 342,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    themeColor: 'blue',
    joinDate: '2026-01-01',
    targetDailyHabits: 11,
    location: 'Mumbai / Global',
    theme: 'light',
    language: 'english',
    notificationsEnabled: true,
    voiceSettings: DEFAULT_VOICE_SETTINGS,
  },
  mansi: {
    uid: 'mansi',
    name: 'Mansi Shah',
    role: 'Product Director',
    email: 'mansi@sarthi.com',
    phone: '+91 98200 12345',
    currentStreak: 8,
    bestStreak: 18,
    totalHabitsCompleted: 154,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    themeColor: 'emerald',
    joinDate: '2026-02-15',
    targetDailyHabits: 9,
    location: 'Mumbai / India',
    theme: 'light',
    language: 'english',
    notificationsEnabled: true,
  },
  new: {
    uid: 'new',
    name: 'New Executive',
    role: 'Executive Member',
    email: 'new@sarthi.com',
    phone: '+91 90000 00000',
    currentStreak: 0,
    bestStreak: 0,
    totalHabitsCompleted: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    themeColor: 'indigo',
    joinDate: '2026-07-29',
    targetDailyHabits: 5,
    location: 'Mumbai / Global',
    theme: 'light',
    language: 'english',
    notificationsEnabled: true,
  },
};

export const DEFAULT_USER: UserProfile = INITIAL_USER_PROFILES.mansi;

export function getDefaultUserProfile(userId: string): UserProfile {
  const normalizedId = (userId || 'mansi').toLowerCase().trim();
  if (INITIAL_USER_PROFILES[normalizedId]) {
    return { ...INITIAL_USER_PROFILES[normalizedId], uid: userId };
  }

  const formattedName = userId
    .split(/[-_.]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');

  return {
    uid: userId,
    name: formattedName || 'User Profile',
    role: 'Executive Leader',
    email: `${normalizedId}@sarthi.app`,
    phone: '+91 90000 00000',
    currentStreak: 0,
    bestStreak: 0,
    totalHabitsCompleted: 0,
    avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
    themeColor: 'blue',
    joinDate: getTodayDateString(),
    targetDailyHabits: 8,
    location: 'Global',
    theme: 'light',
    language: 'english',
    notificationsEnabled: true,
  };
}

// YYYY-MM-DD format helper
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDateString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const todayStr = getTodayDateString();
const yesterdayStr = getPastDateString(1);
const day2Ago = getPastDateString(2);

export const STARTER_HABITS_TEMPLATES: Omit<Habit, 'completedDates' | 'streak'>[] = [
  {
    id: 'starter-habit-1',
    name: 'Drink 2 Litres Water',
    category: 'Body',
    routine: 'morning',
    iconName: 'Droplet',
    description: 'Stay hydrated throughout the day by drinking at least 2 litres of water.',
  },
  {
    id: 'starter-habit-2',
    name: 'Exercise for 30 Minutes',
    category: 'Body',
    routine: 'morning',
    iconName: 'Activity',
    description: 'Engage in 30 minutes of physical exercise or workout.',
  },
  {
    id: 'starter-habit-3',
    name: 'Eat Healthy Food',
    category: 'Body',
    routine: 'morning',
    iconName: 'Sparkles',
    description: 'Nourish your body with clean, balanced, and nutritious meals.',
  },
  {
    id: 'starter-habit-4',
    name: 'Meditate for 10 Minutes',
    category: 'Mind',
    routine: 'morning',
    iconName: 'HeartHandshake',
    description: 'Practice 10 minutes of mindfulness or quiet meditation.',
  },
];

export function createFreshHabitCollection(): Habit[] {
  return STARTER_HABITS_TEMPLATES.map((tmpl) => ({
    ...tmpl,
    streak: 0,
    bestStreak: 0,
    completedDates: {},
    completionTimestamps: {},
  }));
}

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Gratitude & Prayer',
    category: 'Spirit',
    routine: 'morning',
    iconName: 'Sun',
    description: 'Start the day with deep reverence, morning prayers and gratitude list.',
    streak: 14,
    bestStreak: 21,
    completedDates: { [todayStr]: true, [yesterdayStr]: true, [day2Ago]: true },
    completionTimestamps: { [todayStr]: '06:30 AM', [yesterdayStr]: '06:35 AM', [day2Ago]: '06:25 AM' },
  },
  {
    id: 'habit-2',
    name: 'Warm Water',
    category: 'Body',
    routine: 'morning',
    iconName: 'Droplet',
    description: 'Drink 500ml of warm copper-infused water first thing upon waking.',
    streak: 18,
    bestStreak: 30,
    completedDates: { [todayStr]: true, [yesterdayStr]: true, [day2Ago]: true },
    completionTimestamps: { [todayStr]: '06:45 AM', [yesterdayStr]: '06:40 AM', [day2Ago]: '06:50 AM' },
  },
  {
    id: 'habit-3',
    name: 'Manifestation',
    category: 'Mind',
    routine: 'morning',
    iconName: 'Sparkles',
    description: '10 mins visualising annual business goals, ideal lifestyle & abundance state.',
    streak: 12,
    bestStreak: 15,
    completedDates: { [todayStr]: true, [yesterdayStr]: true, [day2Ago]: false },
    completionTimestamps: { [todayStr]: '07:00 AM', [yesterdayStr]: '07:05 AM' },
  },
  {
    id: 'habit-4',
    name: 'Yoga',
    category: 'Body',
    routine: 'morning',
    iconName: 'Activity',
    description: '20 mins morning Surya Namaskar and hip/spine flexibility routine.',
    streak: 7,
    bestStreak: 14,
    completedDates: { [todayStr]: false, [yesterdayStr]: true, [day2Ago]: true },
    completionTimestamps: { [yesterdayStr]: '07:30 AM', [day2Ago]: '07:25 AM' },
  },
  {
    id: 'habit-5',
    name: 'Walking',
    category: 'Body',
    routine: 'morning',
    iconName: 'Footprints',
    description: '10,000 steps or 45 min brisk walk outdoors in sunlight.',
    streak: 10,
    bestStreak: 20,
    completedDates: { [todayStr]: true, [yesterdayStr]: true, [day2Ago]: true },
    completionTimestamps: { [todayStr]: '08:15 AM', [yesterdayStr]: '08:10 AM', [day2Ago]: '08:00 AM' },
  },
  {
    id: 'habit-6',
    name: 'Meditation',
    category: 'Spirit',
    routine: 'morning',
    iconName: 'HeartHandshake',
    description: '15 mins mindfulness breath observation to calm the nervous system.',
    streak: 14,
    bestStreak: 28,
    completedDates: { [todayStr]: true, [yesterdayStr]: true, [day2Ago]: true },
    completionTimestamps: { [todayStr]: '09:00 AM', [yesterdayStr]: '08:55 AM', [day2Ago]: '09:05 AM' },
  },
  {
    id: 'habit-7',
    name: 'Power Planning',
    category: 'Discipline',
    routine: 'morning',
    iconName: 'Zap',
    description: 'Review top 3 priorities for business and life before opening email.',
    streak: 21,
    bestStreak: 30,
    completedDates: { [todayStr]: true, [yesterdayStr]: true, [day2Ago]: true },
    completionTimestamps: { [todayStr]: '09:20 AM', [yesterdayStr]: '09:15 AM', [day2Ago]: '09:30 AM' },
  },
  {
    id: 'habit-8',
    name: 'Temple',
    category: 'Spirit',
    routine: 'morning',
    iconName: 'Landmark',
    description: 'Visit local temple or sacred quiet space for peace & grounding.',
    streak: 5,
    bestStreak: 10,
    completedDates: { [todayStr]: false, [yesterdayStr]: true, [day2Ago]: false },
    completionTimestamps: { [yesterdayStr]: '10:00 AM' },
  },
  {
    id: 'habit-9',
    name: 'No Alcohol',
    category: 'Discipline',
    routine: 'evening',
    iconName: 'ShieldAlert',
    description: 'Stay completely alcohol-free for peak physical & mental clarity.',
    streak: 45,
    bestStreak: 60,
    completedDates: { [todayStr]: true, [yesterdayStr]: true, [day2Ago]: true },
    completionTimestamps: { [todayStr]: '08:00 PM', [yesterdayStr]: '08:00 PM', [day2Ago]: '08:00 PM' },
  },
  {
    id: 'habit-10',
    name: 'No Mobile Browsing',
    category: 'Discipline',
    routine: 'evening',
    iconName: 'Smartphone',
    description: 'Eliminate mindless social media scrolling & useless web browsing.',
    streak: 9,
    bestStreak: 14,
    completedDates: { [todayStr]: true, [yesterdayStr]: true, [day2Ago]: true },
    completionTimestamps: { [todayStr]: '09:30 PM', [yesterdayStr]: '09:45 PM', [day2Ago]: '09:15 PM' },
  },
  {
    id: 'habit-11',
    name: 'Daily Journaling',
    category: 'Mind',
    routine: 'evening',
    iconName: 'BookOpen',
    description: 'Write daily reflections, key insights, mood and lessons learned.',
    streak: 14,
    bestStreak: 25,
    completedDates: { [todayStr]: true, [yesterdayStr]: true, [day2Ago]: true },
    completionTimestamps: { [todayStr]: '10:00 PM', [yesterdayStr]: '10:15 PM', [day2Ago]: '10:00 PM' },
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Mail Check',
    priority: 'High',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '09:00 AM',
    notes: 'Check critical unread emails and client communications.',
  },
  {
    id: 'task-2',
    title: 'Store Sales Review',
    priority: 'High',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '09:30 AM',
    notes: 'Analyze yesterday and morning store performance and revenue metrics.',
  },
  {
    id: 'task-3',
    title: 'Team Meeting',
    priority: 'High',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '10:00 AM',
    notes: 'Daily standup with department leads and floor managers.',
  },
  {
    id: 'task-4',
    title: 'Stock Check',
    priority: 'Medium',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '11:00 AM',
    notes: 'Audit inventory levels and flag fast-moving items.',
  },
  {
    id: 'task-5',
    title: 'Rate Check',
    priority: 'Medium',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '11:45 AM',
    notes: 'Verify current market pricing and supplier rates.',
  },
  {
    id: 'task-6',
    title: 'PO Status Review',
    priority: 'High',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '12:30 PM',
    notes: 'Review pending Purchase Orders and supplier approvals.',
  },
  {
    id: 'task-7',
    title: 'Pending Operational Tasks',
    priority: 'High',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '02:00 PM',
    notes: 'Clear operational bottlenecks and store maintenance requests.',
  },
  {
    id: 'task-8',
    title: 'Pending Deliveries',
    priority: 'High',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '03:15 PM',
    notes: 'Track dispatch schedules and logistics partner updates.',
  },
  {
    id: 'task-9',
    title: 'Hiring / Manpower Status',
    priority: 'Medium',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '04:00 PM',
    notes: 'Review staff attendance, open requisitions, and candidate interviews.',
  },
  {
    id: 'task-10',
    title: 'Next Business Planning',
    priority: 'High',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '05:00 PM',
    notes: 'Outline strategy, targets, and focus points for tomorrow.',
  },
  {
    id: 'task-11',
    title: 'Customer Visit',
    priority: 'Medium',
    category: 'Business',
    status: 'todo',
    dueDate: todayStr,
    time: '05:45 PM',
    notes: 'On-site visit or VIP client consultation.',
  },
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Executive Leadership Sync & Strategy Review',
    time: '11:00 AM',
    duration: '45 mins',
    type: 'Business',
    locationOrLink: 'Boardroom / Zoom',
    attendees: ['Mihir Jani', 'Rohan Mehta', 'Priya Sharma'],
    notes: 'Discuss Q3 scale milestones and tech roadmap.',
    completed: true,
  },
  {
    id: 'meet-2',
    title: 'AI Product Design & UX Feedback Session',
    time: '03:00 PM',
    duration: '60 mins',
    type: 'Client',
    locationOrLink: 'Google Meet',
    attendees: ['Mihir Jani', 'Product Design Team'],
    notes: 'Review SARTHI UI components, blue/white theme, and mobile fluidity.',
    completed: false,
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: '3 Core Operating Principles for SARTHI',
    content: '1. Clarity over Noise: Focus only on high-leverage actions.\n2. Consistency is Momentum: Small daily habits compound into massive long-term transformation.\n3. Inner Calm, Outer Execution: Start with meditation & gratitude, execute with precision.',
    tags: ['Philosophy', 'Leadership', 'System'],
    updatedAt: todayStr,
    isPinned: true,
  },
  {
    id: 'note-2',
    title: 'Habit Formation Science',
    content: 'Cue -> Craving -> Response -> Reward. Keep triggers visible, eliminate friction for good habits, and make bad habits inconvenient.',
    tags: ['Psychology', 'Habits'],
    updatedAt: todayStr,
    isPinned: false,
  },
];

export const INITIAL_JOURNAL: Record<string, JournalEntry> = {
  [todayStr]: {
    date: todayStr,
    moodRating: 5,
    gratitude: [
      'Grateful for good health, mental clarity and loving family.',
      'Thankful for new technology capabilities and building SARTHI.',
      'Grateful for clean morning air and energy during yoga.',
    ],
    dailyWins: [
      'Completed all morning spiritual habits before 8:00 AM.',
      'Designed the complete SARTHI OS dashboard and mobile system.',
    ],
    learnings: 'When you control your morning inputs (Gratitude, Warm water, No mobile browsing), the entire day flows with calm focus.',
    journalText: 'Today was a day of deep intentionality. Woke up energized, completed prayer and warm water routine. Focused purely on high-impact business decisions and health.',
    manifestationFocus: 'Expanding SARTHI into an indispensable daily OS for high performers worldwide.',
  },
};

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    id: 'q1',
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "Excellence"
  },
  {
    id: 'q2',
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    category: "Discipline"
  },
  {
    id: 'q3',
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    category: "Systems"
  },
  {
    id: 'q4',
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    category: "Mindfulness"
  },
  {
    id: 'q5',
    text: "Action produces information. Motion creates momentum.",
    author: "Mihir Jani",
    category: "Execution"
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Achieve $50K Q3 Revenue Target',
    category: 'Business',
    timeframe: 'Q3 2026',
    targetDate: '2026-09-30',
    currentProgress: 38500,
    targetProgress: 50000,
    unit: '$',
    status: 'active',
    description: 'Scale core SaaS subscriptions and enterprise coaching programs across global markets.',
    milestones: [
      { id: 'm1-1', title: 'Onboard 15 New Enterprise Clients', completed: true },
      { id: 'm1-2', title: 'Launch Annual Subscription Tier', completed: true },
      { id: 'm1-3', title: 'Close Q3 Strategic Partners Deal', completed: false },
    ],
  },
  {
    id: 'goal-2',
    title: 'Maintain 10,000 Daily Steps & Energy',
    category: 'Health',
    timeframe: 'Monthly',
    targetDate: '2026-08-31',
    currentProgress: 24,
    targetProgress: 30,
    unit: 'days',
    status: 'active',
    description: 'Daily morning brisk walking and mobility training to sustain high executive energy.',
    milestones: [
      { id: 'm2-1', title: 'First 10 Days Streak', completed: true },
      { id: 'm2-2', title: '20 Days Milestone Achieved', completed: true },
      { id: 'm2-3', title: '30 Days Full Monthly Streak', completed: false },
    ],
  },
  {
    id: 'goal-3',
    title: 'Launch SARTHI OS 2.0 Web Platform',
    category: 'Business',
    timeframe: 'Q3 2026',
    targetDate: '2026-08-15',
    currentProgress: 85,
    targetProgress: 100,
    unit: '%',
    status: 'active',
    description: 'Deploy full Executive AI Workspace, Goals Module, and Cloud Sync infrastructure.',
    milestones: [
      { id: 'm3-1', title: 'UI/UX Redesign & Dynamic Components', completed: true },
      { id: 'm3-2', title: 'Goals & Planner Module Integration', completed: true },
      { id: 'm3-3', title: 'Final Production Deployment & QA', completed: false },
    ],
  },
  {
    id: 'goal-4',
    title: 'Read 6 Leadership & System Strategy Books',
    category: 'Mindset',
    timeframe: 'Yearly',
    targetDate: '2026-12-31',
    currentProgress: 4,
    targetProgress: 6,
    unit: 'books',
    status: 'active',
    description: 'Read key literature on high-performance execution, scaling operations, and mental models.',
    milestones: [
      { id: 'm4-1', title: 'Atomic Habits by James Clear', completed: true },
      { id: 'm4-2', title: 'High Output Management by Andy Grove', completed: true },
      { id: 'm4-3', title: 'Principles by Ray Dalio', completed: true },
      { id: 'm4-4', title: 'Thinking in Systems by Donella Meadows', completed: true },
      { id: 'm4-5', title: 'The Great CEO Within by Matt Mochary', completed: false },
      { id: 'm4-6', title: 'Good to Great by Jim Collins', completed: false },
    ],
  },
  {
    id: 'goal-5',
    title: 'Build $25K Emergency Reserve Fund',
    category: 'Finance',
    timeframe: 'Yearly',
    targetDate: '2026-12-31',
    currentProgress: 25000,
    targetProgress: 25000,
    unit: '$',
    status: 'completed',
    description: 'Set aside liquid capital reserves for business contingency and peace of mind.',
    milestones: [
      { id: 'm5-1', title: 'Initial $10K Deposit', completed: true },
      { id: 'm5-2', title: 'Reach $18K Capital Mark', completed: true },
      { id: 'm5-3', title: 'Complete $25K Allocation Target', completed: true },
    ],
  },
];
