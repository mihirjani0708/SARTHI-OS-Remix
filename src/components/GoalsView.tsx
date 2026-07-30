import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ChevronRight,
  Filter,
  Sparkles,
  Award,
  BarChart3,
  CheckSquare,
  AlertCircle,
  X,
  Check,
  Zap
} from 'lucide-react';
import { Goal, GoalCategory, GoalTimeframe, Milestone } from '../types';
import { useUser } from '../context/UserContext';
import { getTodayDateString } from '../data/initialData';
import { EmptyState } from './EmptyState';

export const GoalsView: React.FC = () => {
  const { goals, setGoals } = useUser();

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'on_hold'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalCategory>('Business');
  const [newTimeframe, setNewTimeframe] = useState<GoalTimeframe>('Q3 2026');
  const [newTargetDate, setNewTargetDate] = useState(getTodayDateString());
  const [newCurrentProgress, setNewCurrentProgress] = useState(0);
  const [newTargetProgress, setNewTargetProgress] = useState(100);
  const [newUnit, setNewUnit] = useState('%');
  const [newDescription, setNewDescription] = useState('');
  const [newMilestoneInput, setNewMilestoneInput] = useState('');
  const [newMilestones, setNewMilestones] = useState<string[]>([]);

  // Calculation Metrics
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const totalGoals = goals.length;

  const totalProgressPercentage =
    goals.length > 0
      ? Math.round(
          goals.reduce((acc, g) => {
            const pct = Math.min(100, Math.round((g.currentProgress / (g.targetProgress || 1)) * 100));
            return acc + pct;
          }, 0) / goals.length
        )
      : 0;

  // Filtered Goals
  const filteredGoals = goals.filter((g) => {
    if (activeFilter !== 'all' && g.status !== activeFilter) return false;
    if (selectedCategory !== 'All' && g.category !== selectedCategory) return false;
    return true;
  });

  // Handlers
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const createdMilestones: Milestone[] = newMilestones.map((mTitle, idx) => ({
      id: `m-${Date.now()}-${idx}`,
      title: mTitle,
      completed: false,
    }));

    const isDone = newCurrentProgress >= newTargetProgress;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      timeframe: newTimeframe,
      targetDate: newTargetDate,
      currentProgress: Number(newCurrentProgress),
      targetProgress: Number(newTargetProgress) || 100,
      unit: newUnit,
      status: isDone ? 'completed' : 'active',
      description: newDescription.trim(),
      milestones: createdMilestones,
    };

    setGoals([newGoal, ...goals]);
    resetForm();
    setShowAddModal(false);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !newTitle.trim()) return;

    const isDone = newCurrentProgress >= newTargetProgress;

    const updatedGoals = goals.map((g) => {
      if (g.id === editingGoal.id) {
        return {
          ...g,
          title: newTitle.trim(),
          category: newCategory,
          timeframe: newTimeframe,
          targetDate: newTargetDate,
          currentProgress: Number(newCurrentProgress),
          targetProgress: Number(newTargetProgress) || 100,
          unit: newUnit,
          status: isDone ? 'completed' : editingGoal.status,
          description: newDescription.trim(),
        };
      }
      return g;
    });

    setGoals(updatedGoals);
    setEditingGoal(null);
    resetForm();
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter((g) => g.id !== goalId));
    }
  };

  const handleQuickUpdateProgress = (goalId: string, increment: number) => {
    setGoals(
      goals.map((g) => {
        if (g.id === goalId) {
          const nextVal = Math.max(0, Math.min(g.targetProgress, g.currentProgress + increment));
          const isDone = nextVal >= g.targetProgress;
          return {
            ...g,
            currentProgress: nextVal,
            status: isDone ? 'completed' : g.status === 'completed' && nextVal < g.targetProgress ? 'active' : g.status,
          };
        }
        return g;
      })
    );
  };

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(
      goals.map((g) => {
        if (g.id === goalId && g.milestones) {
          const updatedMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          return {
            ...g,
            milestones: updatedMilestones,
          };
        }
        return g;
      })
    );
  };

  const handleAddMilestoneToNew = () => {
    if (!newMilestoneInput.trim()) return;
    setNewMilestones([...newMilestones, newMilestoneInput.trim()]);
    setNewMilestoneInput('');
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewTitle(goal.title);
    setNewCategory(goal.category);
    setNewTimeframe(goal.timeframe);
    setNewTargetDate(goal.targetDate);
    setNewCurrentProgress(goal.currentProgress);
    setNewTargetProgress(goal.targetProgress);
    setNewUnit(goal.unit || '%');
    setNewDescription(goal.description || '');
  };

  const resetForm = () => {
    setNewTitle('');
    setNewCategory('Business');
    setNewTimeframe('Q3 2026');
    setNewTargetDate(getTodayDateString());
    setNewCurrentProgress(0);
    setNewTargetProgress(100);
    setNewUnit('%');
    setNewDescription('');
    setNewMilestones([]);
    setNewMilestoneInput('');
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-24 px-3 sm:px-0">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Target className="w-28 h-28 text-amber-400" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-400/30 uppercase tracking-widest flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>SARTHI Goals Engine</span>
            </span>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>New Goal</span>
            </button>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Strategic Vision & Targets
            </h1>
            <p className="text-xs text-blue-200/80 font-medium">
              Track long-term milestones, quarterly OKRs & personal growth.
            </p>
          </div>

          {/* Overall Progress Summary Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-blue-900/60 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
              <p className="text-lg font-black text-amber-300">{activeGoals.length}</p>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-blue-900/60 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Done</p>
              <p className="text-lg font-black text-emerald-400">{completedGoals.length}</p>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-blue-900/60 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Avg</p>
              <p className="text-lg font-black text-blue-400">{totalProgressPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Category Navigation */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-blue-100 space-y-2.5">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {(['all', 'active', 'completed', 'on_hold'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter === 'on_hold' ? 'On Hold' : filter} ({goals.filter((g) => filter === 'all' || g.status === filter).length})
            </button>
          ))}
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
          {['All', 'Business', 'Health', 'Finance', 'Personal', 'Mindset'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Card List */}
      <div className="space-y-3.5">
        {filteredGoals.length === 0 ? (
          <EmptyState
            title="No goals found for this filter"
            description="Create strategic quarterly goals and key metrics to track high-value business & personal growth."
            actionLabel="Add Strategic Goal"
            onAction={() => {
              resetForm();
              setShowAddModal(true);
            }}
            category="goals"
          />
        ) : (
          filteredGoals.map((goal) => {
            const pct = Math.min(
              100,
              Math.round((goal.currentProgress / (goal.targetProgress || 1)) * 100)
            );
            const isCompleted = goal.status === 'completed' || pct >= 100;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all space-y-3 ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-blue-200/60">
                        {goal.category}
                      </span>
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-200/60">
                        {goal.timeframe}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : goal.status === 'on_hold'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isCompleted ? 'Completed' : goal.status === 'on_hold' ? 'On Hold' : 'Active'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug">
                      {goal.title}
                    </h3>

                    {goal.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Quick Metrics */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-700">
                      Progress: {goal.unit === '$' ? `$${goal.currentProgress.toLocaleString()}` : goal.currentProgress} / {goal.unit === '$' ? `$${goal.targetProgress.toLocaleString()}` : goal.targetProgress} {goal.unit !== '$' ? goal.unit : ''}
                    </span>
                    <span className={isCompleted ? 'text-emerald-600 font-extrabold' : 'text-blue-600'}>
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Sub-Milestones Checklist */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="bg-gray-50/80 rounded-xl p-2.5 space-y-1.5 border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center justify-between">
                      <span>Sub-Milestones</span>
                      <span>
                        {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length}
                      </span>
                    </p>
                    <div className="space-y-1">
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(goal.id, m.id)}
                          className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                            m.completed ? 'text-gray-400 line-through bg-gray-100/50' : 'text-gray-800 hover:bg-white'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              m.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {m.completed && <Check className="w-3 h-3" />}
                          </div>
                          <span className="font-medium truncate">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Target: {goal.targetDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickUpdateProgress(goal.id, 5)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px]"
                    >
                      +5%
                    </button>
                    <button
                      onClick={() => handleQuickUpdateProgress(goal.id, 10)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px]"
                    >
                      +10%
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      {(showAddModal || editingGoal) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleIn border border-blue-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                <span>{editingGoal ? 'Edit Strategic Goal' : 'Create Strategic Goal'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingGoal(null);
                  resetForm();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Expand SaaS Enterprise Revenue"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GoalCategory)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Business">Business</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Personal">Personal</option>
                    <option value="Mindset">Mindset</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Timeframe</label>
                  <select
                    value={newTimeframe}
                    onChange={(e) => setNewTimeframe(e.target.value as GoalTimeframe)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Q3 2026">Q3 2026</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Long-term">Long-term</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Progress</label>
                  <input
                    type="number"
                    value={newCurrentProgress}
                    onChange={(e) => setNewCurrentProgress(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target</label>
                  <input
                    type="number"
                    value={newTargetProgress}
                    onChange={(e) => setNewTargetProgress(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="%, $, days"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline core objectives and key results..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {!editingGoal && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Add Sub-Milestones (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMilestoneInput}
                      onChange={(e) => setNewMilestoneInput(e.target.value)}
                      placeholder="e.g. Onboard 10 enterprise clients"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 font-medium text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddMilestoneToNew}
                      className="bg-gray-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                  {newMilestones.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {newMilestones.map((m, idx) => (
                        <div key={idx} className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 flex justify-between">
                          <span>{m}</span>
                          <button
                            type="button"
                            onClick={() => setNewMilestones(newMilestones.filter((_, i) => i !== idx))}
                            className="text-rose-500 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGoal(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
