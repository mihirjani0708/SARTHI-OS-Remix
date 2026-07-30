import React, { useState, useEffect, useRef } from 'react';
import { PhoneInput } from './PhoneInput';
import { SarthiLogo } from './SarthiLogo';
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  BellOff,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Download,
  Bot,
  Zap,
  Brain,
  Sparkles,
  Send,
  RefreshCw,
  Upload,
  Check,
  LogOut,
} from 'lucide-react';
import { UserProfile, AICoachMessage, Habit, Task, JournalEntry, NavTab } from '../types';
import { getTodayDateString } from '../data/initialData';
import { useUser } from '../context/UserContext';
import { adminService } from '../services/admin/adminService';

interface ProfileViewProps {
  user: UserProfile;
  habits: Habit[];
  tasks: Task[];
  journalEntries: Record<string, JournalEntry>;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onResetData: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
];

export function getSmartExecutiveTitle(profileTypes?: string[], role?: string): string {
  const types =
    profileTypes && profileTypes.length > 0
      ? profileTypes
      : role
      ? role.split('&').map((s) => s.trim())
      : [];

  const has = (t: string) => types.some((x) => x.toLowerCase().includes(t.toLowerCase()));

  let title = '';

  if (has('Working Professional') && has('Manager')) title = 'Operations Manager';
  else if (has('Working Professional') && has('Business Owner')) title = 'Retail Operations Leader';
  else if (has('Business Owner') && has('Entrepreneur')) title = 'Entrepreneur & Business Owner';
  else if (has('IT Professional') && has('Entrepreneur')) title = 'Tech Entrepreneur';
  else if (has('Teacher') && has('Homemaker')) title = 'Educator & Home Manager';
  else if (has('Student') && has('Freelancer')) title = 'Student Creator';
  else if ((has('Doctor') || has('Healthcare')) && has('Business Owner')) title = 'Healthcare Entrepreneur';
  else if (has('Manager') && has('Business Owner')) title = 'Business Leader';
  else if (has('Sales') && has('Business Owner')) title = 'Sales & Business Leader';
  else if (has('Working Professional') && has('IT Professional')) title = 'Senior Tech Professional';
  else if (has('Healthcare') && has('Working Professional')) title = 'Healthcare Specialist';
  else if (has('Freelancer') && has('Business Owner')) title = 'Independent Venture Leader';
  else if (has('Manager') && has('Working Professional')) title = 'Corporate Operations Lead';
  else if (has('IT Professional') && has('Manager')) title = 'IT Management Lead';
  else if (has('Student') && has('Working Professional')) title = 'Executive Scholar';
  else if (types.length === 1) {
    const single = types[0];
    if (single.toLowerCase().includes('working professional')) title = 'Professional';
    else if (single.toLowerCase().includes('business owner')) title = 'Business Owner';
    else if (single.toLowerCase().includes('student')) title = 'Student';
    else if (single.toLowerCase().includes('it professional')) title = 'Tech Specialist';
    else if (single.toLowerCase().includes('entrepreneur')) title = 'Venture Founder';
    else if (single.toLowerCase().includes('teacher')) title = 'Educator';
    else if (single.toLowerCase().includes('healthcare') || single.toLowerCase().includes('doctor')) title = 'Healthcare Specialist';
    else if (single.toLowerCase().includes('freelancer')) title = 'Independent Creator';
    else if (single.toLowerCase().includes('manager')) title = 'Operations Manager';
    else if (single.toLowerCase().includes('homemaker')) title = 'Home Executive';
    else title = single;
  } else if (role && role.trim().length > 0 && !role.includes('&')) {
    title = role.trim();
  } else if (types.length > 0) {
    title = types.join(' & ');
  } else {
    title = 'Executive Leader';
  }

  if (title.length > 35) {
    title = title.substring(0, 32) + '...';
  }

  return title;
}

