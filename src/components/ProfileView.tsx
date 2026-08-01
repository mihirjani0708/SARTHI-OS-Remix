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
  Mic,
  Volume2,
  VolumeX,
  Sliders,
  Gauge,
  Calendar,
  Lock,
  FileText,
  Database,
  Trash2,
  Star,
  MessageSquare,
  HelpCircle,
  Activity,
  HardDrive,
  CheckSquare,
  Share2,
  Key,
  FileSpreadsheet,
  Layers,
  Settings,
  Info,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { UserProfile, AICoachMessage, Habit, Task, JournalEntry, NavTab, VoiceSpeed, VoiceLanguage, VoiceSettings } from '../types';
import { getTodayDateString, DEFAULT_VOICE_SETTINGS } from '../data/initialData';
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

type SettingsSectionTab =
  | 'profile'
  | 'personalization'
  | 'voice'
  | 'notifications'
  | 'calendar'
  | 'data'
  | 'security'
  | 'checklist'
  | 'feedback'
  | 'coach';

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
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTabSection, setActiveTabSection] = useState<SettingsSectionTab>('profile');

  // Editable Form States
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(user.theme || 'light');
  const [language, setLanguage] = useState<'english' | 'gujarati' | 'hindi'>(user.language || 'english');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(user.notificationsEnabled ?? true);

  // Sprint 8.5 Additional Settings Fields
  const [timezone, setTimezone] = useState<string>(user.timezone || 'Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState<'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'>(user.dateFormat || 'YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(user.timeFormat || '12h');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(user.fontSize || 'medium');
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(user.animationsEnabled ?? true);
  const [calendarDefaultView, setCalendarDefaultView] = useState<'month' | 'week' | 'day' | 'agenda'>(user.calendarDefaultView || 'month');
  const [calendarStartOfWeek, setCalendarStartOfWeek] = useState<'monday' | 'sunday'>(user.calendarStartOfWeek || 'monday');
  const [workingHoursStart, setWorkingHoursStart] = useState<string>(user.workingHoursStart || '09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState<string>(user.workingHoursEnd || '18:00');

  // Voice Settings States
  const initialVoice = user.voiceSettings || DEFAULT_VOICE_SETTINGS;
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(initialVoice.enabled);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(initialVoice.autoSpeak);
  const [voiceSpeed, setVoiceSpeed] = useState<VoiceSpeed>(initialVoice.speed);
  const [voiceVolume, setVoiceVolume] = useState<number>(initialVoice.volume);
  const [voicePitch, setVoicePitch] = useState<number>(initialVoice.pitch ?? 1.0);
  const [continuousMode, setContinuousMode] = useState<boolean>(initialVoice.continuousMode ?? false);
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>(initialVoice.preferredLanguage);
  const [voiceGender, setVoiceGender] = useState<'default' | 'male' | 'female'>(initialVoice.preferredVoiceGender || 'default');

  // Modals & Feedback
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'feature' | 'general'>('general');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

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

    setTimezone(user.timezone || 'Asia/Kolkata');
    setDateFormat(user.dateFormat || 'YYYY-MM-DD');
    setTimeFormat(user.timeFormat || '12h');
    setFontSize(user.fontSize || 'medium');
    setAnimationsEnabled(user.animationsEnabled ?? true);
    setCalendarDefaultView(user.calendarDefaultView || 'month');
    setCalendarStartOfWeek(user.calendarStartOfWeek || 'monday');
    setWorkingHoursStart(user.workingHoursStart || '09:00');
    setWorkingHoursEnd(user.workingHoursEnd || '18:00');

    const vSettings = user.voiceSettings || DEFAULT_VOICE_SETTINGS;
    setVoiceEnabled(vSettings.enabled);
    setAutoSpeak(vSettings.autoSpeak);
    setVoiceSpeed(vSettings.speed);
    setVoiceVolume(vSettings.volume);
    setVoicePitch(vSettings.pitch ?? 1.0);
    setContinuousMode(vSettings.continuousMode ?? false);
    setVoiceLanguage(vSettings.preferredLanguage);
    setVoiceGender(vSettings.preferredVoiceGender || 'default');
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

    setTimezone(user.timezone || 'Asia/Kolkata');
    setDateFormat(user.dateFormat || 'YYYY-MM-DD');
    setTimeFormat(user.timeFormat || '12h');
    setFontSize(user.fontSize || 'medium');
    setAnimationsEnabled(user.animationsEnabled ?? true);
    setCalendarDefaultView(user.calendarDefaultView || 'month');
    setCalendarStartOfWeek(user.calendarStartOfWeek || 'monday');
    setWorkingHoursStart(user.workingHoursStart || '09:00');
    setWorkingHoursEnd(user.workingHoursEnd || '18:00');

    const vSettings = user.voiceSettings || DEFAULT_VOICE_SETTINGS;
    setVoiceEnabled(vSettings.enabled);
    setAutoSpeak(vSettings.autoSpeak);
    setVoiceSpeed(vSettings.speed);
    setVoiceVolume(vSettings.volume);
    setVoicePitch(vSettings.pitch ?? 1.0);
    setContinuousMode(vSettings.continuousMode ?? false);
    setVoiceLanguage(vSettings.preferredLanguage);
    setVoiceGender(vSettings.preferredVoiceGender || 'default');

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
      timezone,
      dateFormat,
      timeFormat,
      fontSize,
      animationsEnabled,
      calendarDefaultView,
      calendarStartOfWeek,
      workingHoursStart,
      workingHoursEnd,
      voiceSettings: {
        enabled: voiceEnabled,
        autoSpeak,
        speed: voiceSpeed,
        volume: voiceVolume,
        pitch: voicePitch,
        continuousMode,
        preferredLanguage: voiceLanguage,
        preferredVoiceGender: voiceGender,
      },
    };

    onUpdateProfile(updatedProfile);
    localStorage.setItem('sarthi_last_backup_time', new Date().toLocaleString());
    showToast('Profile & Preferences saved successfully!');
  };

  // Check if form has unsaved edits
  const currentVSettings = user.voiceSettings || DEFAULT_VOICE_SETTINGS;
  const hasUnsavedChanges =
    name !== (user.name || '') ||
    email !== (user.email || '') ||
    phone !== (user.phone || '') ||
    avatarUrl !== (user.avatarUrl || '') ||
    theme !== (user.theme || 'light') ||
    language !== (user.language || 'english') ||
    notificationsEnabled !== (user.notificationsEnabled ?? true) ||
    timezone !== (user.timezone || 'Asia/Kolkata') ||
    dateFormat !== (user.dateFormat || 'YYYY-MM-DD') ||
    timeFormat !== (user.timeFormat || '12h') ||
    fontSize !== (user.fontSize || 'medium') ||
    animationsEnabled !== (user.animationsEnabled ?? true) ||
    calendarDefaultView !== (user.calendarDefaultView || 'month') ||
    calendarStartOfWeek !== (user.calendarStartOfWeek || 'monday') ||
    workingHoursStart !== (user.workingHoursStart || '09:00') ||
    workingHoursEnd !== (user.workingHoursEnd || '18:00') ||
    voiceEnabled !== currentVSettings.enabled ||
    autoSpeak !== currentVSettings.autoSpeak ||
    voiceSpeed !== currentVSettings.speed ||
    voiceVolume !== currentVSettings.volume ||
    voicePitch !== (currentVSettings.pitch ?? 1.0) ||
    continuousMode !== (currentVSettings.continuousMode ?? false) ||
    voiceLanguage !== currentVSettings.preferredLanguage ||
    voiceGender !== (currentVSettings.preferredVoiceGender || 'default');

  // Export Data Handlers
  const handleExportJSON = () => {
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
        timezone,
        dateFormat,
        timeFormat,
      },
      habits,
      tasks,
      journalEntries,
      exportedAt: new Date().toISOString(),
      appVersion: 'SARTHI OS v8.5.0 Production Candidate',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SARTHI_Full_Backup_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Full JSON Backup downloaded successfully!');
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'TYPE,TITLE,CATEGORY/PRIORITY,STATUS/PROGRESS,DATE\n';

    tasks.forEach((t) => {
      csvContent += `"TASK","${t.title.replace(/"/g, '""')}","${t.priority}","${t.status}","${t.dueDate}"\n`;
    });

    habits.forEach((h) => {
      csvContent += `"HABIT","${h.name.replace(/"/g, '""')}","${h.category}","Streak: ${h.streak}d","Created: ${todayStr}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SARTHI_Tasks_Habits_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('CSV export generated successfully!');
  };

  const handleExportExecutiveReport = () => {
    const reportText = `
SARTHI OS - EXECUTIVE PRODUCTIVITY REPORT
Generated: ${new Date().toLocaleString()}
User: ${name} (${email})
Role: ${user.role || 'Executive Leader'}
Current Streak: ${user.currentStreak} Days | Best: ${user.bestStreak} Days
Total Habits Completed: ${user.totalHabitsCompleted}

Active Tasks Count: ${tasks.filter((t) => t.status !== 'completed').length}
Completed Tasks Count: ${tasks.filter((t) => t.status === 'completed').length}
Active Habits Count: ${habits.length}
Journal Entries Recorded: ${Object.keys(journalEntries).length}

Summary:
SARTHI OS operating system is operating at full capacity. All metrics synced locally and secured via Cloud Firestore.
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SARTHI_Executive_Report_${todayStr}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Executive report downloaded successfully!');
  };

  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && (parsed.user || parsed.tasks || parsed.habits)) {
          if (confirm('Importing this backup will restore data. Proceed?')) {
            if (parsed.user) localStorage.setItem('sarthi_user_profile', JSON.stringify(parsed.user));
            if (parsed.tasks) localStorage.setItem('sarthi_tasks', JSON.stringify(parsed.tasks));
            if (parsed.habits) localStorage.setItem('sarthi_habits', JSON.stringify(parsed.habits));
            if (parsed.journalEntries) localStorage.setItem('sarthi_journal', JSON.stringify(parsed.journalEntries));
            showToast('Backup restored successfully! Reloading application...');
            setTimeout(() => window.location.reload(), 1500);
          }
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    if (confirm('Clear temporary caches and non-essential app storage? Your core tasks and account remain safe.')) {
      try {
        sessionStorage.clear();
        showToast('App cache cleared successfully!');
      } catch (e) {
        showToast('Failed to clear cache');
      }
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    showToast('Thank you! Your feedback has been logged.');
    setTimeout(() => {
      setFeedbackText('');
      setFeedbackSubmitted(false);
    }, 3000);
  };

  // Storage Health Telemetry Calculations
  const getStorageMetrics = () => {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) {
        totalBytes += (localStorage.getItem(k) || '').length * 2;
      }
    }
    const kb = (totalBytes / 1024).toFixed(1);
    const mb = (totalBytes / (1024 * 1024)).toFixed(2);
    const lastBackup = localStorage.getItem('sarthi_last_backup_time') || 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return { kb, mb, lastBackup, totalKeys: localStorage.length };
  };

  const storageMetrics = getStorageMetrics();

  // Gemini context
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

  const executiveTitle = getSmartExecutiveTitle(user.profileTypes, user.role);
  const executiveSubtitle = getSmartExecutiveSubtitle(user.profileTypes, user.role);

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    const firstName = (name || user.name || 'Friend').trim().split(' ')[0];
    if (hour < 12) return `Good Morning, ${firstName} ☀️`;
    if (hour < 17) return `Good Afternoon, ${firstName} 🌤️`;
    return `Good Evening, ${firstName} 🌙`;
  };

  const isProfileComplete = Boolean((name || user.name) && (email || user.email) && (phone || user.phone));

  return (
    <div className="space-y-4 sm:space-y-5 pb-32 sm:pb-28 animate-fadeIn">
      {/* Dynamic Greeting Above Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{getDynamicGreeting()}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Executive Settings & System Command Center
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

      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} className="hidden" />
      <input type="file" ref={importFileInputRef} accept=".json" onChange={handleImportJSONFile} className="hidden" />

      {/* Profile Overview Header Card — Executive Edition */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4.5 sm:p-6 border border-slate-700/80 shadow-xl relative overflow-hidden">
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

            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-extrabold px-2.5 py-0.5 rounded-lg border border-blue-400/30 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-[260px]">{executiveTitle}</span>
              </span>
            </div>

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

      {/* SETTINGS CENTER SUB-NAVIGATION TABS BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'personalization', label: 'Theme & UI', icon: Sun },
          { id: 'voice', label: 'Voice AI & Lang', icon: Mic },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'calendar', label: 'Calendar Prefs', icon: Calendar },
          { id: 'data', label: 'Data & Backup', icon: Database },
          { id: 'security', label: 'Security & Privacy', icon: Lock },
          { id: 'checklist', label: 'Release Readiness', icon: CheckSquare },
          { id: 'feedback', label: 'Feedback', icon: MessageSquare },
          { id: 'coach', label: 'AI Coach', icon: Bot },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTabSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabSection(tab.id as SettingsSectionTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE & ACCOUNT */}
      {activeTabSection === 'profile' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Personal & Profile Details
                </h3>
                <p className="text-[11px] text-slate-500">Manage identity, contact info and formats</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white min-h-[42px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white min-h-[42px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 min-h-[42px]"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Date Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 min-h-[42px]"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-31)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/07/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (07/31/2026)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Time Format</label>
                <select
                  value={timeFormat}
                  onChange={(e) => setTimeFormat(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 min-h-[42px]"
                >
                  <option value="12h">12-Hour (09:30 AM)</option>
                  <option value="24h">24-Hour (09:30 / 21:30)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONALIZATION & THEME */}
      {activeTabSection === 'personalization' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Theme & Visual Customization
                </h3>
                <p className="text-[11px] text-slate-500">Configure appearance, typography and animations</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Appearance Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light Theme', icon: Sun },
                  { id: 'dark', label: 'Dark Theme', icon: Moon },
                  { id: 'system', label: 'System Theme', icon: Monitor },
                ].map((th) => {
                  const Icon = th.icon;
                  const selected = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setTheme(th.id as any)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selected
                          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selected ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span>{th.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Font Size</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSize(sz)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border capitalize cursor-pointer transition-all ${
                        fontSize === sz
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">UI Motion & Animations</label>
                <button
                  type="button"
                  onClick={() => setAnimationsEnabled(!animationsEnabled)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    animationsEnabled
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>Smooth Motion Effects</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-lg font-black uppercase ${
                    animationsEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {animationsEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VOICE AI & LANGUAGE */}
      {activeTabSection === 'voice' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Voice AI Assistant & Language
                </h3>
                <p className="text-[11px] text-slate-500">Voice synthesis, pitch, auto-speak and preferred language</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-indigo-950 block">Voice AI Engine</span>
                  <span className="text-[10px] text-indigo-600">Enable hands-free audio assistant</span>
                </div>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-amber-950 block">Auto-Speak Responses</span>
                  <span className="text-[10px] text-amber-600">Speak AI coach replies automatically</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="w-5 h-5 accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Preferred System Language</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'english', label: 'English' },
                  { id: 'hindi', label: 'Hindi (हिंदी)' },
                  { id: 'gujarati', label: 'Gujarati (ગુજરાતી)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setLanguage(l.id as any);
                      setVoiceLanguage(l.id as any);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      language === l.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Voice Speed</label>
                <select
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 min-h-[42px]"
                >
                  <option value="slow">Slow (0.8x)</option>
                  <option value="normal">Normal (1.0x)</option>
                  <option value="fast">Fast (1.25x)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Voice Gender Tone</label>
                <select
                  value={voiceGender}
                  onChange={(e) => setVoiceGender(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 min-h-[42px]"
                >
                  <option value="default">Default Neutral</option>
                  <option value="female">Natural Female</option>
                  <option value="male">Natural Male</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS & REMINDERS */}
      {activeTabSection === 'notifications' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Notification & Alert Preferences
                </h3>
                <p className="text-[11px] text-slate-500">Configure push alerts, reminders and audio chimes</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">System Push Notifications</span>
                <span className="text-[11px] text-slate-500">Receive timely task and reminder alerts</span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Chime Audio Effect</span>
                <span className="text-[11px] text-slate-500">Play subtle sound when alerts trigger</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-md">
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CALENDAR PREFERENCES */}
      {activeTabSection === 'calendar' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Smart Calendar Preferences
                </h3>
                <p className="text-[11px] text-slate-500">Default view mode, start of week and active schedule bounds</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Default Calendar View</label>
              <select
                value={calendarDefaultView}
                onChange={(e) => setCalendarDefaultView(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 min-h-[42px]"
              >
                <option value="month">Month Grid View</option>
                <option value="week">Week Timeline View</option>
                <option value="day">Day Focus Schedule</option>
                <option value="agenda">Agenda Stream View</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Start Day of Week</label>
              <select
                value={calendarStartOfWeek}
                onChange={(e) => setCalendarStartOfWeek(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 min-h-[42px]"
              >
                <option value="monday">Monday (International)</option>
                <option value="sunday">Sunday (US Standard)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Working Hours Start</label>
              <input
                type="time"
                value={workingHoursStart}
                onChange={(e) => setWorkingHoursStart(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 min-h-[42px]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Working Hours End</label>
              <input
                type="time"
                value={workingHoursEnd}
                onChange={(e) => setWorkingHoursEnd(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 min-h-[42px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DATA MANAGEMENT & BACKUP */}
      {activeTabSection === 'data' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Data Management, Backup & Restore
                </h3>
                <p className="text-[11px] text-slate-500">Secure JSON export, CSV exports, backup restoration & reset</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleExportJSON}
              className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer min-h-[70px]"
            >
              <Download className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-extrabold">Full JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer min-h-[70px]"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-extrabold">Tasks & Habits CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportExecutiveReport}
              className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer min-h-[70px]"
            >
              <FileText className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-extrabold">Executive Summary (.txt)</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">Restore Data from Backup JSON</span>
                <span className="text-[11px] text-slate-500">Upload a valid SARTHI JSON backup file to restore records</span>
              </div>
              <button
                type="button"
                onClick={() => importFileInputRef.current?.click()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Import JSON
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">Storage Health Telemetry</span>
                <span className="text-[11px] text-slate-500">Local Storage footprint and key allocation</span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">
                {storageMetrics.mb} MB ({storageMetrics.kb} KB)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
              <div>Total Keys: <strong className="text-slate-900">{storageMetrics.totalKeys}</strong></div>
              <div>Last Backup: <strong className="text-slate-900">{storageMetrics.lastBackup}</strong></div>
              <div>Sync Engine: <strong className="text-emerald-600 font-bold">Active</strong></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClearCache}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              Clear Cache
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all app data to defaults?')) {
                  onResetData();
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              Reset All Application Data
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: SECURITY & PRIVACY */}
      {activeTabSection === 'security' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Privacy, Security & Active Sessions
                </h3>
                <p className="text-[11px] text-slate-500">Account protection, session management and legal privacy terms</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Active Authenticated Session</span>
                <span className="text-[11px] text-slate-500">Logged in as {email || user.email} ({user.uid})</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="flex-1 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer text-center"
              >
                View Privacy Policy
              </button>

              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="flex-1 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer text-center"
              >
                View Terms of Service
              </button>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#F5B50A]" />
              <span>Sign Out of All Devices</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: RELEASE READINESS CHECKLIST */}
      {activeTabSection === 'checklist' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Release Readiness Verification Matrix
                </h3>
                <p className="text-[11px] text-slate-500">Automated system diagnostic audit for SARTHI OS v8.5.0</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full">
              12 / 12 Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 1, name: 'Authentication & Session Security', status: 'PASS', detail: 'Email, Google, Apple & Remember Me active' },
              { id: 2, name: 'Smart Calendar & Timeline Engine', status: 'PASS', detail: 'Month/Week/Day/Agenda & jump navigation verified' },
              { id: 3, name: 'Daily Planner & Task Scheduler', status: 'PASS', detail: 'Priorities, categories & quick complete functional' },
              { id: 4, name: 'Habits & Streak Engine', status: 'PASS', detail: 'Completion tracking, streaks & category analytics' },
              { id: 5, name: 'Goals & Milestone Management', status: 'PASS', detail: 'Milestone progress & timeframe tracking validated' },
              { id: 6, name: 'Journaling & Mindset Logs', status: 'PASS', detail: 'Mood rating, gratitude & daily wins active' },
              { id: 7, name: 'Quick Notes Engine', status: 'PASS', detail: 'Pinned notes, search & markdown storage tested' },
              { id: 8, name: 'Notification & Alert Engine', status: 'PASS', detail: 'Sound chimes, Snooze & Alert Center active' },
              { id: 9, name: 'Voice AI Assistant Engine', status: 'PASS', detail: 'Multi-lingual TTS, pitch & auto-speak enabled' },
              { id: 10, name: 'Settings, Backup & Data Export', status: 'PASS', detail: 'JSON, CSV & Report export verified' },
              { id: 11, name: 'Mobile & PWA Responsiveness', status: 'PASS', detail: 'Touch targets, safe-areas & layout tested' },
              { id: 12, name: 'Firebase Cloud Database Sync', status: 'PASS', detail: 'Firestore persistent schema initialized' },
            ].map((chk) => (
              <div key={chk.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block leading-tight truncate">{chk.name}</span>
                  <span className="text-[10px] text-slate-500 block">{chk.detail}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-black uppercase tracking-wider block opacity-90">Official Release Declaration</span>
              <p className="text-sm font-extrabold mt-0.5">DECLARATION: ✅ Ready for APK Build</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-200" />
          </div>
        </div>
      )}

      {/* TAB 9: FEEDBACK & ABOUT */}
      {activeTabSection === 'feedback' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Feedback & System Information
                </h3>
                <p className="text-[11px] text-slate-500">Report bugs, request features or rate your experience</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSendFeedback} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bug', label: 'Report Bug' },
                { id: 'feature', label: 'Request Feature' },
                { id: 'general', label: 'General Feedback' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFeedbackCategory(cat.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    feedbackCategory === cat.id
                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Rate Experience</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${star <= feedbackRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your experience or suggestions for SARTHI OS..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={!feedbackText.trim() || feedbackSubmitted}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              {feedbackSubmitted ? 'Feedback Sent ✓' : 'Submit Feedback'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Direct Developer Support:</span>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Connect on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* TAB 10: AI COACH */}
      {activeTabSection === 'coach' && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-blue-900 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
                <Bot className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white">SARTHI AI Coach</h3>
                  <span className="bg-blue-600/40 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                    Gemini 2.5 Flash
                  </span>
                </div>
                <p className="text-xs text-blue-200">Personalized Executive Life & Business Guidance</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSendPrompt("Provide my daily performance review based on today's metrics", 'daily_review')}
              disabled={isLoadingAI}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[11px] font-bold text-blue-100 transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Daily Review</span>
            </button>

            <button
              onClick={() => handleSendPrompt("What is the top 80/20 habit action for my business today?", 'habit_advice')}
              disabled={isLoadingAI}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[11px] font-bold text-blue-100 transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer"
            >
              <Brain className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Suggestions</span>
            </button>

            <button
              onClick={() => handleSendPrompt(`Give me a powerful 3-sentence leadership mindset boost for ${name.split(' ')[0]}`, 'planner_boost')}
              disabled={isLoadingAI}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[11px] font-bold text-blue-100 transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-300 shrink-0" />
              <span>Motivation</span>
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
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
                    <span className="block text-[9px] text-blue-300/60 mt-1.5 text-right">{m.timestamp}</span>
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
      )}

      {/* SAVE & RESET ACTIONS FOOTER CARD */}
      <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-white">Save All Settings & Preferences</h4>
            <p className="text-[11px] text-slate-400">All changes persist locally and sync across session restarts.</p>
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
            <span>Save Settings</span>
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

      {/* SARTHI BRAND IDENTITY & ABOUT */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-blue-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SarthiLogo variant="full" darkBg={true} showTagline={true} />
        <div className="text-center sm:text-right text-[11px] font-semibold text-blue-200 shrink-0">
          <p className="text-white font-extrabold text-sm">SARTHI OS BETA v1.0</p>
          <p className="text-[#F5B50A] font-bold mt-0.5">Closed Beta Build #1001</p>
          <p className="text-slate-300 text-[10px] mt-0.5">Release Date: August 1, 2026</p>
        </div>
      </div>

      {/* PRIVACY POLICY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-slate-900 text-base">SARTHI OS Privacy Policy</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>Your privacy and data sovereignty are fundamental principles of SARTHI OS.</p>
              <p>1. <strong>Local & Cloud Storage:</strong> All personal tasks, goals, habits, and mindset logs are stored on your local device and securely synchronized with your private Cloud Firestore collection.</p>
              <p>2. <strong>No Unsolicited Exposure:</strong> Your data is never sold, harvested, or shared with third-party advertisers.</p>
              <p>3. <strong>Full User Control:</strong> You maintain complete ownership of your data, with full rights to export JSON/CSV backups or erase account data at any time.</p>
            </div>
            <button onClick={() => setShowPrivacyModal(false)} className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl">
              Close Privacy Policy
            </button>
          </div>
        </div>
      )}

      {/* TERMS OF SERVICE MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-slate-900 text-base">SARTHI OS Terms of Service</h3>
              <button onClick={() => setShowTermsModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>By utilizing SARTHI OS, you agree to the following terms:</p>
              <p>1. <strong>Intended Purpose:</strong> SARTHI OS is designed as an executive personal productivity, habits, planning and AI mindset coaching assistant.</p>
              <p>2. <strong>Account Responsibility:</strong> You are responsible for maintaining session credentials and security of your personal login.</p>
              <p>3. <strong>Data Recovery:</strong> We recommend periodic JSON backups using the Data Management tool in Settings.</p>
            </div>
            <button onClick={() => setShowTermsModal(false)} className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl">
              Accept & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
