import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  Quote as QuoteIcon,
  Zap,
  Target,
  Sun,
  CloudSun,
  Droplet,
  Calendar,
  Clock,
  Briefcase,
  Check,
  X,
  ChevronRight,
  Award,
  Sparkle,
  ListTodo,
  AlertCircle,
  BookOpen,
  Send,
  PenTool,
  CheckSquare,
  Bot,
  MessageSquare,
  TrendingUp,
  Layers
} from 'lucide-react';
import { Habit, Task, Meeting, Quote, UserProfile, Priority, TaskCategory } from '../types';
import { getTodayDateString } from '../data/initialData';
import { useUser } from '../context/UserContext';

interface DashboardViewProps {
  user: UserProfile;
  habits: Habit[];
  tasks: Task[];
  meetings?: Meeting[];
  quotes: Quote[];
  onToggleHabit: (habitId: string) => void;
  onToggleTask: (taskId: string) => void;
  onToggleMeeting?: (meetingId: string) => void;
  onAddTask?: (task: Task) => void;
  onNavigateTab: (tab: any) => void;
  onOpenCoach: () => void;
  onQuickAddTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  habits,
  tasks,
  quotes,
  onToggleHabit,
  onToggleTask,
  onAddTask,
  onNavigateTab,
  onOpenCoach,
}) => {
  const { goals = [], journal = {} } = useUser();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [celebrationHabit, setCelebrationHabit] = useState<string | null>(null);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Quick Task Form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('High');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Business');
  const [newTaskTime, setNewTaskTime] = useState('11:00 AM');

  // AI Briefing Query state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiResponseTitle, setAiResponseTitle] = useState<string>('');

  const todayStr = getTodayDateString();

  // Date Formatting (Apple / Notion style)
  const todayDateObj = new Date();
  const formattedDate = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Time based greeting
  const hour = todayDateObj.getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
  else if (hour >= 17) greeting = 'Good Evening';

  // 1. Habit Metrics
  const completedHabitsCount = habits.filter((h) => h.completedDates[todayStr]).length;
  const totalHabitsCount = habits.length;
  const habitScore = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  // 2. Task Metrics
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const activeTasksSource = todayTasks.length > 0 ? todayTasks : tasks;
  const completedTasksCount = todayTasks.filter((t) => t.status === 'completed').length;
  const pendingTodayTasks = todayTasks.filter((t) => t.status !== 'completed');
  const taskScore = todayTasks.length > 0 ? Math.round((completedTasksCount / todayTasks.length) * 100) : 0;

  // 3. Goals & Journal Status
  const activeGoalsCount = goals.length;
  const isJournalDoneToday = !!(journal && journal[todayStr]);

  // 4. Combined Productivity Completion %
  const combinedScore = Math.round(
    ((completedHabitsCount + completedTasksCount) / Math.max(1, totalHabitsCount + todayTasks.length)) * 100
  );

  // Top 3 Focus Priorities
  const pendingAllTasks = tasks.filter((t) => t.status !== 'completed');
  const sortedTopPriorities = pendingAllTasks
    .slice()
    .sort((a, b) => {
      const aOverdue = a.dueDate && a.dueDate < todayStr ? 1 : 0;
      const bOverdue = b.dueDate && b.dueDate < todayStr ? 1 : 0;
      if (bOverdue !== aOverdue) return bOverdue - aOverdue;

      const aToday = a.dueDate === todayStr ? 1 : 0;
      const bToday = b.dueDate === todayStr ? 1 : 0;
      if (bToday !== aToday) return bToday - aToday;

      const pMap = { High: 3, Medium: 2, Low: 1 };
      return (pMap[b.priority] || 1) - (pMap[a.priority] || 1);
    })
    .slice(0, 3);

  // Daily Quote
  const currentQuote = quotes[quoteIndex % quotes.length] || quotes[0];
  const handleNextQuote = () => setQuoteIndex((prev) => (prev + 1) % quotes.length);

  // Submit Quick Task Modal
  const handleCreateQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      category: newTaskCategory,
      status: 'todo',
      dueDate: todayStr,
      time: newTaskTime,
    };

    if (onAddTask) {
      onAddTask(newTask);
    }
    setNewTaskTitle('');
    setShowQuickModal(false);
  };

  // Quick AI Assistant query handler
  const handleAiQuery = (queryText: string) => {
    if (!queryText.trim()) return;
    const q = queryText.trim().toLowerCase();

    if (q.includes('plan my day') || q.includes('schedule')) {
      setAiResponseTitle("Today's Strategic Schedule");
      if (pendingTodayTasks.length === 0) {
        setAiResponse("🎉 All tasks for today are completed! Keep up the great momentum.");
      } else {
        const planList = pendingTodayTasks
          .map((t, idx) => `${idx + 1}. **${t.time || '10:00 AM'}** - ${t.title} (${t.priority} Priority)`)
          .join('\n');
        setAiResponse(`📅 **Recommended Execution Order:**\n\n${planList}\n\n💡 Focus on completing high-priority items first.`);
      }
    } else if (q.includes('priority') || q.includes('focus')) {
      setAiResponseTitle("Focus Action Ranking");
      const high = pendingAllTasks.filter((t) => t.priority === 'High');
      setAiResponse(
        `🔴 **High Priority Items:**\n${
          high.length > 0 ? high.map((t) => `• ${t.title}`).join('\n') : '• No high priority pending tasks!'
        }`
      );
    } else {
      setAiResponseTitle(`Analysis for "${queryText}"`);
      setAiResponse(`🤖 **SARTHI AI Insight:**\n\nYou have ${pendingTodayTasks.length} tasks scheduled today and ${totalHabitsCount - completedHabitsCount} habits remaining. Focus on ${sortedTopPriorities[0]?.title || 'your top focus area'} first.`);
    }
    setAiQuery('');
  };

  const handleHabitClick = (habit: Habit) => {
    const isDone = habit.completedDates[todayStr];
    onToggleHabit(habit.id);
    if (!isDone) {
      setCelebrationHabit(habit.name);
      setTimeout(() => setCelebrationHabit(null), 2500);
    }
  };

  const firstName = user.name ? user.name.split(' ')[0] : 'User';

  return (
    <div className="space-y-5 pb-28 animate-fadeIn text-slate-800 relative">
      {/* Toast Notification when completing a habit */}
      {celebrationHabit && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-blue-500/40 flex items-center gap-2 animate-bounce">
          <Sparkle className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span className="text-xs font-bold">
            Habit Completed: <span className="text-amber-200">{celebrationHabit}</span> 🎉
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TOP HEADER: GREETING, DATE & DAILY MOTIVATIONAL QUOTE */}
      {/* ========================================================= */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-3">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{formattedDate}</span>
              <span className="text-slate-300">•</span>
              <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-amber-200/60 flex items-center gap-1 shadow-2xs">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-400 animate-pulse" />
                {user.currentStreak} Day Streak
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              {greeting}, {firstName} 👋
            </h2>
          </div>

          <button
            onClick={() => onNavigateTab('planner')}
            className="self-start sm:self-center flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-blue-900/15 hover:shadow-lg active:scale-95 cursor-pointer group"
          >
            <span>Today's Schedule</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Motivational Quote Banner - Reduced Height & Increased Spacing */}
        <div className="mt-4 sm:mt-4.5 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 rounded-2xl px-3 py-2 border border-blue-100/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <QuoteIcon className="w-3 h-3" />
            </div>
            <div className="min-w-0 flex-1 flex items-baseline gap-2">
              <p className="text-xs font-semibold text-slate-800 italic truncate">
                "{currentQuote.text}"
              </p>
              <span className="text-[10px] text-blue-600 font-bold shrink-0 hidden sm:inline">
                — {currentQuote.author}
              </span>
            </div>
          </div>
          <button
            onClick={handleNextQuote}
            className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
            title="Next Quote"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TODAY SUMMARY: 4 LIVE COUNT CARDS */}
      {/* ========================================================= */}
      <section className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Today's Executive Summary</span>
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Today's Habits */}
          <div
            onClick={() => onNavigateTab('habits')}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold ring-1 ring-emerald-100 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/60 text-emerald-700">
                {habitScore}% Done
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {completedHabitsCount}
                </span>
                <span className="text-xs font-semibold text-slate-400">/{totalHabitsCount}</span>
              </div>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Today's Habits</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${habitScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Today's Tasks */}
          <div
            onClick={() => onNavigateTab('planner')}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold ring-1 ring-blue-100 group-hover:scale-105 transition-transform">
                <ListTodo className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/60 text-blue-700">
                {pendingTodayTasks.length} Pending
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {completedTasksCount}
                </span>
                <span className="text-xs font-semibold text-slate-400">/{todayTasks.length}</span>
              </div>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Today's Tasks</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${taskScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Active Goals */}
          <div
            onClick={() => onNavigateTab('goals')}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold ring-1 ring-purple-100 group-hover:scale-105 transition-transform">
                <Target className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100/60 text-purple-700">
                Focus
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {activeGoalsCount}
                </span>
                <span className="text-xs font-semibold text-slate-400">Goals</span>
              </div>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Active Goals</p>
              <p className="text-[10px] text-purple-600 font-semibold mt-1">
                {activeGoalsCount > 0 ? `${activeGoalsCount} active commitments` : 'Set a new goal'}
              </p>
            </div>
          </div>

          {/* Card 4: Journal Status */}
          <div
            onClick={() => onNavigateTab('journal')}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold ring-1 ring-amber-100 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isJournalDoneToday
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isJournalDoneToday ? 'Completed' : 'Pending'}
              </span>
            </div>
            <div className="mt-2.5">
              <span className="text-lg font-black text-slate-900 tracking-tight block">
                {isJournalDoneToday ? 'Reflected ✨' : 'Not Written Yet'}
              </span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Journal Status</p>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">
                {isJournalDoneToday ? 'Entry saved today' : 'Tap to write daily reflection'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* AI COACH PREMIUM CARD */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden border border-blue-800/50">
        {/* Glow ambient background graphics */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md ring-2 ring-white/20">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  SARTHI Executive AI Assistant
                </h3>
                <p className="text-[10px] text-blue-200 font-medium">
                  Real-Time Schedule Synthesis & Prioritization
                </p>
              </div>
            </div>
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
              Live AI
            </span>
          </div>

          {/* Dynamic Personalized Message */}
          <div className="my-3.5 bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
              "{greeting} <span className="font-bold text-blue-300">{firstName}</span>. You have{' '}
              <span className="font-bold text-amber-300">{pendingTodayTasks.length} tasks</span> scheduled today,{' '}
              <span className="font-bold text-emerald-300">
                {totalHabitsCount - completedHabitsCount} habits
              </span>{' '}
              remaining, and <span className="font-bold text-cyan-300">{activeGoalsCount} active goals</span>."
            </p>
          </div>

          {/* Quick AI Query Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 my-3">
            <button
              onClick={() => handleAiQuery('plan my day')}
              className="bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all border border-white/15 cursor-pointer"
            >
              📅 Plan my day
            </button>
            <button
              onClick={() => handleAiQuery('priority')}
              className="bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all border border-white/15 cursor-pointer"
            >
              🎯 Priority hierarchy
            </button>
            <button
              onClick={() => handleAiQuery('performance')}
              className="bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all border border-white/15 cursor-pointer"
            >
              📊 Performance breakdown
            </button>
          </div>

          {/* AI Response Display Box (if requested) */}
          {aiResponse && (
            <div className="my-3 bg-slate-950/80 rounded-2xl p-3.5 border border-blue-500/30 animate-fadeIn text-xs text-slate-200">
              <div className="flex items-center justify-between mb-1.5 border-b border-slate-800 pb-1">
                <span className="font-bold text-blue-300">{aiResponseTitle}</span>
                <button
                  onClick={() => setAiResponse(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="whitespace-pre-line leading-relaxed font-sans">{aiResponse}</div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-1 flex items-center justify-between gap-3">
            <button
              onClick={onOpenCoach}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Bot className="w-4 h-4 text-blue-200" />
              <span>Talk to SARTHI AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TODAY FOCUS: TOP 3 PRIORITIES CHECKLIST */}
      {/* ========================================================= */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Today Focus Priorities
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Top 3 critical items for maximum leverage
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('planner')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({tasks.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {sortedTopPriorities.length === 0 ? (
            <div className="p-5 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800">All Focus Priorities Cleared! 🎉</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Outstanding work! You have no high-priority pending items left.
              </p>
            </div>
          ) : (
            sortedTopPriorities.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-slate-50/80 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200/80 hover:border-blue-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title={isCompleted ? 'Mark Todo' : 'Mark Complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-blue-600" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-bold text-slate-900 leading-snug truncate ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                            task.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : task.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {task.category}
                        </span>
                        {task.time && (
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {task.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600'
                    }`}
                  >
                    {isCompleted ? 'Done' : 'Complete'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* PRODUCTIVITY: CIRCULAR PROGRESS & DAILY SCORE */}
      {/* ========================================================= */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Productivity & Completion
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Combined daily execution score across habits and tasks
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            {combinedScore}% Score
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Circular Progress SVG Ring */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 transition-all duration-1000 ease-out"
                  strokeDasharray={`${combinedScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {combinedScore}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Today
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="sm:col-span-2 space-y-2.5">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Habit Discipline Score</span>
              <span className="text-xs font-black text-emerald-600">{habitScore}%</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Task Execution Score</span>
              <span className="text-xs font-black text-blue-600">{taskScore}%</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Active Streak</span>
              <span className="text-xs font-black text-amber-600">{user.currentStreak} Days</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* QUICK ACTIONS FLOATING SPEED DIAL (FAB) */}
      {/* ========================================================= */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-50 flex flex-col items-end gap-2">
        {/* Speed Dial Menu items */}
        {isFabOpen && (
          <div className="flex flex-col items-end gap-2 mb-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <button
              onClick={() => {
                setIsFabOpen(false);
                setShowQuickModal(true);
              }}
              className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-2xl shadow-xl hover:bg-slate-800 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <ListTodo className="w-4 h-4 text-blue-400" />
              <span>Add Task</span>
            </button>

            <button
              onClick={() => {
                setIsFabOpen(false);
                onNavigateTab('habits');
              }}
              className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-2xl shadow-xl hover:bg-slate-800 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Add Habit</span>
            </button>

            <button
              onClick={() => {
                setIsFabOpen(false);
                onNavigateTab('goals');
              }}
              className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-2xl shadow-xl hover:bg-slate-800 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <Target className="w-4 h-4 text-purple-400" />
              <span>Add Goal</span>
            </button>

            <button
              onClick={() => {
                setIsFabOpen(false);
                onNavigateTab('journal');
              }}
              className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-2xl shadow-xl hover:bg-slate-800 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Write Journal</span>
            </button>
          </div>
        )}

        {/* Main Floating (+) Button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-white/80 ${
            isFabOpen ? 'rotate-45 bg-slate-900' : ''
          }`}
          title="Quick Actions"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* QUICK TASK CREATION MODAL */}
      {/* ========================================================= */}
      {showQuickModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ListTodo className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Quick Add Task</h3>
              </div>
              <button
                onClick={() => setShowQuickModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Store Sales Review & Rate Check"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs font-semibold p-3 rounded-2xl outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 text-xs font-semibold p-2.5 rounded-xl outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 text-xs font-semibold p-2.5 rounded-xl outline-none"
                  >
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Target Time</label>
                <input
                  type="text"
                  placeholder="e.g. 11:00 AM"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 text-xs font-semibold p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
