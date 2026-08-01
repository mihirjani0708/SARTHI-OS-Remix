import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Briefcase,
  User,
  StickyNote,
  BookOpen,
  Target,
  Bell,
  Trash2,
  Edit,
  Copy,
  X,
  Filter,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Eye,
  CalendarDays,
  ListFilter,
  Check,
  AlertCircle,
  TrendingUp,
  Flame,
  Zap,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Task, Meeting, Note, JournalEntry, Goal, Habit, Priority, TaskCategory } from '../types';
import { getTodayDateString } from '../data/initialData';

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';
type ItemType = 'task' | 'meeting' | 'habit' | 'journal' | 'note' | 'goal' | 'reminder';

interface SelectedCalendarItem {
  type: ItemType;
  id: string;
  title: string;
  date: string;
  time?: string;
  completed?: boolean;
  isOverdue?: boolean;
  raw: any;
}

export const SmartCalendar: React.FC = () => {
  const {
    tasks,
    setTasks,
    meetings,
    setMeetings,
    habits,
    setHabits,
    notes,
    setNotes,
    journal,
    setJournal,
    goals,
  } = useUser();

  const todayStr = getTodayDateString();

  // Navigation & View state
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [activeDateStr, setActiveDateStr] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all'); // all, task, meeting, habit, journal, note, goal, reminder

  // Quick jump states
  const activeDate = useMemo(() => {
    const [y, m, d] = activeDateStr.split('-').map(Number);
    return new Date(y, m - 1, d || 1);
  }, [activeDateStr]);

  const currentYear = activeDate.getFullYear();
  const currentMonth = activeDate.getMonth(); // 0-11

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<ItemType>('task');
  const [selectedItem, setSelectedItem] = useState<SelectedCalendarItem | null>(null);

  // Form states for creating new items on activeDate
  const [itemTitle, setItemTitle] = useState('');
  const [itemTime, setItemTime] = useState('10:00 AM');
  const [itemPriority, setItemPriority] = useState<Priority>('High');
  const [itemCategory, setItemCategory] = useState<TaskCategory>('Business');
  const [itemNotes, setItemNotes] = useState('');
  const [itemDuration, setItemDuration] = useState('30 mins');
  const [itemMeetingType, setItemMeetingType] = useState<'Business' | 'Client' | 'Personal' | 'Review'>('Business');
  const [itemMoodRating, setItemMoodRating] = useState<number>(5);
  const [itemGratitude, setItemGratitude] = useState('');
  const [itemDailyWins, setItemDailyWins] = useState('');
  const [itemLearnings, setItemLearnings] = useState('');
  const [itemJournalText, setItemJournalText] = useState('');

  // Date navigation helpers
  const navigateDate = (direction: 'prev' | 'next') => {
    const d = new Date(activeDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setActiveDateStr(`${y}-${m}-${day}`);
  };

  const jumpToToday = () => {
    setActiveDateStr(todayStr);
  };

  const jumpToYearMonth = (year: number, month: number) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(Math.min(activeDate.getDate(), 28)).padStart(2, '0');
    setActiveDateStr(`${y}-${m}-${d}`);
  };

  // Search & Natural Language Date Parser
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const query = val.toLowerCase().trim();

    if (!query) return;

    if (/^\d{4}-\d{2}-\d{2}$/.test(query)) {
      setActiveDateStr(query);
      return;
    }

    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    for (let i = 0; i < 12; i++) {
      if (query.includes(monthNames[i]) || query.includes(shortMonths[i])) {
        const matchNum = query.match(/\d+/);
        const day = matchNum ? parseInt(matchNum[0], 10) : 1;
        const yearMatch = query.match(/\b(20\d\d)\b/);
        const year = yearMatch ? parseInt(yearMatch[1], 10) : currentYear;
        const m = String(i + 1).padStart(2, '0');
        const dStr = String(Math.min(Math.max(day, 1), 31)).padStart(2, '0');
        setActiveDateStr(`${year}-${m}-${dStr}`);
        return;
      }
    }

    if (query === 'today') {
      jumpToToday();
    } else if (query === 'yesterday') {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const dStr = String(now.getDate()).padStart(2, '0');
      setActiveDateStr(`${y}-${m}-${dStr}`);
    } else if (query === 'tomorrow') {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const dStr = String(now.getDate()).padStart(2, '0');
      setActiveDateStr(`${y}-${m}-${dStr}`);
    } else if (query === 'next week') {
      const now = new Date();
      now.setDate(now.getDate() + 7);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const dStr = String(now.getDate()).padStart(2, '0');
      setActiveDateStr(`${y}-${m}-${dStr}`);
    }
  };

  // Build unified data list for any given date
  const getItemsForDate = (dateStr: string) => {
    let items: SelectedCalendarItem[] = [];

    // Tasks
    tasks.forEach((t) => {
      if (t.dueDate === dateStr) {
        const isOverdue = t.dueDate < todayStr && t.status !== 'completed';
        items.push({
          type: 'task',
          id: t.id,
          title: t.title,
          date: t.dueDate,
          time: t.time || '10:00 AM',
          completed: t.status === 'completed',
          isOverdue,
          raw: t,
        });
      }
    });

    // Meetings
    meetings.forEach((m) => {
      const mDate = m.date || todayStr;
      if (mDate === dateStr) {
        items.push({
          type: 'meeting',
          id: m.id,
          title: m.title,
          date: mDate,
          time: m.time || '02:00 PM',
          completed: !!m.completed,
          raw: m,
        });
      }
    });

    // Habits
    habits.forEach((h) => {
      const isCompleted = !!h.completedDates[dateStr];
      items.push({
        type: 'habit',
        id: `${h.id}-${dateStr}`,
        title: h.name,
        date: dateStr,
        time: h.completionTimestamps?.[dateStr] || (h.routine === 'morning' ? '08:00 AM' : '08:00 PM'),
        completed: isCompleted,
        raw: { ...h, activeDateStr: dateStr },
      });
    });

    // Journal Entry
    if (journal[dateStr]) {
      const j = journal[dateStr];
      items.push({
        type: 'journal',
        id: `journal-${dateStr}`,
        title: `Journal: Mood ${j.moodRating}/5 - ${j.manifestationFocus || 'Reflection'}`,
        date: dateStr,
        time: '09:00 PM',
        completed: true,
        raw: j,
      });
    }

    // Notes
    notes.forEach((n) => {
      const noteDate = n.updatedAt ? n.updatedAt.split('T')[0] : todayStr;
      if (noteDate === dateStr) {
        items.push({
          type: 'note',
          id: n.id,
          title: n.title,
          date: noteDate,
          time: '12:00 PM',
          completed: true,
          raw: n,
        });
      }
    });

    // Goals
    goals.forEach((g) => {
      if (g.targetDate === dateStr) {
        items.push({
          type: 'goal',
          id: g.id,
          title: `Goal: ${g.title}`,
          date: g.targetDate,
          time: '09:00 AM',
          completed: g.status === 'completed',
          raw: g,
        });
      }
    });

    // Filter by type if set
    if (filterType !== 'all') {
      if (filterType === 'reminder') {
        items = items.filter(
          (i) => i.type === 'task' && (i.raw.category === 'Personal' || i.raw.priority === 'High')
        );
      } else {
        items = items.filter((i) => i.type === filterType);
      }
    }

    // Filter by search query if any
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)
      );
    }

    return items;
  };

  const activeDateItems = useMemo(() => getItemsForDate(activeDateStr), [
    activeDateStr,
    tasks,
    meetings,
    habits,
    journal,
    notes,
    goals,
    filterType,
    searchQuery,
  ]);

  // Handle toggling completion of an item
  const handleToggleItem = (item: SelectedCalendarItem) => {
    if (item.type === 'task') {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === item.id
            ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' }
            : t
        )
      );
    } else if (item.type === 'meeting') {
      setMeetings((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, completed: !m.completed } : m))
      );
    } else if (item.type === 'habit') {
      const habitId = item.raw.id;
      const dateStr = item.date;
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
            return {
              ...h,
              completedDates: updatedDates,
              completionTimestamps: updatedTimestamps,
            };
          }
          return h;
        })
      );
    }
  };

  // Handle deleting an item
  const handleDeleteItem = (item: SelectedCalendarItem) => {
    if (item.type === 'task') {
      setTasks((prev) => prev.filter((t) => t.id !== item.id));
    } else if (item.type === 'meeting') {
      setMeetings((prev) => prev.filter((m) => m.id !== item.id));
    } else if (item.type === 'note') {
      setNotes((prev) => prev.filter((n) => n.id !== item.id));
    } else if (item.type === 'journal') {
      setJournal((prev) => {
        const copy = { ...prev };
        delete copy[item.date];
        return copy;
      });
    }
    setSelectedItem(null);
  };

  // Handle duplicating an item
  const handleDuplicateItem = (item: SelectedCalendarItem) => {
    if (item.type === 'task') {
      const newTask: Task = {
        ...item.raw,
        id: `task-${Date.now()}`,
        title: `${item.raw.title} (Copy)`,
      };
      setTasks((prev) => [...prev, newTask]);
    } else if (item.type === 'meeting') {
      const newMeeting: Meeting = {
        ...item.raw,
        id: `meet-${Date.now()}`,
        title: `${item.raw.title} (Copy)`,
      };
      setMeetings((prev) => [...prev, newMeeting]);
    } else if (item.type === 'note') {
      const newNote: Note = {
        ...item.raw,
        id: `note-${Date.now()}`,
        title: `${item.raw.title} (Copy)`,
        updatedAt: activeDateStr,
      };
      setNotes((prev) => [...prev, newNote]);
    }
    setSelectedItem(null);
  };

  // Handle creating new item for activeDate
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() && createType !== 'journal') return;

    if (createType === 'task' || createType === 'reminder') {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: itemTitle.trim(),
        priority: itemPriority,
        category: itemCategory,
        status: 'todo',
        dueDate: activeDateStr,
        time: itemTime,
        notes: itemNotes.trim(),
      };
      setTasks((prev) => [...prev, newTask]);
    } else if (createType === 'meeting') {
      const newMeeting: Meeting = {
        id: `meet-${Date.now()}`,
        title: itemTitle.trim(),
        time: itemTime,
        duration: itemDuration,
        type: itemMeetingType,
        locationOrLink: 'Zoom / Office',
        notes: itemNotes.trim(),
        completed: false,
        date: activeDateStr,
      };
      setMeetings((prev) => [...prev, newMeeting]);
    } else if (createType === 'habit') {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        name: itemTitle.trim(),
        category: 'Discipline',
        routine: 'morning',
        iconName: 'Sparkles',
        completedDates: { [activeDateStr]: true },
        completionTimestamps: { [activeDateStr]: itemTime },
        streak: 1,
        bestStreak: 1,
        description: itemNotes.trim(),
      };
      setHabits((prev) => [...prev, newHabit]);
    } else if (createType === 'journal') {
      const newEntry: JournalEntry = {
        date: activeDateStr,
        moodRating: itemMoodRating,
        gratitude: itemGratitude ? itemGratitude.split('\n').filter(Boolean) : ['Grateful for productivity'],
        dailyWins: itemDailyWins ? itemDailyWins.split('\n').filter(Boolean) : ['Planned my day'],
        learnings: itemLearnings || 'Continuous progress brings clarity.',
        journalText: itemJournalText || itemTitle || 'Daily journal reflection logged.',
        manifestationFocus: itemTitle || 'Executive Excellence',
      };
      setJournal((prev) => ({ ...prev, [activeDateStr]: newEntry }));
    } else if (createType === 'note') {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: itemTitle.trim(),
        content: itemNotes.trim(),
        tags: [itemCategory],
        updatedAt: activeDateStr,
      };
      setNotes((prev) => [...prev, newNote]);
    }

    setItemTitle('');
    setItemNotes('');
    setShowCreateModal(false);
  };

  // Month Grid Calculation
  const monthGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    let startDayIdx = firstDayOfMonth.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6; // Sunday = 6 in Mon-start week

    const daysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = String(prevM + 1).padStart(2, '0');
      const dStr = String(pDay).padStart(2, '0');
      days.push({
        dateStr: `${prevY}-${mStr}-${dStr}`,
        dayNum: pDay,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        dateStr: `${currentYear}-${mStr}-${dStr}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let n = 1; n <= remaining; n++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = String(nextM + 1).padStart(2, '0');
      const dStr = String(n).padStart(2, '0');
      days.push({
        dateStr: `${nextY}-${mStr}-${dStr}`,
        dayNum: n,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Week Grid Calculation
  const weekGridDays = useMemo(() => {
    const [y, m, d] = activeDateStr.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    let dayOfWeek = curr.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6;

    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const year = dayDate.getFullYear();
      const month = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dateNum = String(dayDate.getDate()).padStart(2, '0');
      days.push({
        dateStr: `${year}-${month}-${dateNum}`,
        dayNum: dayDate.getDate(),
        dayName: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    return days;
  }, [activeDateStr]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper for chip styling & icons according to Sprint 8.3.1 design guidelines
  const getItemChipStyle = (item: SelectedCalendarItem) => {
    if (item.isOverdue) {
      return 'bg-red-50 text-red-800 border-red-200/90 hover:bg-red-100';
    }
    switch (item.type) {
      case 'meeting':
        return 'bg-purple-50 text-purple-900 border-purple-200/80 hover:bg-purple-100';
      case 'task':
        return 'bg-sky-50 text-sky-900 border-sky-200/80 hover:bg-sky-100';
      case 'habit':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100';
      case 'journal':
        return 'bg-indigo-50 text-indigo-900 border-indigo-200/80 hover:bg-indigo-100';
      case 'goal':
        return 'bg-yellow-50 text-yellow-900 border-yellow-200/80 hover:bg-yellow-100';
      case 'reminder':
        return 'bg-amber-50 text-amber-900 border-amber-200/80 hover:bg-amber-100';
      case 'note':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
    }
  };

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case 'meeting':
        return Briefcase;
      case 'task':
        return CheckSquare;
      case 'habit':
        return Sparkles;
      case 'journal':
        return BookOpen;
      case 'goal':
        return Target;
      case 'reminder':
        return Bell;
      case 'note':
      default:
        return StickyNote;
    }
  };

  // Today Statistics for Sidebar
  const todayItems = useMemo(() => getItemsForDate(todayStr), [tasks, meetings, habits, journal, notes, goals]);
  const completedTodayCount = todayItems.filter((i) => i.completed).length;
  const todayProgressPercent = todayItems.length > 0 ? Math.round((completedTodayCount / todayItems.length) * 100) : 100;

  return (
    <div className="space-y-4 pb-24">
      {/* HEADER CONTROLS & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-sm">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight flex items-center gap-2">
                Smart Calendar & Schedule
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-full border border-blue-200">
                  v8.3.1 Premium
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Unified visual schedule across tasks, habits, planner meetings, goals & journal
              </p>
            </div>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl self-stretch sm:self-auto border border-slate-200">
            {[
              { id: 'month', label: 'Month' },
              { id: 'week', label: 'Week' },
              { id: 'day', label: 'Day' },
              { id: 'agenda', label: 'Agenda' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as CalendarViewMode)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === v.id
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* DATE NAVIGATION & DIRECT PICKERS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Previous Period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={jumpToToday}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDateStr === todayStr
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Today
            </button>

            <button
              onClick={() => navigateDate('next')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Next Period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="font-black text-slate-900 text-base sm:text-lg px-2">
              {monthNames[currentMonth]} {currentYear}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={currentMonth}
              onChange={(e) => jumpToYearMonth(currentYear, parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => jumpToYearMonth(parseInt(e.target.value, 10), currentMonth)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={activeDateStr}
              onChange={(e) => e.target.value && setActiveDateStr(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* SEARCH BAR & CATEGORY PILL FILTERS */}
        <div className="flex flex-col lg:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items or jump to date (e.g. '15 May', 'tomorrow', 'next week')..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'task', label: 'Tasks' },
              { id: 'meeting', label: 'Meetings' },
              { id: 'habit', label: 'Habits' },
              { id: 'journal', label: 'Journal' },
              { id: 'note', label: 'Notes' },
              { id: 'goal', label: 'Goals' },
              { id: 'reminder', label: 'Reminders' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  filterType === f.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT (GRID ON DESKTOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT / MAIN CALENDAR COLUMN */}
        <div className="lg:col-span-8 space-y-4">
          {/* MONTH VIEW */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="grid grid-cols-7 text-center font-extrabold text-[11px] uppercase tracking-wider text-slate-400 pb-1">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {monthGridDays.map((d, idx) => {
                  const dayItems = getItemsForDate(d.dateStr);
                  const isSelected = d.dateStr === activeDateStr;
                  const isToday = d.dateStr === todayStr;

                  const plannerCount = dayItems.filter((i) => (i.type === 'meeting' || i.type === 'task') && !i.isOverdue).length;
                  const habitCount = dayItems.filter((i) => i.type === 'habit').length;
                  const journalCount = dayItems.filter((i) => i.type === 'journal').length;
                  const reminderCount = dayItems.filter((i) => i.type === 'reminder').length;
                  const goalCount = dayItems.filter((i) => i.type === 'goal').length;
                  const overdueCount = dayItems.filter((i) => i.isOverdue).length;

                  return (
                    <div
                      key={d.dateStr + idx}
                      onClick={() => setActiveDateStr(d.dateStr)}
                      className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-2xl text-left border flex flex-col justify-between transition-all cursor-pointer group relative ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                          : isToday
                          ? 'bg-gradient-to-br from-amber-50/90 to-amber-100/40 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                          : d.isCurrentMonth
                          ? 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                          : 'bg-slate-50/40 border-transparent text-slate-300'
                      }`}
                    >
                      {/* Top Day Header */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-extrabold px-1.5 py-0.5 rounded-lg ${
                            isToday
                              ? 'bg-amber-500 text-white shadow-xs font-black'
                              : isSelected
                              ? 'text-blue-600 font-black'
                              : d.isCurrentMonth
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {d.dayNum}
                        </span>

                        {dayItems.length > 0 && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {dayItems.length}
                          </span>
                        )}
                      </div>

                      {/* COMPACT COLORED INDICATORS & NUMERIC BADGES */}
                      <div className="flex flex-wrap items-center gap-1 mt-1 overflow-hidden">
                        {overdueCount > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200"
                            title={`${overdueCount} Overdue items`}
                          >
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            <span>{overdueCount}</span>
                          </span>
                        )}

                        {plannerCount > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200"
                            title={`${plannerCount} Planner items`}
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span>{plannerCount}</span>
                          </span>
                        )}

                        {habitCount > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200"
                            title={`${habitCount} Habits`}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span>{habitCount}</span>
                          </span>
                        )}

                        {journalCount > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-200"
                            title={`${journalCount} Journal entry`}
                          >
                            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                            <span>{journalCount}</span>
                          </span>
                        )}

                        {reminderCount > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-700 border border-orange-200"
                            title={`${reminderCount} Reminders`}
                          >
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                            <span>{reminderCount}</span>
                          </span>
                        )}

                        {goalCount > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-800 border border-yellow-200"
                            title={`${goalCount} Goals`}
                          >
                            <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                            <span>{goalCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="grid grid-cols-7 gap-1.5">
                {weekGridDays.map((wd) => {
                  const dayItems = getItemsForDate(wd.dateStr);
                  const isSelected = wd.dateStr === activeDateStr;
                  const isToday = wd.dateStr === todayStr;

                  return (
                    <div
                      key={wd.dateStr}
                      onClick={() => setActiveDateStr(wd.dateStr)}
                      className={`p-2.5 rounded-2xl border text-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 shadow-xs'
                          : isToday
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-extrabold uppercase text-slate-400">
                        {wd.dayName}
                      </div>
                      <div className={`text-base font-black mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                        {wd.dayNum}
                      </div>
                      <div className="mt-2 space-y-1 text-left">
                        {dayItems.slice(0, 4).map((item, idx) => {
                          const chipStyle = getItemChipStyle(item);
                          const IconComp = getItemIcon(item.type);
                          return (
                            <div
                              key={item.id + idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                              }}
                              className={`text-[9px] font-bold truncate px-1.5 py-0.5 rounded border flex items-center gap-1 ${chipStyle}`}
                            >
                              <IconComp className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </div>
                          );
                        })}
                        {dayItems.length > 4 && (
                          <div className="text-[9px] text-blue-600 font-extrabold text-center pt-0.5">
                            +{dayItems.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DAY VIEW MODE */}
          {viewMode === 'day' && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Full Day Schedule - {new Date(activeDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-xs text-slate-500">Hour-by-hour breakdown for targeted execution</p>
                </div>
                {activeDateStr === todayStr && (
                  <span className="px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full uppercase shadow-xs">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {activeDateItems.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-semibold">No scheduled items for this date.</p>
                  </div>
                ) : (
                  activeDateItems.map((item, idx) => {
                    const chipStyle = getItemChipStyle(item);
                    const IconComp = getItemIcon(item.type);
                    return (
                      <div
                        key={item.id + idx}
                        onClick={() => setSelectedItem(item)}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${chipStyle}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <IconComp className="w-4 h-4 shrink-0" />
                          <div className="min-w-0">
                            <h4 className={`font-extrabold text-xs sm:text-sm ${item.completed ? 'line-through opacity-70' : ''}`}>
                              {item.title}
                            </h4>
                            <p className="text-[10px] opacity-75 font-semibold capitalize">
                              {item.type} {item.time ? `• ${item.time}` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleItem(item);
                          }}
                          className="p-1.5 hover:bg-white/60 rounded-lg shrink-0 cursor-pointer"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* AGENDA VIEW MODE */}
          {viewMode === 'agenda' && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Agenda Stream</h3>
                  <p className="text-xs text-slate-500">Upcoming 7-day chronological agenda</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-xl border border-blue-200">
                  7 Days Ahead
                </span>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(activeDate);
                  d.setDate(d.getDate() + i);
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(d.getDate()).padStart(2, '0');
                  const dIso = `${y}-${m}-${dayStr}`;
                  const dayItems = getItemsForDate(dIso);
                  const isToday = dIso === todayStr;

                  return (
                    <div key={dIso} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                            isToday ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          {isToday && <span className="text-[10px] font-extrabold text-amber-600 uppercase">Today</span>}
                        </div>
                        <span className="text-xs text-slate-400 font-bold">{dayItems.length} items</span>
                      </div>

                      {dayItems.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic py-1">No scheduled events or tasks</div>
                      ) : (
                        <div className="space-y-1.5">
                          {dayItems.map((item, idx) => {
                            const chipStyle = getItemChipStyle(item);
                            const IconComp = getItemIcon(item.type);
                            return (
                              <div
                                key={item.id + idx}
                                onClick={() => setSelectedItem(item)}
                                className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer ${chipStyle}`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <IconComp className="w-3.5 h-3.5 shrink-0 opacity-80" />
                                  <span className={`font-bold truncate ${item.completed ? 'line-through opacity-70' : ''}`}>
                                    {item.title}
                                  </span>
                                </div>
                                {item.time && <span className="text-[10px] opacity-75 font-semibold shrink-0 ml-2">{item.time}</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIMELINE FOR SELECTED DATE */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Selected Day Timeline
                </div>
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <span>
                    {new Date(activeDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {activeDateStr === todayStr && (
                    <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-black uppercase rounded-full shadow-xs">
                      Today
                    </span>
                  )}
                </h2>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Grouped Timeline Items List */}
            {activeDateItems.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-slate-700 text-sm">No items scheduled for this date</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Tap "+ Add Item" to schedule tasks, planner meetings, habits, reminders, or journal entries.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {(() => {
                  const overdueItems = activeDateItems.filter((i) => i.isOverdue && !i.completed);
                  const completedItems = activeDateItems.filter((i) => i.completed);
                  const pendingItems = activeDateItems.filter((i) => !i.isOverdue && !i.completed);

                  const morningItems = pendingItems.filter((i) => {
                    if (!i.time) return true;
                    const t = i.time.toUpperCase();
                    if (t.includes('AM')) return true;
                    if (t.includes('PM')) {
                      const match = t.match(/(\d+):/);
                      if (match && parseInt(match[1], 10) === 12) return false;
                      return false;
                    }
                    return true;
                  });

                  const afternoonItems = pendingItems.filter((i) => {
                    if (!i.time) return false;
                    const t = i.time.toUpperCase();
                    if (t.includes('PM')) {
                      const match = t.match(/(\d+):/);
                      if (!match) return true;
                      const hour = parseInt(match[1], 10);
                      return hour === 12 || (hour >= 1 && hour < 5);
                    }
                    return false;
                  });

                  const eveningItems = pendingItems.filter((i) => {
                    if (!i.time) return false;
                    const t = i.time.toUpperCase();
                    if (t.includes('PM')) {
                      const match = t.match(/(\d+):/);
                      if (!match) return false;
                      const hour = parseInt(match[1], 10);
                      return hour >= 5 && hour !== 12;
                    }
                    return false;
                  });

                  const groups = [
                    { id: 'overdue', label: 'Overdue Items', badgeStyle: 'bg-red-500 text-white', items: overdueItems },
                    { id: 'morning', label: 'Morning', badgeStyle: 'bg-amber-100 text-amber-900 border-amber-200', items: morningItems },
                    { id: 'afternoon', label: 'Afternoon', badgeStyle: 'bg-blue-100 text-blue-900 border-blue-200', items: afternoonItems },
                    { id: 'evening', label: 'Evening', badgeStyle: 'bg-indigo-100 text-indigo-900 border-indigo-200', items: eveningItems },
                    { id: 'completed', label: 'Completed', badgeStyle: 'bg-emerald-100 text-emerald-900 border-emerald-200', items: completedItems },
                  ].filter((g) => g.items.length > 0);

                  return groups.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${group.badgeStyle}`}>
                          {group.label} ({group.items.length})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {group.items.map((item, idx) => {
                          const chipStyle = getItemChipStyle(item);
                          const IconComp = getItemIcon(item.type);

                          return (
                            <div
                              key={item.id + idx}
                              className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${chipStyle}`}
                            >
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                {(item.type === 'task' || item.type === 'meeting' || item.type === 'habit') && (
                                  <button
                                    onClick={() => handleToggleItem(item)}
                                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
                                  >
                                    {item.completed ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500" />
                                    )}
                                  </button>
                                )}

                                <IconComp className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                                      {item.type}
                                    </span>
                                    {item.time && (
                                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        {item.time}
                                      </span>
                                    )}
                                    {item.isOverdue && (
                                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-red-600 text-white rounded-full">
                                        Overdue
                                      </span>
                                    )}
                                  </div>

                                  <h4
                                    className={`font-bold text-sm text-slate-900 mt-1 ${
                                      item.completed ? 'line-through opacity-60' : ''
                                    }`}
                                  >
                                    {item.title}
                                  </h4>

                                  {item.type === 'task' && item.raw.notes && (
                                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{item.raw.notes}</p>
                                  )}
                                  {item.type === 'meeting' && item.raw.notes && (
                                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{item.raw.notes}</p>
                                  )}
                                  {item.type === 'journal' && (
                                    <p className="text-xs text-slate-700 italic line-clamp-2 mt-1">
                                      "{item.raw.journalText}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setSelectedItem(item)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {(item.type === 'task' || item.type === 'meeting' || item.type === 'note') && (
                                  <button
                                    onClick={() => handleDuplicateItem(item)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
                                    title="Duplicate"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR / TODAY'S SUMMARY & QUICK ACTIONS */}
        <div className="lg:col-span-4 space-y-4">
          {/* Today's Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 border border-slate-700 shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  Today's Snapshot
                </span>
                <h3 className="font-black text-white text-base mt-0.5">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-black rounded-xl border border-amber-400/30 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-amber-300" />
                {todayProgressPercent}% Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Completed Tasks & Habits</span>
                <span className="font-bold text-white">{completedTodayCount} / {todayItems.length}</span>
              </div>
              <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${todayProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="pt-2 border-t border-slate-700/80">
              <span className="text-xs font-extrabold text-slate-300 block mb-2">Quick Schedule Item</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'task', label: '+ Task', color: 'bg-blue-600 hover:bg-blue-500' },
                  { type: 'meeting', label: '+ Meeting', color: 'bg-purple-600 hover:bg-purple-500' },
                  { type: 'habit', label: '+ Habit', color: 'bg-emerald-600 hover:bg-emerald-500' },
                  { type: 'reminder', label: '+ Reminder', color: 'bg-amber-600 hover:bg-amber-500' },
                ].map((act) => (
                  <button
                    key={act.type}
                    onClick={() => {
                      setCreateType(act.type as ItemType);
                      setShowCreateModal(true);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold text-white text-center transition-all cursor-pointer shadow-xs ${act.color}`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events Preview */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Upcoming High Priority</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Next 48h</span>
            </div>

            <div className="space-y-2">
              {tasks
                .filter((t) => t.status !== 'completed' && t.dueDate >= todayStr)
                .slice(0, 4)
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveDateStr(t.dueDate);
                      setSelectedItem({
                        type: 'task',
                        id: t.id,
                        title: t.title,
                        date: t.dueDate,
                        time: t.time,
                        completed: false,
                        raw: t,
                      });
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-slate-800 truncate">{t.title}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">{t.dueDate} • {t.time || '10:00 AM'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                      t.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CATEGORY COLOR LEGEND */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-black text-slate-800 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Category Legend:</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            Planner / Meeting
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-900 border border-sky-200 text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Task
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Habit
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Reminder
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-yellow-50 text-yellow-900 border border-yellow-200 text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Goal
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Journal
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Note
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-50 text-red-900 border border-red-200 text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Overdue
          </span>
        </div>
      </div>

      {/* CREATE NEW ITEM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Schedule Item for {activeDateStr}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Choose the item type to schedule on this date
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'task', label: 'Task' },
                { id: 'meeting', label: 'Meeting' },
                { id: 'habit', label: 'Habit' },
                { id: 'journal', label: 'Journal' },
                { id: 'note', label: 'Note' },
                { id: 'reminder', label: 'Reminder' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCreateType(t.id as ItemType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    createType === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 pt-1">
              {createType !== 'journal' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Title</label>
                  <input
                    type="text"
                    required
                    placeholder={`Enter ${createType} title...`}
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {(createType === 'task' || createType === 'meeting' || createType === 'reminder') && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Time</label>
                    <input
                      type="text"
                      value={itemTime}
                      onChange={(e) => setItemTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {createType === 'task' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Priority</label>
                      <select
                        value={itemPriority}
                        onChange={(e) => setItemPriority(e.target.value as Priority)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  )}

                  {createType === 'meeting' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Duration</label>
                      <input
                        type="text"
                        value={itemDuration}
                        onChange={(e) => setItemDuration(e.target.value)}
                        placeholder="30 mins"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {createType === 'journal' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Mood Rating (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={itemMoodRating}
                      onChange={(e) => setItemMoodRating(parseInt(e.target.value, 10) || 5)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Journal Reflection</label>
                    <textarea
                      rows={3}
                      placeholder="Write your journal entry..."
                      value={itemJournalText}
                      onChange={(e) => setItemJournalText(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {createType !== 'journal' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Notes / Description</label>
                  <textarea
                    rows={2}
                    placeholder="Add details..."
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer mt-2"
              >
                Save & Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL & EDIT ITEM MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 font-extrabold text-[10px] uppercase rounded-full">
                {selectedItem.type}
              </span>
              <span className="text-xs font-bold text-slate-400">{selectedItem.date}</span>
            </div>

            <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
              {selectedItem.title}
            </h3>

            {selectedItem.time && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Scheduled Time: {selectedItem.time}</span>
              </div>
            )}

            {selectedItem.raw.notes && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700">
                {selectedItem.raw.notes}
              </div>
            )}

            {selectedItem.type === 'journal' && (
              <div className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-2 text-xs text-slate-700">
                <p className="font-semibold text-purple-900">
                  Mood: {selectedItem.raw.moodRating}/5
                </p>
                <p className="italic">"{selectedItem.raw.journalText}"</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              {(selectedItem.type === 'task' || selectedItem.type === 'meeting' || selectedItem.type === 'habit') && (
                <button
                  onClick={() => {
                    handleToggleItem(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                >
                  {selectedItem.completed ? 'Mark Pending' : 'Mark Completed'}
                </button>
              )}
              <button
                onClick={() => handleDeleteItem(selectedItem)}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
