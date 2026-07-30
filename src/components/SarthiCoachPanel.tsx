import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListTodo,
  Briefcase,
  Lightbulb,
  Zap,
  TrendingUp,
  AlertCircle,
  Calendar,
  RotateCcw,
  Plus,
  ArrowRight,
  Target,
  ShieldAlert,
  Bot,
  User,
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Flame,
  ChevronRight,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import { Task, Meeting, Habit, UserProfile, AICoachMessage, NavTab } from '../types';
import { getTodayDateString } from '../data/initialData';
import { useUser } from '../context/UserContext';
import { aiActionService } from '../services/ai/aiActionService';

interface SarthiCoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  tasks: Task[];
  meetings: Meeting[];
  habits: Habit[];
  onSelectTab?: (tab: NavTab) => void;
}

export const SarthiCoachPanel: React.FC<SarthiCoachPanelProps> = ({
  isOpen,
  onClose,
  user,
  tasks,
  meetings,
  habits,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  const { setTasks, setHabits, updateProfile, dataService } = useUser();
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'overview' | 'chat'>('overview');
  const [inputQuery, setInputQuery] = useState('');
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newTaskCategory, setNewTaskCategory] = useState<'Business' | 'Personal' | 'Finance' | 'Health'>('Business');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const todayStr = getTodayDateString();
  const todayDateObj = new Date();
  const hour = todayDateObj.getHours();

  // 1. Personal Greeting Setup
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
  else if (hour >= 17) greeting = 'Good Evening';

  const formattedDate = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Data Calculations
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const activeTasksSource = todayTasks.length > 0 ? todayTasks : tasks;

  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');
  const pendingTodayTasks = todayTasks.filter((t) => t.status !== 'completed');

  const todayTotalCount = todayTasks.length > 0 ? todayTasks.length : tasks.length;
  const todayCompletedCount = todayTasks.length > 0 ? completedTodayTasks.length : tasks.filter((t) => t.status === 'completed').length;
  const todayPendingCount = Math.max(0, todayTotalCount - todayCompletedCount);
  const todayTaskScore = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 100;

  // Priorities breakdown
  const highPriorityCount = activeTasksSource.filter((t) => t.priority === 'High' && t.status !== 'completed').length;
  const mediumPriorityCount = activeTasksSource.filter((t) => t.priority === 'Medium' && t.status !== 'completed').length;
  const lowPriorityCount = activeTasksSource.filter((t) => t.priority === 'Low' && t.status !== 'completed').length;

  // Overdue & Pending Tasks
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
  );
  const overdueCount = overdueTasks.length;

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const pendingHigh = pendingTasks.filter((t) => t.priority === 'High');

  // Workload Hours
  const estimatedWorkloadHours = pendingTasks.reduce((acc, t) => {
    if (t.priority === 'High') return acc + 1.25;
    if (t.priority === 'Medium') return acc + 0.75;
    return acc + 0.5;
  }, 0);

  // Habit metrics
  const completedHabitsCount = habits.filter((h) => h.completedDates[todayStr]).length;
  const totalHabitsCount = habits.length;
  const habitCompletionRate = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;
  const maxHabitStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  // 2. Executive Summary Score
  const overallProductivityScore = Math.round(
    todayTaskScore * 0.6 + habitCompletionRate * 0.4
  );

  // 6. Risk Alerts
  const riskAlerts: { type: 'danger' | 'warning' | 'info' | 'success'; title: string; desc: string }[] = [];
  if (overdueCount > 0) {
    riskAlerts.push({
      type: 'danger',
      title: `${overdueCount} Overdue Task${overdueCount > 1 ? 's' : ''}`,
      desc: `Critical: "${overdueTasks[0].title}" requires immediate resolution to avoid bottlenecks.`,
    });
  }
  if (pendingHigh.length > 0) {
    riskAlerts.push({
      type: 'warning',
      title: `${pendingHigh.length} High Priority Item${pendingHigh.length > 1 ? 's' : ''} Pending`,
      desc: `Focus on "${pendingHigh[0].title}" during your next high-energy work block.`,
    });
  }
  const todayMeetings = meetings.filter((m) => !m.completed && (!m.dueDate || (m as any).dueDate === todayStr));
  if (todayMeetings.length > 0) {
    riskAlerts.push({
      type: 'info',
      title: `${todayMeetings.length} Scheduled Meeting${todayMeetings.length > 1 ? 's' : ''} Today`,
      desc: `Upcoming: ${todayMeetings[0].title} (${todayMeetings[0].time || 'Today'})`,
    });
  }
  if (riskAlerts.length === 0) {
    riskAlerts.push({
      type: 'success',
      title: 'Schedule & Execution Clear',
      desc: 'All operational risk factors are green. Peak performance maintained!',
    });
  }

  // 7. Smart Recommendations
  const smartRecommendations = [
    pendingHigh[0]
      ? `Prioritize "${pendingHigh[0].title}" in your upcoming 90-minute focus window.`
      : 'All high priority tasks completed! Review medium priority items.',
    habitCompletionRate < 100
      ? `Complete remaining ${totalHabitsCount - completedHabitsCount} daily habits to maintain your ${maxHabitStreak}-day streak.`
      : '100% Habit completion achieved today! Excellent discipline.',
    `Estimated remaining workload: ~${estimatedWorkloadHours.toFixed(1)} hours across ${pendingTasks.length} pending tasks.`,
  ];

  // Initial Message Generator
  const generateInitialMessage = (): AICoachMessage => ({
    id: 'initial_welcome',
    sender: 'sarthi',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `👋 **${greeting}, ${user.name.split(' ')[0]}!** Welcome to your **SARTHI AI Workspace**.\n\n` +
      `Here is your real-time operational executive briefing:\n\n` +
      `🎯 **Executive Index:** ${overallProductivityScore}% Productivity Score\n` +
      `📋 **Planner Status:** ${todayCompletedCount}/${todayTotalCount} Tasks Done (${todayPendingCount} Pending, ~${estimatedWorkloadHours.toFixed(1)} hrs workload)\n` +
      `🔥 **Habit Discipline:** ${completedHabitsCount}/${totalHabitsCount} Habits Checked (${habitCompletionRate}%)\n` +
      `⚠️ **Top Alert:** ${riskAlerts[0]?.title} - ${riskAlerts[0]?.desc}\n\n` +
      `Select a quick prompt below or type any prompt to analyze your day!`,
  });

  const [messages, setMessages] = useState<AICoachMessage[]>([generateInitialMessage()]);

  useEffect(() => {
    if (isOpen && activeWorkspaceTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeWorkspaceTab]);

  if (!isOpen) return null;

  // Local AI Response Generator
  const generateLocalResponse = (promptText: string): string => {
    const q = promptText.toLowerCase().trim();

    if (q.includes('plan my day') || q.includes('plan today') || q.includes('schedule')) {
      if (pendingTasks.length === 0) {
        return `🎉 **Outstanding Execution!**\n\nYou have completed 100% of your scheduled tasks for today.\n\n` +
          `• **Completed:** ${todayCompletedCount}/${todayTotalCount} tasks\n` +
          `• **Habit Rate:** ${habitCompletionRate}%\n` +
          `• **Recommendation:** Focus on strategic long-term goals or team mentorship.`;
      }

      const scheduleList = pendingTasks.slice(0, 5).map((t, idx) => {
        const timeSlot = t.time || (idx === 0 ? '09:00 AM – 10:30 AM' : idx === 1 ? '11:00 AM – 12:30 PM' : '02:00 PM – 03:30 PM');
        return `**${idx + 1}. ${timeSlot}**\n   • **Task:** ${t.title}\n   • **Priority:** ${t.priority} | **Category:** ${t.category}`;
      }).join('\n\n');

      return `📅 **Optimal Executive Day Blueprint:**\n\n${scheduleList}\n\n` +
        `💡 *Execution Insight: Focus on high-impact items during peak morning energy.*`;
    }

    if (q.includes('prioritize') || q.includes('priority') || q.includes('work')) {
      const high = pendingTasks.filter((t) => t.priority === 'High');
      const med = pendingTasks.filter((t) => t.priority === 'Medium');
      const low = pendingTasks.filter((t) => t.priority === 'Low');

      let res = `🎯 **Action Priority Ranking (SARTHI Data Service):**\n\n`;
      res += `🔴 **High Priority (Do First):**\n`;
      res += high.length > 0 ? high.map((t) => `• **${t.title}** (${t.category} • ${t.dueDate || 'Today'})`).join('\n') : `• None! All high-priority tasks completed.`;

      res += `\n\n🟡 **Medium Priority (Do Next):**\n`;
      res += med.length > 0 ? med.map((t) => `• **${t.title}** (${t.category})`).join('\n') : `• None pending.`;

      res += `\n\n🔵 **Low Priority (Flexible):**\n`;
      res += low.length > 0 ? low.map((t) => `• **${t.title}** (${t.category})`).join('\n') : `• None pending.`;

      return res;
    }

    if (q.includes('review today') || q.includes('performance') || q.includes('summary')) {
      return `📊 **Executive Performance Audit:**\n\n` +
        `• **Productivity Index:** ${overallProductivityScore}%\n` +
        `• **Tasks Completed:** ${todayCompletedCount} of ${todayTotalCount} (${todayTaskScore}%)\n` +
        `• **Remaining Workload:** ${todayPendingCount} tasks (~${estimatedWorkloadHours.toFixed(1)} hrs)\n` +
        `• **Habit Discipline:** ${completedHabitsCount}/${totalHabitsCount} habits checked (${habitCompletionRate}%)\n` +
        `• **Overdue Tasks:** ${overdueCount} items\n\n` +
        (overallProductivityScore >= 75
          ? `🚀 **Status:** Excellent momentum! Operating at peak capacity.`
          : `💡 **Status:** Moderate progress. Clear out top priority items to push score past 80%.`);
    }

    if (q.includes('prepare tomorrow') || q.includes('tomorrow')) {
      return `🌅 **Suggested Blueprint for Tomorrow:**\n\n` +
        `1. **09:00 AM – 10:00 AM** • Executive Alignment & Inbox Triaging\n` +
        `2. **10:00 AM – 11:30 AM** • High-Impact Focus Block (Deep Work)\n` +
        `3. **11:30 AM – 01:00 PM** • Operational & Finance Audit\n` +
        `4. **02:00 PM – 03:30 PM** • Stakeholder Sync & Customer Reviews\n` +
        `5. **04:30 PM – 05:00 PM** • Daily Reflection & Journal Entry\n\n` +
        `💡 *Tip: Clear out administrative notes before wrapping up today.*`;
    }

    if (q.includes('risk') || q.includes('alert') || q.includes('audit')) {
      return `⚠️ **Risk & Vulnerability Audit:**\n\n` +
        riskAlerts.map((r) => `• **[${r.title}]**: ${r.desc}`).join('\n\n') +
        `\n\n💡 *Action Required: Clear overdue items first to prevent schedule slip.*`;
    }

    if (q.includes('goal') || q.includes('progress') || q.includes('milestone')) {
      return `📈 **Goals & Milestones Status:**\n\n` +
        `1. **Monthly Task Completion Target:** ${todayTaskScore}% / 85% Target (${todayTaskScore >= 85 ? 'On Track' : 'Needs Focus'})\n` +
        `2. **Habit Streak Target:** ${maxHabitStreak} Days Active Streak (${habitCompletionRate}% today)\n` +
        `3. **Workload Management:** ~${estimatedWorkloadHours.toFixed(1)} Hours (~4.0 Hours Max Target)\n\n` +
        `Keep maintaining consistent daily habit logging to achieve full target progress!`;
    }

    // Default intelligent keyword search in tasks/meetings
    const matched = tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );

    if (matched.length > 0) {
      return `🔍 **Found ${matched.length} matching task(s) in DataService:**\n\n` +
        matched.map((t) => `• **${t.title}**\n  Status: ${t.status.toUpperCase()} | Priority: ${t.priority} | Due: ${t.dueDate || 'Today'}`).join('\n\n');
    }

    return `🤖 **SARTHI AI Workspace Insights:**\n\n` +
      `Based on your live local dataset, you have **${pendingTasks.length} pending tasks** with **~${estimatedWorkloadHours.toFixed(1)} hours** of workload.\n\n` +
      `Your current Productivity Index stands at **${overallProductivityScore}%**.\n\n` +
      `Click any suggested prompt below or ask a question to optimize your workflow!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    // Switch to chat tab when sending a prompt
    setActiveWorkspaceTab('chat');

    const userMsg: AICoachMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    setTimeout(() => {
      // 1. Try AI Action Engine parsing
      const parsedIntent = aiActionService.parseIntent((user as any).id || user.uid || 'mansi', text);
      const isActionCommand = ['create', 'complete', 'remind', 'reschedule', 'open', 'navigate', 'delete'].includes(parsedIntent.intent);

      let responseText = '';

      if (isActionCommand) {
        const actionResult = aiActionService.executeAction((user as any).id || user.uid || 'mansi', parsedIntent);
        
        responseText = `⚡ **AI Action Executed:**\n\n${actionResult.message}`;

        // Sync local React state if navigation or tasks/habits modified
        if (actionResult.navTarget && onSelectTab) {
          onSelectTab(actionResult.navTarget);
        }

        // Refresh central state
        const refreshedTasks = dataService.getTasks((user as any).id || user.uid || 'mansi');
        setTasks(refreshedTasks);
        const refreshedHabits = dataService.getHabits((user as any).id || user.uid || 'mansi');
        setHabits(refreshedHabits);
      } else {
        responseText = generateLocalResponse(text);
      }

      const aiMsg: AICoachMessage = {
        id: `ai_${Date.now()}`,
        sender: 'sarthi',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 200);
  };

  const handleResetChat = () => {
    setMessages([generateInitialMessage()]);
  };

  // Quick Actions Handlers
  const handleCompleteTopTask = () => {
    if (!pendingHigh[0] && !pendingTasks[0]) return;
    const target = pendingHigh[0] || pendingTasks[0];
    
    const updatedTasks = tasks.map((t) =>
      t.id === target.id ? { ...t, status: 'completed' as const } : t
    );
    setTasks(updatedTasks);
  };

  const handleToggleHabit = (habitId: string) => {
    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        const isDone = !!h.completedDates[todayStr];
        const updatedDates = { ...h.completedDates };
        if (isDone) {
          delete updatedDates[todayStr];
        } else {
          updatedDates[todayStr] = true;
        }
        return {
          ...h,
          completedDates: updatedDates,
          streak: !isDone ? h.streak + 1 : Math.max(0, h.streak - 1),
        };
      }
      return h;
    });
    setHabits(updatedHabits);
  };

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
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowQuickTaskModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950 text-slate-100 flex flex-col animate-fadeIn">
      {/* Background Ambient Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-blue-800/60 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 fill-amber-300/30" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                SARTHI AI Workspace
              </h1>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider hidden sm:inline-block">
                Executive OS Engine
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              Personalized AI Intelligence • Centralized Local DataService
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Desktop / Mobile) */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950/80 p-1 rounded-xl border border-blue-900/80 flex items-center gap-1">
            <button
              onClick={() => setActiveWorkspaceTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeWorkspaceTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Workspace Overview</span>
              <span className="sm:hidden">Overview</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeWorkspaceTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chat</span>
              <span className="bg-amber-400/30 text-amber-300 text-[10px] font-black px-1.5 rounded-full">
                {messages.length}
              </span>
            </button>
          </div>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/80"
            title="Reset AI Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 transition-all cursor-pointer border border-rose-800/60"
            title="Close Workspace"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10 custom-scrollbar">
        {activeWorkspaceTab === 'overview' ? (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* 1. PERSONAL GREETING SECTION */}
            <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/60 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32 text-amber-400" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                      {formattedDate}
                    </span>
                    <span className="text-xs font-bold text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded-md border border-blue-800/50">
                      {greeting}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {greeting}, {user.name} 👋
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-slate-300">
                    {user.role} • <span className="text-amber-300 font-bold">SARTHI OS Executive Intelligence</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-blue-800/60 shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-md shrink-0">
                    {overallProductivityScore}%
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Executive Index</p>
                    <p className="text-xs font-extrabold text-amber-300">
                      {overallProductivityScore >= 80 ? 'Peak Momentum' : overallProductivityScore >= 60 ? 'Steady Progress' : 'Focus Required'}
                    </p>
                    <p className="text-[10px] text-slate-400">Based on Tasks & Habits</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. QUICK ACTIONS BAR */}
            <section className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-4 shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>8. Quick Workspace Actions</span>
                </h3>
                <span className="text-[10px] font-semibold text-slate-400">One-tap execution</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                <button
                  onClick={() => setShowQuickTaskModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs p-2.5 rounded-xl border border-blue-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Quick Task</span>
                </button>

                <button
                  onClick={handleCompleteTopTask}
                  disabled={pendingTasks.length === 0}
                  className="bg-emerald-700/80 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Done Top Task</span>
                </button>

                <button
                  onClick={() => {
                    if (onSelectTab) onSelectTab('planner');
                    onClose();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs p-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ListTodo className="w-4 h-4 text-blue-400" />
                  <span>Open Planner</span>
                </button>

                <button
                  onClick={() => {
                    if (onSelectTab) onSelectTab('habits');
                    onClose();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs p-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Open Habits</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab('chat')}
                  className="col-span-2 sm:col-span-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs p-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask AI Coach</span>
                </button>
              </div>
            </section>

            {/* GRID OF SECTIONS: 2, 3, 4, 5, 6, 7 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 2. EXECUTIVE SUMMARY */}
              <div className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-blue-900/80 pb-2.5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>2. Executive Summary</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    Live Sync
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-blue-900/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Productivity</p>
                      <p className="text-xl font-black text-amber-300">{overallProductivityScore}%</p>
                    </div>
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-blue-900/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Workload</p>
                      <p className="text-xl font-black text-blue-300">~{estimatedWorkloadHours.toFixed(1)} hrs</p>
                    </div>
                  </div>

                  <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-800/40 space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-300">Executive Health Index</p>
                    <p className="text-xs font-semibold text-slate-200">
                      {todayCompletedCount >= todayTotalCount && todayTotalCount > 0
                        ? 'Operational schedule complete! Strategic tasks cleared.'
                        : `${todayPendingCount} task(s) remaining today across ${pendingHigh.length} high priority item(s).`}
                    </p>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Data Source: Centralized DataService</span>
                  <span className="font-bold text-blue-300">{tasks.length} total tasks</span>
                </div>
              </div>

              {/* 3. TODAY'S PLANNER STATUS */}
              <div className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-blue-900/80 pb-2.5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-indigo-400" />
                    <span>3. Today's Planner Status</span>
                  </h3>
                  <span className="text-xs font-black text-amber-300">{todayTaskScore}% Done</span>
                </div>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">{todayCompletedCount} of {todayTotalCount} Tasks Completed</span>
                      <span className="text-amber-300">{todayPendingCount} Pending</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-blue-900/80">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${todayTaskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Priority Breakdown Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-rose-950/50 border border-rose-800/50 p-2 rounded-xl">
                      <p className="text-[10px] font-bold text-rose-300 uppercase">High</p>
                      <p className="text-sm font-black text-rose-200">{highPriorityCount}</p>
                    </div>
                    <div className="bg-amber-950/50 border border-amber-800/50 p-2 rounded-xl">
                      <p className="text-[10px] font-bold text-amber-300 uppercase">Medium</p>
                      <p className="text-sm font-black text-amber-200">{mediumPriorityCount}</p>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Low</p>
                      <p className="text-sm font-black text-slate-200">{lowPriorityCount}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onSelectTab) onSelectTab('planner');
                    onClose();
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-blue-300 font-bold text-xs py-2 rounded-xl border border-blue-900/80 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View All Tasks in Planner</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4. HABIT COMPLETION */}
              <div className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-blue-900/80 pb-2.5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>4. Habit Completion</span>
                  </h3>
                  <span className="text-xs font-black text-emerald-400">{habitCompletionRate}% Today</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-950/90 p-3 rounded-xl border border-blue-900/60">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Habits Done</p>
                      <p className="text-lg font-black text-white">{completedHabitsCount} / {totalHabitsCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Best Streak</p>
                      <p className="text-lg font-black text-amber-300 flex items-center gap-1 justify-end">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>{maxHabitStreak} Days</span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Habit Checklist */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                    {habits.slice(0, 4).map((h) => {
                      const isDone = !!h.completedDates[todayStr];
                      return (
                        <div
                          key={h.id}
                          onClick={() => handleToggleHabit(h.id)}
                          className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                            isDone
                              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                              : 'bg-slate-950/80 border-slate-800 hover:border-blue-700 text-slate-300'
                          }`}
                        >
                          <span className="font-semibold truncate">{h.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                            {isDone ? 'Checked' : 'Tap to Check'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onSelectTab) onSelectTab('habits');
                    onClose();
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-xs py-2 rounded-xl border border-blue-900/80 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Manage Daily Habits</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 5. GOALS PROGRESS */}
              <div className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-blue-900/80 pb-2.5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>5. Goals & Milestones</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">Monthly Audit</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Goal 1 */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-200">Planner Task Target</span>
                      <span className="text-amber-300">{todayTaskScore}% / 85%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (todayTaskScore / 85) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Goal 2 */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-200">Habit Consistency Target</span>
                      <span className="text-emerald-300">{habitCompletionRate}% / 100%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${habitCompletionRate}%` }} />
                    </div>
                  </div>

                  {/* Goal 3 */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-200">Workload Threshold</span>
                      <span className="text-indigo-300">~{estimatedWorkloadHours.toFixed(1)}h / 4.0h</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (estimatedWorkloadHours / 4.0) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-blue-900/60 text-[11px] text-slate-300 font-medium">
                  💡 <span className="font-bold text-amber-300">Milestone Tip:</span> Maintain habit checks to achieve your 7-day consistency badge.
                </div>
              </div>

              {/* 6. RISK ALERTS */}
              <div className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-blue-900/80 pb-2.5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>6. Risk Alerts ({riskAlerts.length})</span>
                  </h3>
                  <span className="text-[10px] font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
                    Active Watch
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {riskAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        alert.type === 'danger'
                          ? 'bg-rose-950/40 border-rose-800/60 text-rose-100'
                          : alert.type === 'warning'
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-100'
                          : alert.type === 'info'
                          ? 'bg-blue-950/40 border-blue-800/60 text-blue-100'
                          : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{alert.title}</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed font-medium">{alert.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSendMessage('Audit risks')}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-rose-300 font-bold text-xs py-2 rounded-xl border border-rose-900/80 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Request Full AI Risk Audit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 7. SMART RECOMMENDATIONS */}
              <div className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-blue-900/80 pb-2.5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>7. Smart AI Recommendations</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-300">Contextual</span>
                </div>

                <div className="space-y-2.5">
                  {smartRecommendations.map((rec, idx) => (
                    <div key={idx} className="bg-slate-950/90 border border-blue-900/60 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="leading-relaxed font-medium">{rec}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveWorkspaceTab('chat')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Chat with SARTHI Coach</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 9. AI CONVERSATION AREA & 10. SUGGESTED PROMPTS */
          <div className="max-w-4xl mx-auto h-full flex flex-col space-y-4">
            {/* Conversation Header */}
            <div className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-4 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">SARTHI AI Executive Assistant</h3>
                  <p className="text-[10px] text-slate-400">Powered by Local DataService • Instant Responses</p>
                </div>
              </div>

              <button
                onClick={handleResetChat}
                className="text-xs font-bold text-slate-400 hover:text-white bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Chat</span>
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 min-h-[380px] max-h-[550px] overflow-y-auto space-y-4 p-4 bg-slate-900/60 border border-blue-900/60 rounded-2xl custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm space-y-2 shadow-lg ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                        : 'bg-slate-950 border border-blue-800/70 text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 text-[10px] opacity-80">
                      <span className="font-black tracking-wider uppercase flex items-center gap-1.5">
                        {msg.sender === 'sarthi' ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
                            <span className="text-amber-300 font-black">SARTHI AI Coach</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5 text-blue-200" />
                            <span>{user.name}</span>
                          </>
                        )}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-line font-medium leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* 10. SUGGESTED PROMPTS & INPUT BOX */}
            <div className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-4 space-y-3 shadow-lg">
              {/* Suggested Prompts Chips */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>10. Suggested Prompts</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Plan my day',
                    'Prioritize my work',
                    'Review today\'s performance',
                    'Prepare tomorrow',
                    'Audit risks',
                    'Analyze goals progress',
                  ].map((promptText) => (
                    <button
                      key={promptText}
                      onClick={() => handleSendMessage(promptText)}
                      className="text-xs font-bold text-blue-100 bg-slate-950 hover:bg-blue-600/40 border border-blue-800/80 hover:border-amber-400 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{promptText}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask SARTHI Coach about your tasks, schedule, risks, or performance..."
                  className="flex-1 bg-slate-950 border border-blue-800/80 focus:border-amber-400 text-xs sm:text-sm text-white px-4 py-3 rounded-xl outline-none placeholder:text-slate-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* QUICK TASK CREATION MODAL */}
      {showQuickTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create Quick Executive Task</span>
              </h3>
              <button
                onClick={() => setShowQuickTaskModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickTask} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Review Q3 Strategy Brief"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-white p-3 rounded-xl outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl outline-none"
                  >
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Finance">Finance</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-2 bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl hover:bg-blue-500"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
