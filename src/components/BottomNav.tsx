import React from 'react';
import { LayoutDashboard, CheckSquare, ListTodo, CalendarDays, Target, BookOpen, User } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingTaskCount?: number;
  incompleteHabitCount?: number;
  activeGoalCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingTaskCount = 0,
  incompleteHabitCount = 0,
  activeGoalCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: LayoutDashboard },
    {
      id: 'habits' as NavTab,
      label: 'Habits',
      icon: CheckSquare,
      badge: incompleteHabitCount > 0 ? incompleteHabitCount : undefined,
    },
    {
      id: 'planner' as NavTab,
      label: 'Planner',
      icon: ListTodo,
      badge: pendingTaskCount > 0 ? pendingTaskCount : undefined,
    },
    {
      id: 'goals' as NavTab,
      label: 'Goals',
      icon: Target,
      badge: activeGoalCount > 0 ? activeGoalCount : undefined,
    },
    { id: 'journal' as NavTab, label: 'Journal', icon: BookOpen },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
    {
      id: 'calendar' as NavTab,
      label: 'Calendar',
      icon: CalendarDays,
    },
  ];

  return (
    <nav className="fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-md mx-auto bg-slate-900/95 text-white backdrop-blur-xl border border-slate-800/80 rounded-3xl py-1 px-1.5 shadow-2xl shadow-blue-950/40 flex items-center justify-around pointer-events-auto ring-1 ring-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl min-h-[48px] transition-all duration-200 active:scale-95 cursor-pointer select-none group ${
                isActive
                  ? 'text-white font-bold scale-105 bg-blue-600/30 ring-1 ring-blue-500/50 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 font-medium hover:scale-102'
              }`}
            >
              {/* Active Ambient Glow Indicator */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 rounded-full shadow-md shadow-blue-500/60" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ease-out ${
                    isActive
                      ? 'stroke-[2.5px] text-blue-400 scale-115 drop-shadow-sm'
                      : 'stroke-[1.8px] text-slate-400/80 group-hover:text-slate-200 group-hover:scale-105'
                  }`}
                />
                {tab.badge && tab.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-white text-[9px] font-black px-1 py-0.2 rounded-full flex items-center justify-center border border-slate-900 ${
                      isActive ? 'bg-amber-500' : 'bg-blue-500/90'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight transition-colors duration-200 ${isActive ? 'text-blue-300 font-semibold' : 'text-slate-400/80 font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
