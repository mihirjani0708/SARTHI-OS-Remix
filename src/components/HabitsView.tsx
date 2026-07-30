import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Calendar,
  BarChart3,
  Filter,
  Trash2,
  X,
  Sparkles,
  Trophy,
  Check,
  Sun,
  Moon,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Sparkle,
  Droplet,
  Activity,
  Footprints,
  HeartHandshake,
  Landmark,
  ShieldAlert,
  Smartphone,
  BookOpen,
  ArrowUpRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Habit, HabitCategory, RoutineType } from '../types';
import { getTodayDateString, getPastDateString } from '../data/initialData';
import { DynamicIcon } from './DynamicIcon';

interface HabitsViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, dateStr?: string) => void;
  onAddHabit: (newHabit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [selectedRoutineFilter, setSelectedRoutineFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedRoutine, setExpandedRoutine] = useState<{ morning: boolean; evening: boolean }>({
    morning: true,
    evening: true,
  });

  // New habit form state
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitRoutine, setNewHabitRoutine] = useState<RoutineType>('morning');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('Discipline');
  const [newHabitIcon, setNewHabitIcon] = useState('Sparkles');
  const [newHabitDescription, setNewHabitDescription] = useState('');

  const todayStr = getTodayDateString();

  const categories = ['All', 'Mind', 'Body', 'Spirit', 'Discipline', 'Business'];
  const iconOptions = [
    'Sun', 'Droplet', 'Sparkles', 'Activity', 'Footprints', 'HeartHandshake',
    'Zap', 'Landmark', 'ShieldAlert', 'Smartphone', 'BookOpen', 'Moon',
    'Dumbbell', 'Coffee', 'Target', 'Smile', 'Trophy', 'Brain'
  ];

  // Helper to categorize default/custom habits into morning / evening
  const getHabitRoutine = (habit: Habit): RoutineType => {
    if (habit.routine) return habit.routine;
    // Fallback based on known names
    const eveningNames = ['no alcohol', 'no mobile browsing', 'daily journaling'];
    if (eveningNames.some((n) => habit.name.toLowerCase().includes(n))) {
      return 'evening';
    }
    return 'morning';
  };

  // Divide habits into Morning and Evening
  const morningHabits = habits.filter((h) => getHabitRoutine(h) === 'morning');
  const eveningHabits = habits.filter((h) => getHabitRoutine(h) === 'evening');

  // Filtered habits logic
  const filterHabitList = (list: Habit[]) => {
    return list.filter((h) => {
      const matchCategory = selectedCategory === 'All' || h.category === selectedCategory;
      return matchCategory;
    });
  };

  const filteredMorning = filterHabitList(morningHabits);
  const filteredEvening = filterHabitList(eveningHabits);

  // Overall Statistics calculations
  const totalHabitsCount = habits.length;
  const completedTodayCount = habits.filter((h) => h.completedDates[todayStr]).length;
  const dailyRate = totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;

  // Morning routine stats
  const morningCompletedToday = morningHabits.filter((h) => h.completedDates[todayStr]).length;
  const morningRate = morningHabits.length > 0 ? Math.round((morningCompletedToday / morningHabits.length) * 100) : 0;

  // Evening routine stats
  const eveningCompletedToday = eveningHabits.filter((h) => h.completedDates[todayStr]).length;
  const eveningRate = eveningHabits.length > 0 ? Math.round((eveningCompletedToday / eveningHabits.length) * 100) : 0;

  // Past 7 days calculation
  const past7Days = Array.from({ length: 7 }, (_, i) => getPastDateString(6 - i));
  const weeklyAvg = Math.round(
    past7Days.reduce((acc, date) => {
      const dayDone = habits.filter((h) => h.completedDates[date]).length;
      return acc + (totalHabitsCount > 0 ? (dayDone / totalHabitsCount) * 100 : 0);
    }, 0) / 7
  );

  // Past 30 days calculation
  const past30Days = Array.from({ length: 30 }, (_, i) => getPastDateString(29 - i));
  const monthlyAvg = Math.round(
    past30Days.reduce((acc, date) => {
      const dayDone = habits.filter((h) => h.completedDates[date]).length;
      return acc + (totalHabitsCount > 0 ? (dayDone / totalHabitsCount) * 100 : 0);
    }, 0) / 30
  );

  // Best overall streak across habits
  const overallBestStreak = Math.max(...habits.map((h) => h.bestStreak || h.streak || 0), 0);
  const overallCurrentStreak = Math.max(...habits.map((h) => h.streak || 0), 0);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const habit: Habit = {
      id: `custom-habit-${Date.now()}`,
      name: newHabitName.trim(),
      category: newHabitCategory,
      routine: newHabitRoutine,
      iconName: newHabitIcon,
      description: newHabitDescription.trim() || 'Custom daily discipline habit.',
      streak: 0,
      bestStreak: 0,
      completedDates: {},
      completionTimestamps: {},
      isCustom: true,
    };

    onAddHabit(habit);
    setNewHabitName('');
    setNewHabitDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 pb-28 animate-fadeIn text-slate-800">
      {/* TITLE & HEADER ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Habit Tracker
            </h2>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {totalHabitsCount} Core Disciplines
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Structured Morning & Evening Routines for High Performance
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Habit</span>
        </button>
      </div>

      {/* COMPREHENSIVE PROGRESS METRICS CARD */}
      <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <Trophy className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Habit Analytics & Metrics
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Daily, Weekly & Monthly Consistency Metrics
              </p>
            </div>
          </div>

          {/* Timeframe selector tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'daily'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily %
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'weekly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* TIMEFRAME DISPLAY VIEW */}
        {timeframe === 'daily' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-4 rounded-2xl border border-blue-100/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Today's Completion Rate
                  </span>
                  <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md">
                    {completedTodayCount}/{totalHabitsCount} Done
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{dailyRate}%</span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {dailyRate === 100
                      ? '🎉 Perfect 100% completion today!'
                      : dailyRate >= 75
                      ? '⚡ Exceptional progress! Almost complete.'
                      : '🌱 Keep building momentum.'}
                  </span>
                </div>
              </div>

              {/* Streaks mini highlight */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-200/50">
                <div className="bg-white px-3 py-2 rounded-xl border border-blue-100 shadow-2xs text-center min-w-[90px]">
                  <span className="text-[10px] font-bold text-amber-600 uppercase block">
                    Current Streak
                  </span>
                  <span className="text-sm font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    {overallCurrentStreak}d
                  </span>
                </div>

                <div className="bg-white px-3 py-2 rounded-xl border border-blue-100 shadow-2xs text-center min-w-[90px]">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase block">
                    Best Streak
                  </span>
                  <span className="text-sm font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <Trophy className="w-3.5 h-3.5 text-indigo-500" />
                    {overallBestStreak}d
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Overall Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Overall Daily Goal Completion</span>
                <span className="text-blue-600 font-extrabold">{dailyRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${Math.max(dailyRate, 4)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {timeframe === 'weekly' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">
                  7-Day Rolling Weekly Consistency
                </span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  {weeklyAvg}%{' '}
                  <span className="text-xs font-medium text-slate-500">
                    Weekly Average Progress
                  </span>
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-xs font-bold">
                📈 +5% vs Last Week
              </div>
            </div>

            {/* Weekly Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyAvg}%` }}
              />
            </div>

            {/* 7 Day Breakdown Chart */}
            <div className="grid grid-cols-7 gap-1.5 pt-2">
              {past7Days.map((dateStr, idx) => {
                const dayDone = habits.filter((h) => h.completedDates[dateStr]).length;
                const pct = totalHabitsCount > 0 ? Math.round((dayDone / totalHabitsCount) * 100) : 0;
                const dateObj = new Date(dateStr + 'T00:00:00');
                const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                const isToday = dateStr === todayStr;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className="w-full bg-slate-50 h-20 rounded-xl flex items-end p-1 border border-slate-200/80 relative">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${
                          isToday ? 'bg-amber-400' : 'bg-blue-600'
                        }`}
                        style={{ height: `${Math.max(pct, 10)}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold ${
                        isToday ? 'text-blue-700' : 'text-slate-500'
                      }`}
                    >
                      {dayLabel}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {timeframe === 'monthly' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 rounded-2xl flex items-center justify-between border border-indigo-800">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  30-Day Monthly Consistency Rate
                </span>
                <h4 className="text-3xl font-black text-white mt-0.5">{monthlyAvg}%</h4>
                <p className="text-xs text-indigo-200 mt-1">
                  High discipline benchmark maintained for {monthlyAvg >= 80 ? '3+ weeks' : '2+ weeks'}.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-indigo-300 block font-semibold">Active Goals</span>
                <span className="text-xl font-black text-amber-300">{totalHabitsCount} Habits</span>
              </div>
            </div>

            {/* Monthly Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>30-Day Completion Target</span>
                <span className="text-indigo-600 font-bold">{monthlyAvg}% / 100%</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${monthlyAvg}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FILTER & ROUTINE TOGGLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Routine Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedRoutineFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRoutineFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Routines ({totalHabitsCount})
          </button>
          <button
            onClick={() => setSelectedRoutineFilter('morning')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRoutineFilter === 'morning'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/50'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Morning Routine ({morningHabits.length})</span>
          </button>
          <button
            onClick={() => setSelectedRoutineFilter('evening')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRoutineFilter === 'evening'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/50'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Evening Routine ({eveningHabits.length})</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: MORNING ROUTINE */}
      {(selectedRoutineFilter === 'all' || selectedRoutineFilter === 'morning') && (
        <div className="space-y-3">
          {/* Morning Routine Section Header */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                  <Sun className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">
                      Morning Routine
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                      8 Core Habits
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Start early to build unbeatable physical energy, focus & spirit.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-amber-900 block">
                    {morningCompletedToday} of {morningHabits.length} Completed
                  </span>
                  <span className="text-[11px] font-black text-amber-700">
                    {morningRate}% Morning Rate
                  </span>
                </div>
                <button
                  onClick={() =>
                    setExpandedRoutine((prev) => ({ ...prev, morning: !prev.morning }))
                  }
                  className="p-1.5 text-amber-800 hover:bg-amber-200/60 rounded-xl transition-all"
                >
                  {expandedRoutine.morning ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Morning Routine Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-amber-200">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${morningRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Morning Habits List */}
          {expandedRoutine.morning && (
            <div className="grid grid-cols-1 gap-3">
              {filteredMorning.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
                  No morning habits match the selected category filter.
                </div>
              ) : (
                filteredMorning.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    todayStr={todayStr}
                    onToggleHabit={onToggleHabit}
                    onDeleteHabit={onDeleteHabit}
                    routineType="morning"
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: EVENING ROUTINE */}
      {(selectedRoutineFilter === 'all' || selectedRoutineFilter === 'evening') && (
        <div className="space-y-3 pt-2">
          {/* Evening Routine Section Header */}
          <div className="bg-gradient-to-r from-indigo-50 via-indigo-100/60 to-white rounded-2xl p-4 border border-indigo-200/80 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <Moon className="w-5 h-5 text-indigo-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">
                      Evening Routine
                    </h3>
                    <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-md">
                      3 Core Habits
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Unwind, reflect, eliminate digital clutter & optimize rest.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-indigo-900 block">
                    {eveningCompletedToday} of {eveningHabits.length} Completed
                  </span>
                  <span className="text-[11px] font-black text-indigo-700">
                    {eveningRate}% Evening Rate
                  </span>
                </div>
                <button
                  onClick={() =>
                    setExpandedRoutine((prev) => ({ ...prev, evening: !prev.evening }))
                  }
                  className="p-1.5 text-indigo-800 hover:bg-indigo-200/60 rounded-xl transition-all"
                >
                  {expandedRoutine.evening ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Evening Routine Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-indigo-200">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${eveningRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Evening Habits List */}
          {expandedRoutine.evening && (
            <div className="grid grid-cols-1 gap-3">
              {filteredEvening.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
                  No evening habits match the selected category filter.
                </div>
              ) : (
                filteredEvening.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    todayStr={todayStr}
                    onToggleHabit={onToggleHabit}
                    onDeleteHabit={onDeleteHabit}
                    routineType="evening"
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ADD CUSTOM HABIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 space-y-3.5 shadow-2xl border border-blue-100 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">
                  Add Custom Habit
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Read 20 Pages of Business Strategy"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none min-h-[42px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Routine Section
                  </label>
                  <select
                    value={newHabitRoutine}
                    onChange={(e) => setNewHabitRoutine(e.target.value as RoutineType)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white min-h-[42px]"
                  >
                    <option value="morning">🌅 Morning Routine</option>
                    <option value="evening">🌙 Evening Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value as HabitCategory)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white min-h-[42px]"
                  >
                    <option value="Mind">Mind</option>
                    <option value="Body">Body</option>
                    <option value="Spirit">Spirit</option>
                    <option value="Discipline">Discipline</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Icon
                  </label>
                  <select
                    value={newHabitIcon}
                    onChange={(e) => setNewHabitIcon(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white min-h-[42px]"
                  >
                    {iconOptions.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preview Icon
                  </label>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-blue-600 min-h-[42px]">
                    <DynamicIcon name={newHabitIcon} size={20} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Intention
                </label>
                <input
                  type="text"
                  placeholder="Why is this habit vital for your daily goals?"
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none min-h-[42px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md cursor-pointer transition-all min-h-[44px]"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// SUBCOMPONENT: HABIT CARD
interface HabitCardProps {
  habit: Habit;
  todayStr: string;
  onToggleHabit: (habitId: string, dateStr?: string) => void;
  onDeleteHabit: (habitId: string) => void;
  routineType: RoutineType;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  todayStr,
  onToggleHabit,
  onDeleteHabit,
  routineType,
}) => {
  const isDoneToday = habit.completedDates[todayStr] || false;
  const todayTimestamp = habit.completionTimestamps ? habit.completionTimestamps[todayStr] : undefined;

  // Calculate 7-day individual completion rate for progress bar
  const past7Days = Array.from({ length: 7 }, (_, i) => getPastDateString(6 - i));
  const completedCount7Days = past7Days.filter((d) => habit.completedDates[d]).length;
  const individualProgressPct = Math.round((completedCount7Days / 7) * 100);

  const bestStreakVal = habit.bestStreak ?? Math.max(habit.streak, 14);

  return (
    <div
      className={`bg-white rounded-2xl p-4 border transition-all duration-200 ${
        isDoneToday
          ? 'border-blue-200 shadow-2xs bg-gradient-to-r from-blue-50/40 via-white to-white'
          : 'border-slate-200/90 hover:border-blue-300 shadow-2xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side Details */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Custom Checkbox Button */}
          <button
            onClick={() => onToggleHabit(habit.id)}
            className={`mt-0.5 p-2 rounded-2xl shrink-0 transition-all cursor-pointer ${
              isDoneToday
                ? 'bg-blue-600 text-white shadow-xs scale-105 ring-2 ring-blue-300'
                : 'bg-slate-50 text-slate-400 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
            }`}
            title={isDoneToday ? 'Mark as incomplete' : 'Mark as completed'}
          >
            {isDoneToday ? (
              <Check className="w-5 h-5 stroke-[3]" />
            ) : (
              <DynamicIcon name={habit.iconName} size={20} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                onClick={() => onToggleHabit(habit.id)}
                className={`text-sm font-black cursor-pointer tracking-tight transition-colors ${
                  isDoneToday ? 'line-through text-slate-400' : 'text-slate-900 hover:text-blue-600'
                }`}
              >
                {habit.name}
              </h4>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {habit.category}
              </span>

              {/* Routine pill badge */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  routineType === 'morning'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200/80'
                }`}
              >
                {routineType === 'morning' ? (
                  <>
                    <Sun className="w-3 h-3 text-amber-600" /> Morning
                  </>
                ) : (
                  <>
                    <Moon className="w-3 h-3 text-indigo-600" /> Evening
                  </>
                )}
              </span>
            </div>

            {habit.description && (
              <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-2 font-medium">
                {habit.description}
              </p>
            )}

            {/* Saved Completion Date & Time display */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isDoneToday ? (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Completed Today at{' '}
                    <span className="text-slate-900">{todayTimestamp || '07:30 AM'}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pending today</span>
                </div>
              )}

              {/* Streaks (Current Streak & Best Streak) */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50/80 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{habit.streak}d Current Streak</span>
                </span>

                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-lg border border-indigo-200 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{bestStreakVal}d Best Streak</span>
                </span>
              </div>
            </div>

            {/* Individual Habit 7-Day Consistency Progress Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>7-Day Consistency</span>
                  <span className="text-blue-600 font-extrabold">{individualProgressPct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${individualProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Past 5-day mini clickable status dots */}
              <div className="flex items-center gap-1 shrink-0">
                {[4, 3, 2, 1, 0].map((daysAgo) => {
                  const dateStr = getPastDateString(daysAgo);
                  const isDone = habit.completedDates[dateStr];
                  const timestamp = habit.completionTimestamps ? habit.completionTimestamps[dateStr] : undefined;
                  const dayObj = new Date(dateStr + 'T00:00:00');
                  const dayLetter = dayObj.toLocaleDateString('en-US', { weekday: 'narrow' });

                  return (
                    <button
                      key={daysAgo}
                      onClick={() => onToggleHabit(habit.id, dateStr)}
                      className={`w-5 h-5 rounded-md flex flex-col items-center justify-center text-[9px] font-bold cursor-pointer transition-all ${
                        isDone
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 hover:border-blue-400'
                      }`}
                      title={`${dateStr}: ${isDone ? `Completed at ${timestamp || 'saved time'}` : 'Click to toggle'}`}
                    >
                      {dayLetter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Toggle / Delete Button */}
        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={() => onToggleHabit(habit.id)}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDoneToday
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md'
            }`}
          >
            {isDoneToday ? (
              <>
                <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>Mark Done</span>
              </>
            )}
          </button>

          {habit.isCustom && (
            <button
              onClick={() => onDeleteHabit(habit.id)}
              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="Delete Custom Habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
