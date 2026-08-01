import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  X,
  Settings,
  Sparkles,
  Check,
  RotateCcw,
  Trash2,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Calendar,
  CheckSquare,
  Moon,
  Briefcase,
  Sliders
} from 'lucide-react';
import { notificationService } from '../services/notifications/notificationService';
import { Reminder, NotificationHistoryItem } from '../types';

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  isOpen,
  onClose,
  userId = 'mansi',
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'missed' | 'completed' | 'history' | 'settings'>('upcoming');

  // Reminders state from notificationService
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Settings State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00');

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, userId]);

  const refreshData = () => {
    const allRem = notificationService.getReminders(userId);
    setReminders(allRem);
    const hist = notificationService.getHistory(userId);
    setHistory(hist);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setPermissionStatus(res);
    }
  };

  const handleComplete = (id: string) => {
    notificationService.markCompleted(userId, id);
    refreshData();
  };

  const handleSnooze = (id: string, mins: number) => {
    notificationService.snoozeReminder(userId, id, mins);
    refreshData();
  };

  const handleDismiss = (id: string) => {
    notificationService.dismissReminder(userId, id);
    refreshData();
  };

  const handleClearHistory = () => {
    notificationService.clearHistory(userId);
    refreshData();
  };

  if (!isOpen) return null;

  const nowIso = new Date().toISOString();

  // Categorized Reminders
  const upcomingList = reminders.filter((r) => r.status === 'pending' || r.status === 'snoozed');
  const missedList = reminders.filter((r) => r.status === 'triggered' || (r.status === 'pending' && r.scheduledTime < nowIso));
  const completedList = reminders.filter((r) => r.status === 'completed');

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                Alert Center & Notification Engine
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Unified reminders, system alerts & notification preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PERMISSION BANNER IF NOT GRANTED */}
        {permissionStatus !== 'granted' && (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3 text-amber-800 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Enable Browser Notifications for real-time sound & alerts</span>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              Enable Now
            </button>
          </div>
        )}

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0">
          {[
            { id: 'upcoming', label: 'Upcoming', count: upcomingList.length },
            { id: 'missed', label: 'Missed / Due', count: missedList.length },
            { id: 'completed', label: 'Completed', count: completedList.length },
            { id: 'history', label: 'History', count: history.length },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          
          {/* UPCOMING TAB */}
          {activeTab === 'upcoming' && (
            <div className="space-y-3">
              {upcomingList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-extrabold text-slate-600">No upcoming alerts scheduled</p>
                  <p className="text-[11px]">All clear! You are completely caught up.</p>
                </div>
              ) : (
                upcomingList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl shadow-2xs transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded-md">
                            {item.module}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.scheduledTime).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-slate-500 leading-snug">{item.description}</p>
                        )}
                      </div>

                      {/* QUICK ACTIONS */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleComplete(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                          title="Complete"
                        >
                          <Check className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                        <button
                          onClick={() => handleSnooze(item.id, 15)}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer"
                          title="Snooze 15m"
                        >
                          Snooze
                        </button>
                        <button
                          onClick={() => handleDismiss(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MISSED TAB */}
          {activeTab === 'missed' && (
            <div className="space-y-3">
              {missedList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-xs font-extrabold text-slate-600">Zero missed alerts</p>
                  <p className="text-[11px]">Great job staying on top of your schedule!</p>
                </div>
              ) : (
                missedList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-2xl shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black uppercase rounded-md">
                            Overdue / Triggered
                          </span>
                          <span className="text-[10px] font-bold text-rose-500">
                            Due: {new Date(item.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleComplete(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl text-[10px] font-extrabold cursor-pointer"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => handleDismiss(item.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* COMPLETED TAB */}
          {activeTab === 'completed' && (
            <div className="space-y-2.5">
              {completedList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No completed alerts logged yet.
                </div>
              ) : (
                completedList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-bold text-slate-700 line-through">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.module}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-600">Notification Activity History</span>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Log</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No notification history recorded.
                </div>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800">{h.title}</div>
                      <div className="text-[10px] text-slate-400">
                        Action: <span className="font-bold text-blue-600">{h.actionTaken}</span> | {new Date(h.actionTimestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-extrabold uppercase">
                      {h.module}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-4 pt-1">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">Browser Permissions</h4>
                    <p className="text-[10px] text-slate-500">Enable OS-level desktop & PWA popups</p>
                  </div>
                  <button
                    onClick={handleRequestPermission}
                    className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {permissionStatus === 'granted' ? 'Granted ✓' : 'Request'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">Alert Chime / Sound</h4>
                    <p className="text-[10px] text-slate-500">Audio cue when reminder triggers</p>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      soundEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Working & Quiet Hours */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Quiet Hours & Schedule</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Quiet Start</label>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Quiet End</label>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
