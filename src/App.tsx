import React, { useState, useEffect } from 'react';
import { NavTab, Habit, Task, Meeting, Note, JournalEntry } from './types';
import { UserProvider, useUser } from './context/UserContext';
import { MOTIVATIONAL_QUOTES, getTodayDateString } from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { HabitsView } from './components/HabitsView';
import { PlannerView } from './components/PlannerView';
import { GoalsView } from './components/GoalsView';
import { JournalView } from './components/JournalView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginView } from './components/LoginView';
import { SarthiCoachPanel } from './components/SarthiCoachPanel';
import { CommandPalette } from './components/CommandPalette';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingView } from './components/OnboardingView';
import { Smartphone, Monitor } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isCoachOpen, setIsCoachOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Global Ctrl+K / Cmd+K listener for Command Palette Spotlight
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // App Data & Central User from UserContext
  const {
    currentUser,
    updateProfile,
    tasks,
    setTasks,
    habits,
    setHabits,
    meetings,
    setMeetings,
    notes,
    setNotes,
    journal,
    setJournal,
    goals,
    resetUserData,
    isAuthenticated,
    completeOnboarding,
  } = useUser();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} durationMs={2400} />;
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  if (currentUser?.needsOnboarding) {
    return (
      <OnboardingView
        userName={currentUser.name}
        onComplete={(profileIds) => completeOnboarding(profileIds)}
      />
    );
  }

  const todayStr = getTodayDateString();

  // Toggle habit handler
  const handleToggleHabit = (habitId: string, dateStr: string = todayStr) => {
    const nowTimeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const currentVal = !!h.completedDates[dateStr];
          const isCompleting = !currentVal;
          const updatedDates = { ...h.completedDates, [dateStr]: isCompleting };

          const updatedTimestamps = { ...(h.completionTimestamps || {}) };
          if (isCompleting) {
            updatedTimestamps[dateStr] = nowTimeStr;
          } else {
            delete updatedTimestamps[dateStr];
          }

          // Recalculate streak & best streak
          let newStreak = h.streak;
          if (dateStr === todayStr) {
            newStreak = isCompleting ? h.streak + 1 : Math.max(0, h.streak - 1);
          }
          const currentBest = h.bestStreak ?? h.streak;
          const newBestStreak = Math.max(currentBest, newStreak);

          return {
            ...h,
            completedDates: updatedDates,
            completionTimestamps: updatedTimestamps,
            streak: newStreak,
            bestStreak: newBestStreak,
          };
        }
        return h;
      })
    );

    // Increment overall habits completed count in user profile
    updateProfile({
      totalHabitsCompleted: currentUser.totalHabitsCompleted + 1,
    });
  };

  // Add new habit
  const handleAddHabit = (newHabit: Habit) => {
    setHabits((prev) => [newHabit, ...prev]);
  };

  // Delete custom habit
  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  // Tasks handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Meetings handlers
  const handleAddMeeting = (newMeeting: Meeting) => {
    setMeetings((prev) => [newMeeting, ...prev]);
  };

  const handleToggleMeeting = (meetingId: string) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, completed: !m.completed } : m))
    );
  };

  // Notes handlers
  const handleAddNote = (newNote: Note) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Save Journal entry
  const handleSaveJournal = (entry: JournalEntry) => {
    setJournal((prev) => ({
      ...prev,
      [entry.date]: entry,
    }));
  };

  // Habit metrics calculation
  const completedHabitsToday = habits.filter((h) => h.completedDates[todayStr]).length;
  const totalHabits = habits.length;
  const incompleteHabitCount = totalHabits - completedHabitsToday;

  // Pending tasks calculation
  const pendingTaskCount = tasks.filter(
    (t) => t.dueDate === todayStr && t.status !== 'completed'
  ).length;

  const todayScore = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 font-sans flex flex-col items-center">
      {/* Top Device / Layout Frame Bar for Web Desktop toggle */}
      <div className="w-full bg-slate-900 text-slate-300 px-4 py-1.5 text-[11px] flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide uppercase">SARTHI OS</span>
          <span className="hidden sm:inline text-slate-400">| Life & Business Operating System</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden sm:inline">Theme: Royal Blue & White</span>
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-md transition-all font-semibold"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span>Responsive View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Mobile Shell</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md my-2 sm:my-4 rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-slate-900 bg-slate-50 min-h-[840px] flex flex-col'
            : 'max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl my-0 sm:my-3 sm:rounded-3xl bg-slate-50 shadow-xl border-0 sm:border border-slate-200 min-h-screen sm:min-h-[90vh] flex flex-col'
        }`}
      >
        {/* App Header */}
        <Header
          user={currentUser}
          todayScore={todayScore}
          onOpenCoach={() => setIsCoachOpen(true)}
          onSelectTab={setActiveTab}
          activeTab={activeTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 px-3.5 sm:px-5 py-3 sm:py-4 overflow-y-auto pb-28 sm:pb-24">
          {activeTab === 'home' && (
            <DashboardView
              user={currentUser}
              habits={habits}
              tasks={tasks}
              meetings={meetings}
              quotes={MOTIVATIONAL_QUOTES}
              onToggleHabit={handleToggleHabit}
              onToggleTask={handleToggleTask}
              onToggleMeeting={handleToggleMeeting}
              onAddTask={handleAddTask}
              onNavigateTab={setActiveTab}
              onOpenCoach={() => setIsCoachOpen(true)}
              onQuickAddTask={() => setActiveTab('planner')}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsView
              habits={habits}
              onToggleHabit={handleToggleHabit}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerView
              tasks={tasks}
              meetings={meetings}
              notes={notes}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onAddMeeting={handleAddMeeting}
              onToggleMeeting={handleToggleMeeting}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'goals' && <GoalsView />}

          {activeTab === 'journal' && (
            <JournalView
              journalEntries={journal}
              onSaveJournal={handleSaveJournal}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              user={currentUser}
              habits={habits}
              tasks={tasks}
              journalEntries={journal}
              onUpdateProfile={(updated) => updateProfile(updated)}
              onResetData={resetUserData}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'admin' && <AdminDashboard />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          incompleteHabitCount={incompleteHabitCount}
          pendingTaskCount={pendingTaskCount}
          activeGoalCount={goals?.length || 0}
        />
      </div>

      {/* Full-Screen SARTHI Executive AI Workspace */}
      <SarthiCoachPanel
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        user={currentUser}
        tasks={tasks}
        meetings={meetings}
        habits={habits}
        onSelectTab={setActiveTab}
      />

      {/* Spotlight Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        userId={(currentUser as any).id || currentUser.uid || 'mansi'}
        onSelectTab={setActiveTab}
        onOpenCoach={() => setIsCoachOpen(true)}
        onToggleFrame={() => setIsMobileFrame((prev) => !prev)}
      />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
