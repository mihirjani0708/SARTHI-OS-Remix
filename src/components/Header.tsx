import React, { useState, useRef, useEffect } from 'react';
import { Flame, Sparkles, User, Bell, Check, X, ShieldAlert, Sparkles as SparklesIcon, Search } from 'lucide-react';
import { UserProfile } from '../types';
import { SarthiLogo } from './SarthiLogo';

interface HeaderProps {
  user: UserProfile;
  todayScore: number;
  onOpenCoach: () => void;
  onSelectTab: (tab: any) => void;
  activeTab: string;
  onOpenCommandPalette?: () => void;
  onOpenAlertCenter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenCoach,
  onSelectTab,
  onOpenCommandPalette,
  onOpenAlertCenter,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([
    {
      id: '1',
      title: 'Morning Executive Briefing Ready',
      desc: 'SARTHI AI synthesized your schedule & top focus areas.',
      time: 'Just now',
      type: 'ai',
      read: false,
    },
    {
      id: '2',
      title: 'Daily Habit Momentum',
      desc: 'Keep your streak alive by completing your habits today.',
      time: '1h ago',
      type: 'habit',
      read: false,
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = unreadNotifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setUnreadNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-blue-100/80 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2">
          <div
            onClick={() => onSelectTab('home')}
            className="cursor-pointer group hover:opacity-90 transition-opacity"
            title="SARTHI Home"
          >
            <SarthiLogo variant="header" size="md" />
          </div>

          {(user.uid === 'demo_user' || user.email === 'demo@sarthi.ai') && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[10px] font-extrabold rounded-full">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Demo Mode</span>
            </span>
          )}
        </div>

        {/* Right Actions: Spotlight Search, Notifications, Streak, AI Coach, Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Spotlight Command Palette Trigger */}
          <button
            onClick={() => onOpenCommandPalette && onOpenCommandPalette()}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-2.5 py-1.5 rounded-full border border-slate-200/80 transition-all cursor-pointer text-xs font-semibold"
            title="Global Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline text-[11px] font-bold text-slate-700">Search</span>
            <kbd className="hidden sm:inline-flex items-center bg-white px-1.5 py-0.2 rounded border border-slate-300 text-[9px] font-mono font-extrabold text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-full text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-all cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {unreadNotifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  ) : (
                    unreadNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setUnreadNotifications((prev) =>
                            prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                          );
                        }}
                        className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5 ${
                          !n.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white mt-0.5 ${
                            n.type === 'ai'
                              ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                              : 'bg-gradient-to-tr from-amber-500 to-orange-500'
                          }`}
                        >
                          {n.type === 'ai' ? (
                            <SparklesIcon className="w-3.5 h-3.5" />
                          ) : (
                            <Flame className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{n.title}</h4>
                            <span className="text-[9px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug mt-0.5 line-clamp-2">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      if (onOpenAlertCenter) onOpenAlertCenter();
                    }}
                    className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Open Alert Center & Engine →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Streak pill */}
          <button
            onClick={() => onSelectTab('habits')}
            className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold transition-all active:scale-95 shadow-2xs min-h-[34px] cursor-pointer"
            title="Current Habit Streak"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
            <span>{user.currentStreak}d</span>
          </button>

          {/* ✨ SARTHI AI button */}
          <button
            onClick={onOpenCoach}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs font-extrabold shadow-sm hover:shadow-md transition-all active:scale-95 min-h-[34px] cursor-pointer"
            title="SARTHI AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="font-extrabold text-[11px] sm:text-xs tracking-tight">✨ SARTHI AI</span>
          </button>

          {/* Profile Avatar with soft scale animation */}
          <button
            onClick={() => onSelectTab('profile')}
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border-2 border-blue-500 overflow-hidden shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-400 shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
            title="Profile & Settings"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