export function getSmartExecutiveSubtitle(profileTypes?: string[], role?: string): string {
  const types =
    profileTypes && profileTypes.length > 0
      ? profileTypes
      : role
      ? role.split('&').map((s) => s.trim())
      : [];

  const has = (t: string) => types.some((x) => x.toLowerCase().includes(t.toLowerCase()));

  if (has('Entrepreneur') || has('Business Owner')) return 'Turning Goals into Reality';
  if (has('Student') || has('Teacher')) return 'Building Better Every Day';
  if (has('IT Professional') || has('Manager')) return 'Discipline Creates Success';
  if (has('Freelancer')) return 'Focused on Growth';
  if (has('Working Professional')) return 'Leading with Purpose';
  return 'Creating Impact Every Day';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  habits,
  tasks,
  journalEntries,
  onUpdateProfile,
  onResetData,
  onNavigateTab,
}) => {
  const { logout } = useUser();
  const todayStr = getTodayDateString();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable Form States
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(user.theme || 'light');
  const [language, setLanguage] = useState<'english' | 'gujarati' | 'hindi'>(user.language || 'english');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    user.notificationsEnabled ?? true
  );

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Coach state
  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: 'init-1',
      sender: 'sarthi',
      text: `Greetings ${user.name.split(' ')[0]}! I am SARTHI, your AI Life & Business Coach. I am analyzing your habits, daily focus tasks, and mindset entries. How can I assist your executive focus today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [promptInput, setPromptInput] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Sync state if user prop changes
  useEffect(() => {
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '+91 98765 43210');
    setAvatarUrl(user.avatarUrl || '');
    setTheme(user.theme || 'light');
    setLanguage(user.language || 'english');
    setNotificationsEnabled(user.notificationsEnabled ?? true);
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Image Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          showToast('Profile photo updated');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset local changes back to saved user prop
  const handleResetChanges = () => {
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '+91 98765 43210');
    setAvatarUrl(user.avatarUrl || '');
    setTheme(user.theme || 'light');
    setLanguage(user.language || 'english');
    setNotificationsEnabled(user.notificationsEnabled ?? true);
    showToast('Changes reset to last saved profile');
  };

  // Save changes locally and persist
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedProfile: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      phone: phone.trim() || user.phone,
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
      theme,
      language,
      notificationsEnabled,
    };

    onUpdateProfile(updatedProfile);
    showToast('Profile saved successfully!');
  };

  // Check if form has unsaved edits
  const hasUnsavedChanges =
    name !== (user.name || '') ||
    email !== (user.email || '') ||
    phone !== (user.phone || '') ||
    avatarUrl !== (user.avatarUrl || '') ||
    theme !== (user.theme || 'light') ||
    language !== (user.language || 'english') ||
    notificationsEnabled !== (user.notificationsEnabled ?? true);

  // Generate context for Gemini AI
  const getUserContext = () => {
    const todayCompletedHabits = habits
      .filter((h) => h.completedDates[todayStr])
      .map((h) => h.name);
    const todayPendingHabits = habits
      .filter((h) => !h.completedDates[todayStr])
      .map((h) => h.name);
    const todayTasksSummary = tasks.map((t) => `${t.title} [${t.priority} priority - ${t.status}]`);
    const todayJournal = journalEntries[todayStr] || null;

    return {
      user: name,
      streak: user.currentStreak,
      completedHabitsToday: todayCompletedHabits,
      pendingHabitsToday: todayPendingHabits,
      tasksToday: todayTasksSummary,
      journalToday: todayJournal,
    };
  };

  const handleSendPrompt = async (
    customPrompt?: string,
    mode: 'daily_review' | 'habit_advice' | 'planner_boost' | 'chat' = 'chat'
  ) => {
    const queryText = customPrompt || promptInput.trim();
    if (!queryText && mode === 'chat') return;

    const userMsg: AICoachMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText || (mode === 'daily_review' ? "Generate today's executive review" : "Give me strategic advice"),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setIsLoadingAI(true);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          userContext: getUserContext(),
          mode,
        }),
      });

      const data = await response.json();

      const aiMsg: AICoachMessage = {
        id: `ai-${Date.now()}`,
        sender: 'sarthi',
        text: data.reply || data.error || `Stay focused on your highest priority targets today, ${name.split(' ')[0]}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      console.error('Error contacting AI coach', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'sarthi',
          text: 'Unable to connect to SARTHI AI server. Please check your network or API Key settings.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleExportData = () => {
    const exportObj = {
      user: {
        ...user,
        name,
        email,
        phone,
        avatarUrl,
        theme,
        language,
        notificationsEnabled,
      },
      habits,
      tasks,
      journalEntries,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SARTHI_Backup_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const executiveTitle = getSmartExecutiveTitle(user.profileTypes, user.role);
  const executiveSubtitle = getSmartExecutiveSubtitle(user.profileTypes, user.role);

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    const firstName = (name || user.name || 'Friend').trim().split(' ')[0];
    if (hour < 12) return `Good Morning, ${firstName} ☀️`;
    if (hour < 17) return `Good Afternoon, ${firstName} 🌤️`;
    return `Good Evening, ${firstName} 🌙`;
  };

  const isProfileComplete = Boolean(
    (name || user.name) && (email || user.email) && (phone || user.phone)
  );

  return (
    <div className="space-y-4 sm:space-y-5 pb-32 sm:pb-28 animate-fadeIn">
      {/* Dynamic Greeting Above Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{getDynamicGreeting()}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Executive Profile & OS Control Center
          </p>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-blue-500/30 flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Avatar Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Profile Overview Header Card — Executive Edition */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4.5 sm:p-6 border border-slate-700/80 shadow-xl relative overflow-hidden">
        {/* Ambient Subtle Glow Overlay */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 sm:gap-5 relative z-10">
          <div className="relative group shrink-0">
            <img
              src={avatarUrl || user.avatarUrl}
              alt={name}
              className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-lg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-xl border-2 border-slate-900 shadow-md transition-all active:scale-95 cursor-pointer"
              title="Change Photo"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight truncate">
                {name || user.name || 'User Profile'}
              </h2>
              {isProfileComplete ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Profile
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Complete Profile
                </span>
              )}
            </div>

            {/* Smart AI Executive Professional Title */}
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-extrabold px-2.5 py-0.5 rounded-lg border border-blue-400/30 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-[260px]">{executiveTitle}</span>
              </span>
            </div>

            {/* AI Motivational Subtitle (No email/phone in header) */}
            <div className="text-[11px] sm:text-xs text-slate-300 font-medium mt-2 flex items-center gap-2 flex-wrap leading-snug">
              <span className="text-amber-300 font-semibold italic">"{executiveSubtitle}"</span>
              {user.location && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{user.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Key Performance Badges */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700/60 text-center relative z-10">
          <div className="bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/60">
            <span className="block text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Current Streak
            </span>
            <p className="text-sm sm:text-base font-black text-amber-300 mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {user.currentStreak}d
            </p>
          </div>

          <div className="bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/60">
            <span className="block text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Best Streak
            </span>
            <p className="text-sm sm:text-base font-black text-blue-300 mt-0.5">
              🏆 {user.bestStreak}d
            </p>
          </div>

          <div className="bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/60">
            <span className="block text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Completed
            </span>
            <p className="text-sm sm:text-base font-black text-indigo-300 mt-0.5">
              ⚡ {user.totalHabitsCompleted}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Personal Information
              </h3>
              <p className="text-[11px] text-slate-500">Update your account details and contact info</p>
            </div>
          </div>
        </div>

        {/* Profile Photo Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl || user.avatarUrl}
              alt={name}
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Profile Photo</span>
              <span className="text-[11px] text-slate-400">JPG, PNG or Data URL (max 5MB)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer min-h-[38px]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>
          </div>
        </div>

        {/* Preset Photo Pickers */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500">Or choose a quick preset avatar:</span>
          <div className="flex items-center gap-2.5">
            {AVATAR_PRESETS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAvatarUrl(url);
                  showToast('Preset avatar selected');
                }}
                className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  avatarUrl === url ? 'border-blue-600 ring-2 ring-blue-400 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                {avatarUrl === url && (
                  <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 text-xs p-2.5 sm:p-3 rounded-xl font-semibold outline-none transition-all"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 text-xs p-2.5 sm:p-3 rounded-xl font-semibold outline-none transition-all"
            />
          </div>

          {/* Mobile Number Field */}
          <PhoneInput
            value={phone}
            onChange={(fullNum) => setPhone(fullNum)}
            theme="light"
            label="Mobile Number"
            className="sm:col-span-2"
          />
        </div>
      </div>

      {/* SECTION 2: SETTINGS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                App Preferences & Settings
              </h3>
              <p className="text-[11px] text-slate-500">Configure theme, language, and alert options</p>
            </div>
          </div>
        </div>

        {/* Theme Setting */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Theme Mode</span>
            <span className="text-[10px] text-slate-400 font-normal">Active: {theme.toUpperCase()}</span>
          </label>

          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Language Setting */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Preferred Language</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setLanguage('english')}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                language === 'english'
                  ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>English</span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('gujarati')}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                language === 'gujarati'
                  ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>ગુજરાતી</span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('hindi')}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                language === 'hindi'
                  ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>हिंदी</span>
            </button>
          </div>
        </div>

        {/* Notifications Switch */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 pt-2">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className={`p-2 rounded-xl ${notificationsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">System Notifications</span>
              <span className="text-[10px] text-slate-500 font-medium">Daily habit triggers and reminder alerts</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              showToast(`Notifications turned ${!notificationsEnabled ? 'ON' : 'OFF'}`);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
              notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SECTION 3: ACTIONS (SAVE & RESET) */}
      <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-white">Save Changes</h4>
            <p className="text-[11px] text-slate-400">All modifications save locally and restore after refresh.</p>
          </div>

          {hasUnsavedChanges && (
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              Unsaved Edits
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>Save Profile</span>
          </button>

          <button
            type="button"
            onClick={handleResetChanges}
            disabled={!hasUnsavedChanges}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-slate-300 rounded-xl font-semibold text-xs border border-white/10 transition-all cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Reset Changes</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: DATA BACKUP & SYSTEM RESET */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
          Data Management & Backup
        </h4>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleExportData}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 p-2.5 rounded-xl bg-blue-50 border border-blue-100 cursor-pointer min-h-[40px]"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all app data to defaults?')) {
                onResetData();
              }
            }}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 p-2.5 rounded-xl bg-rose-50 border border-rose-100 cursor-pointer min-h-[40px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All App Data</span>
          </button>
        </div>

        {/* Admin Control Center Launcher (Visible strictly for Admin/Owner Accounts) */}
        {adminService.isAdminUser(user) && (
          <div className="bg-[#0B132B] rounded-2xl p-4 border border-amber-500/40 space-y-2.5 mt-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <ShieldCheck className="w-4.5 h-4.5 text-amber-400" />
                <span>SARTHI Owner Control Center</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">
                Admin Privileges
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Access real-time application metrics, user telemetry, and cloud storage status.
            </p>
            <button
              onClick={() => onNavigateTab && onNavigateTab('admin')}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 hover:from-blue-600 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Launch Admin Dashboard</span>
            </button>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer mt-2"
        >
          <LogOut className="w-4 h-4 text-[#F5B50A]" />
          <span>Sign Out of SARTHI OS</span>
        </button>
      </div>

      {/* SECTION 5: SARTHI BRAND IDENTITY */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-blue-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SarthiLogo variant="full" darkBg={true} showTagline={true} />
        <div className="text-center sm:text-right text-[11px] font-semibold text-blue-200 shrink-0">
          <p className="text-white font-bold">SARTHI OS v3.1</p>
          <p className="text-[#F5B50A] font-bold mt-0.5">Your Personal Life & Business Operating System</p>
        </div>
      </div>

      {/* SARTHI AI COACH MODULE */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-blue-900 space-y-4">
        {/* AI Header */}
        <div className="flex items-center justify-between border-b border-blue-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
              <Bot className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  SARTHI AI Coach
                </h3>
                <span className="bg-blue-600/40 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Personalized Executive Life & Business Guidance
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Pills for AI Coach */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() =>
              handleSendPrompt("Provide my daily performance review based on today's metrics", 'daily_review')
            }
            disabled={isLoadingAI}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[11px] font-bold text-blue-100 transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Daily Review</span>
          </button>

          <button
            onClick={() =>
              handleSendPrompt("What is the top 80/20 habit action for my business today?", 'habit_advice')
            }
            disabled={isLoadingAI}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[11px] font-bold text-blue-100 transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer"
          >
            <Brain className="w-4 h-4 text-blue-300 shrink-0" />
            <span>Suggestions</span>
          </button>

          <button
            onClick={() =>
              handleSendPrompt(`Give me a powerful 3-sentence leadership mindset boost for ${name.split(' ')[0]}`, 'planner_boost')
            }
            disabled={isLoadingAI}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[11px] font-bold text-blue-100 transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-300 shrink-0" />
            <span>Motivation</span>
          </button>
        </div>

        {/* AI Chat History Stream */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                      : 'bg-white/10 text-blue-50 border border-white/10 backdrop-blur-md rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="block text-[9px] text-blue-300/60 mt-1.5 text-right">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoadingAI && (
            <div className="flex items-center gap-2 text-xs text-blue-300 animate-pulse p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span>SARTHI is formulating personalized executive advice...</span>
            </div>
          )}
        </div>

        {/* AI Input Form */}
        <div className="flex items-center gap-2 pt-2 border-t border-blue-800/80">
          <input
            type="text"
            placeholder="Ask SARTHI anything about habits, schedule, or strategy..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            className="flex-1 bg-white/10 border border-white/20 text-white text-xs p-3 rounded-xl placeholder-blue-300/60 outline-none focus:border-blue-400 min-h-[44px]"
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={isLoadingAI || !promptInput.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-all shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
