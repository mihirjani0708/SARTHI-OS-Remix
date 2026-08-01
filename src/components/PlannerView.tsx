import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  CheckSquare,
  Square,
  Clock,
  Briefcase,
  User,
  StickyNote,
  Trash2,
  Pencil,
  Copy,
  X,
  Tag,
  AlertCircle,
  Check,
  Video,
  Search
} from 'lucide-react';
import { Task, Meeting, Note, Priority, TaskCategory, NavTab } from '../types';
import { getTodayDateString } from '../data/initialData';
import { EmptyState } from './EmptyState';
import { SmartSuggestionInput } from './SmartSuggestionInput';

interface PlannerViewProps {
  tasks: Task[];
  meetings: Meeting[];
  notes: Note[];
  onAddTask: (newTask: Task) => void;
  onUpdateTask?: (updatedTask: Task) => void;
  onDuplicateTask?: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddMeeting: (newMeeting: Meeting) => void;
  onUpdateMeeting?: (updatedMeeting: Meeting) => void;
  onDuplicateMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meetingId: string) => void;
  onToggleMeeting: (meetingId: string) => void;
  onAddNote: (newNote: Note) => void;
  onUpdateNote?: (updatedNote: Note) => void;
  onDuplicateNote?: (note: Note) => void;
  onDeleteNote?: (noteId: string) => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  tasks,
  meetings,
  notes,
  onAddTask,
  onUpdateTask,
  onDuplicateTask,
  onToggleTask,
  onDeleteTask,
  onAddMeeting,
  onUpdateMeeting,
  onDuplicateMeeting,
  onDeleteMeeting,
  onToggleMeeting,
  onAddNote,
  onUpdateNote,
  onDuplicateNote,
  onDeleteNote,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'tasks' | 'meetings' | 'notes'>('daily');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Edit task state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('High');
  const [editCategory, setEditCategory] = useState<TaskCategory>('Business');
  const [editDueDate, setEditDueDate] = useState('');
  const [editTime, setEditTime] = useState('10:00 AM');
  const [editNotes, setEditNotes] = useState('');

  // Edit meeting state
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editMeetingTitle, setEditMeetingTitle] = useState('');
  const [editMeetingTime, setEditMeetingTime] = useState('02:00 PM');
  const [editMeetingDuration, setEditMeetingDuration] = useState('30 mins');
  const [editMeetingType, setEditMeetingType] = useState<string>('Business');
  const [editMeetingLink, setEditMeetingLink] = useState('');
  const [editMeetingNotes, setEditMeetingNotes] = useState('');

  // Edit note state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteTagInput, setEditNoteTagInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // New task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('High');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Business');
  const [taskDueDate, setTaskDueDate] = useState(getTodayDateString());
  const [taskTime, setTaskTime] = useState('10:00 AM');
  const [taskNotes, setTaskNotes] = useState('');

  // New meeting form
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTime, setMeetingTime] = useState('02:00 PM');
  const [meetingDuration, setMeetingDuration] = useState('30 mins');
  const [meetingType, setMeetingType] = useState<'Business' | 'Client' | 'Personal' | 'Review'>('Business');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  // New note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTagInput, setNoteTagInput] = useState('');

  const todayStr = getTodayDateString();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'completed');
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayMeetings = meetings.filter((m) => (m.date || todayStr) === todayStr);
  const tomorrowTasks = tasks.filter((t) => t.dueDate === tomorrowStr);
  const tomorrowMeetings = meetings.filter((m) => m.date === tomorrowStr);
  const upcomingTasks = tasks.filter((t) => t.dueDate > tomorrowStr);
  const upcomingMeetings = meetings.filter((m) => m.date && m.date > tomorrowStr);
  const highPriorityTasks = tasks.filter((t) => t.priority === 'High' && t.status !== 'completed');

  // Task Counts for status tabs
  const totalTasksCount = tasks.length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

  // Filter tasks by status, priority, and search
  const filteredTasks = tasks.filter((t) => {
    // Status filter
    let matchesStatus = true;
    if (filterStatus === 'Pending') {
      matchesStatus = t.status !== 'completed';
    } else if (filterStatus === 'Completed') {
      matchesStatus = t.status === 'completed';
    }

    // Priority filter
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;

    // Search query
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      (t.dueDate && t.dueDate.toLowerCase().includes(q));

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      priority: taskPriority,
      category: taskCategory,
      status: 'todo',
      dueDate: taskDueDate || todayStr,
      time: taskTime,
      notes: taskNotes.trim(),
    };

    onAddTask(newTask);
    setTaskTitle('');
    setTaskNotes('');
    setTaskDueDate(todayStr);
    setShowTaskModal(false);
  };

  const handleStartEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate || todayStr);
    setEditTime(task.time || '');
    setEditNotes(task.notes || '');
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    const updatedTask: Task = {
      ...editingTask,
      title: editTitle.trim(),
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate || todayStr,
      time: editTime.trim(),
      notes: editNotes.trim(),
    };

    if (onUpdateTask) {
      onUpdateTask(updatedTask);
    }
    setEditingTask(null);
    showToast('Task updated!');
  };

  const handleDuplicateTask = (task: Task) => {
    if (onDuplicateTask) {
      onDuplicateTask(task);
    } else {
      onAddTask({
        ...task,
        id: `task-${Date.now()}`,
        title: `${task.title} (Copy)`,
        status: 'todo',
      });
    }
    showToast('Task duplicated!');
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title: meetingTitle.trim(),
      time: meetingTime,
      duration: meetingDuration,
      type: meetingType as any,
      locationOrLink: meetingLink.trim() || 'Google Meet / Zoom',
      notes: meetingNotes.trim(),
      completed: false,
    };

    onAddMeeting(newMeeting);
    setMeetingTitle('');
    setMeetingNotes('');
    setMeetingLink('');
    setShowMeetingModal(false);
    showToast('Meeting added!');
  };

  const handleStartEditMeeting = (m: Meeting) => {
    setEditingMeeting(m);
    setEditMeetingTitle(m.title);
    setEditMeetingTime(m.time || '02:00 PM');
    setEditMeetingDuration(m.duration || '30 mins');
    setEditMeetingType(m.type || 'Business');
    setEditMeetingLink(m.locationOrLink || '');
    setEditMeetingNotes(m.notes || '');
  };

  const handleSaveEditMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting || !editMeetingTitle.trim()) return;

    const updated: Meeting = {
      ...editingMeeting,
      title: editMeetingTitle.trim(),
      time: editMeetingTime,
      duration: editMeetingDuration,
      type: editMeetingType as any,
      locationOrLink: editMeetingLink.trim() || 'Google Meet / Zoom',
      notes: editMeetingNotes.trim(),
    };

    if (onUpdateMeeting) {
      onUpdateMeeting(updated);
    }
    setEditingMeeting(null);
    showToast('Meeting updated!');
  };

  const handleDuplicateMeeting = (m: Meeting) => {
    if (onDuplicateMeeting) {
      onDuplicateMeeting(m);
    } else {
      onAddMeeting({
        ...m,
        id: `meet-${Date.now()}`,
        title: `${m.title} (Copy)`,
      });
    }
    showToast('Meeting duplicated!');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const tagsArr = noteTagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      tags: tagsArr.length > 0 ? tagsArr : ['Strategy'],
      updatedAt: todayStr,
    };

    onAddNote(newNote);
    setNoteTitle('');
    setNoteContent('');
    setNoteTagInput('');
    setShowNoteModal(false);
    showToast('Note created!');
  };

  const handleStartEditNote = (n: Note) => {
    setEditingNote(n);
    setEditNoteTitle(n.title);
    setEditNoteContent(n.content);
    setEditNoteTagInput(n.tags ? n.tags.join(', ') : '');
  };

  const handleSaveEditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !editNoteTitle.trim()) return;

    const tagsArr = editNoteTagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated: Note = {
      ...editingNote,
      title: editNoteTitle.trim(),
      content: editNoteContent.trim(),
      tags: tagsArr.length > 0 ? tagsArr : ['Strategy'],
      updatedAt: todayStr,
    };

    if (onUpdateNote) {
      onUpdateNote(updated);
    }
    setEditingNote(null);
    showToast('Note updated!');
  };

  const handleDuplicateNote = (n: Note) => {
    if (onDuplicateNote) {
      onDuplicateNote(n);
    } else {
      onAddNote({
        ...n,
        id: `note-${Date.now()}`,
        title: `${n.title} (Copy)`,
        updatedAt: todayStr,
      });
    }
    showToast('Note duplicated!');
  };

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Executive Planner
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Tasks, Time Blocks, Meetings & Notes
          </p>
        </div>

        {/* Action Button */}
        {activeSubTab === 'tasks' && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2.5 sm:py-2 rounded-xl shadow-sm transition-all min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        )}
        {activeSubTab === 'meetings' && (
          <button
            onClick={() => setShowMeetingModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2.5 sm:py-2 rounded-xl shadow-sm transition-all min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meeting</span>
          </button>
        )}
        {activeSubTab === 'notes' && (
          <button
            onClick={() => setShowNoteModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2.5 sm:py-2 rounded-xl shadow-sm transition-all min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        )}
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex bg-gray-100 p-1 rounded-2xl w-full gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('daily')}
          className={`flex-1 py-2 px-1 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[40px] cursor-pointer ${
            activeSubTab === 'daily'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckSquare className="w-4 h-4 shrink-0" />
          <span className="truncate">Daily Planner</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`flex-1 py-2 px-1 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[40px] cursor-pointer ${
            activeSubTab === 'tasks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CalendarIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('meetings')}
          className={`flex-1 py-2 px-1 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[40px] cursor-pointer ${
            activeSubTab === 'meetings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span className="truncate">Meetings ({meetings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notes')}
          className={`flex-1 py-2 px-1 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[40px] cursor-pointer ${
            activeSubTab === 'notes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <StickyNote className="w-4 h-4 shrink-0" />
          <span className="truncate">Notes ({notes.length})</span>
        </button>
      </div>

      {/* SUB TAB 0: DAILY WORK PLANNER */}
      {activeSubTab === 'daily' && (
        <div className="space-y-5">
          {/* 1. QUICK ADD BAR */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-blue-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600/40 rounded-xl">
                  <Plus className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">Quick Add Work Item</h3>
                  <p className="text-[11px] text-blue-200">Instant capture for today, tomorrow or scheduled focus</p>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('calendar')}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-300" />
                  <span>Open Calendar →</span>
                </button>
              )}
            </div>

            <SmartSuggestionInput
              onAddTask={onAddTask}
              onAddMeeting={onAddMeeting}
            />
          </div>

          {/* 2. OVERDUE TASKS SECTION */}
          {overdueTasks.length > 0 && (
            <div className="bg-red-50/90 border border-red-200 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-800 font-black text-sm sm:text-base">
                  <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                  <span>Overdue Tasks ({overdueTasks.length})</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-red-600 text-white rounded-full">
                  Action Required
                </span>
              </div>

              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-3.5 rounded-2xl border border-red-200 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="text-slate-300 hover:text-emerald-600 cursor-pointer shrink-0"
                        title="Mark Complete"
                      >
                        <Circle className="w-5 h-5" />
                      </button>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">{task.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-red-600 font-bold mt-0.5">
                          <span>Due: {task.dueDate}</span>
                          <span>•</span>
                          <span className="capitalize">{task.priority} Priority</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          const updated = { ...task, dueDate: todayStr };
                          if (onUpdateTask) onUpdateTask(updated);
                        }}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                      >
                        Reschedule to Today
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. TODAY TIMELINE SECTION */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl font-black">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Today Timeline ({todayTasks.length + todayMeetings.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Scheduled deliverables and time blocks for today</p>
                </div>
              </div>

              <button
                onClick={() => setShowTaskModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {todayTasks.length === 0 && todayMeetings.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No work items scheduled for today</p>
                <p className="text-[11px] text-slate-400">Add tasks or meetings above to plan your day.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleMeeting(m.id)}
                        className="text-purple-400 hover:text-purple-700 cursor-pointer shrink-0"
                      >
                        {m.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-purple-300" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.2 bg-purple-200 text-purple-900 rounded">
                            Meeting
                          </span>
                          <span className="text-xs font-bold text-purple-700">{m.time} ({m.duration})</span>
                        </div>
                        <h4 className={`font-bold text-slate-900 text-xs sm:text-sm mt-0.5 ${m.completed ? 'line-through opacity-60' : ''}`}>
                          {m.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEditMeeting(m)}
                        className="p-1.5 text-slate-400 hover:text-purple-700 rounded-lg cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteMeeting && (
                        <button
                          onClick={() => onDeleteMeeting(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      task.status === 'completed'
                        ? 'bg-slate-50 border-slate-200 opacity-70'
                        : 'bg-white border-slate-200 shadow-2xs hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="cursor-pointer shrink-0"
                      >
                        {task.status === 'completed' ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 hover:text-blue-600" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.2 bg-blue-100 text-blue-800 rounded">
                            {task.category}
                          </span>
                          {task.time && <span className="text-xs font-medium text-slate-500">{task.time}</span>}
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className={`font-bold text-slate-900 text-xs sm:text-sm mt-0.5 ${
                          task.status === 'completed' ? 'line-through text-slate-400' : ''
                        }`}>
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEditTask(task)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. TOMORROW SECTION */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Tomorrow ({tomorrowTasks.length + tomorrowMeetings.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-bold">{tomorrowStr}</span>
            </div>

            {tomorrowTasks.length === 0 && tomorrowMeetings.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No work items scheduled for tomorrow yet.</p>
            ) : (
              <div className="space-y-2">
                {tomorrowTasks.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button onClick={() => onToggleTask(t.id)} className="cursor-pointer">
                        <Circle className="w-4 h-4 text-slate-300" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{t.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. UPCOMING SECTION */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Upcoming Work ({upcomingTasks.length + upcomingMeetings.length})
                </h3>
              </div>
            </div>

            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No future work items scheduled after tomorrow.</p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{t.dueDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. PRIORITY TASKS SECTION */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-slate-900 text-base">
                  Priority Tasks ({highPriorityTasks.length})
                </h3>
              </div>
            </div>

            {highPriorityTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No pending high priority tasks.</p>
            ) : (
              <div className="space-y-2">
                {highPriorityTasks.map((t) => (
                  <div key={t.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button onClick={() => onToggleTask(t.id)} className="cursor-pointer shrink-0">
                        <Square className="w-4 h-4 text-amber-400 hover:text-amber-600" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-600 text-white rounded">High</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 1: TASKS */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-3">
          {/* Status Filter Tabs: All, Pending, Completed */}
          <div className="flex bg-gray-200/80 p-1 rounded-xl w-full text-xs font-bold gap-1">
            <button
              onClick={() => setFilterStatus('All')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                filterStatus === 'All'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>All Tasks</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                {totalTasksCount}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('Pending')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                filterStatus === 'Pending'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Pending</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                {pendingTasksCount}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('Completed')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                filterStatus === 'Completed'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Completed</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                {completedTasksCount}
              </span>
            </button>
          </div>

          {/* Search box & Priority Filter Row */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks by title, category, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-blue-600 outline-none bg-white font-medium shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Priority filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                Priority Filter:
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {['All', 'High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all min-h-[34px] cursor-pointer text-xs ${
                      filterPriority === p
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              title={searchQuery.trim() ? "No matching tasks found" : "Your schedule is clear"}
              description={searchQuery.trim() ? "Try adjusting your search query or filters." : "Organize your high-impact execution items, priorities, and daily deliverables."}
              actionLabel="Create Task"
              onAction={() => setShowTaskModal(true)}
              category="planner"
            />
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-2xl p-3.5 border transition-all ${
                      isCompleted
                        ? 'border-gray-100 bg-gray-50/70 opacity-75'
                        : 'border-blue-100 shadow-2xs hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 shrink-0 cursor-pointer transition-transform active:scale-95"
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 hover:text-blue-600" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <h4
                            onClick={() => onToggleTask(task.id)}
                            className={`text-sm font-bold cursor-pointer transition-colors ${
                              isCompleted
                                ? 'line-through text-gray-400'
                                : 'text-gray-900 hover:text-blue-600'
                            }`}
                          >
                            {task.title}
                          </h4>

                          {task.notes && (
                            <p className="text-xs text-gray-500 mt-1 leading-snug">
                              {task.notes}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Priority Badge */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                task.priority === 'High'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : task.priority === 'Medium'
                                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  task.priority === 'High'
                                    ? 'bg-red-500'
                                    : task.priority === 'Medium'
                                    ? 'bg-orange-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              {task.priority} Priority
                            </span>

                            {/* Category Badge */}
                            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                              {task.category}
                            </span>

                            {/* Due Date Badge */}
                            <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-gray-200">
                              <CalendarIcon className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>{task.dueDate === todayStr ? 'Today' : task.dueDate}</span>
                            </span>

                            {/* Scheduled Time */}
                            {task.time && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                🕒 {task.time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditTask(task)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          title="Edit Task"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateTask(task)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                          title="Duplicate Task"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 2: MEETINGS */}
      {activeSubTab === 'meetings' && (
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <EmptyState
              title="No meetings scheduled"
              description="Enjoy uninterrupted deep focus time, or schedule an executive session."
              actionLabel="Add Meeting"
              onAction={() => setShowMeetingModal(true)}
              category="planner"
            />
          ) : (
            <div className="space-y-2.5">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className={`bg-white rounded-2xl p-4 border transition-all ${
                    m.completed
                      ? 'border-gray-100 bg-gray-50/70 opacity-70'
                      : 'border-blue-100 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 font-bold text-center">
                        <Video className="w-5 h-5 mx-auto mb-0.5" />
                        <span className="text-[10px]">{m.time}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              m.completed ? 'line-through text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            {m.title}
                          </h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                            {m.type}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          ⏱ Duration: <span className="font-semibold text-gray-700">{m.duration}</span> • Location:{' '}
                          <span className="font-semibold text-blue-600">{m.locationOrLink}</span>
                        </p>

                        {m.attendees && m.attendees.length > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1.5">
                            <User className="w-3 h-3 text-gray-400" />
                            <span>{m.attendees.join(', ')}</span>
                          </div>
                        )}

                        {m.notes && (
                          <p className="text-xs bg-gray-50 p-2 rounded-lg text-gray-600 mt-2 border border-gray-100">
                            💬 {m.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onToggleMeeting(m.id)}
                        className={`p-1.5 rounded-xl transition-all ${
                          m.completed ? 'text-emerald-600' : 'text-gray-300 hover:text-blue-600'
                        }`}
                        title={m.completed ? 'Mark pending' : 'Mark completed'}
                      >
                        {m.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleStartEditMeeting(m)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        title="Edit Meeting"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateMeeting(m)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                        title="Duplicate Meeting"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {onDeleteMeeting && (
                        <button
                          onClick={() => onDeleteMeeting(m.id)}
                          className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Meeting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 3: NOTES / POWER SCRATCHPAD */}
      {activeSubTab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <EmptyState
              title="No scratchpad notes yet"
              description="Capture strategic ideas, key takeaways, and strategic insights instantly."
              actionLabel="Create Note"
              onAction={() => setShowNoteModal(true)}
              category="planner"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl p-4 border border-blue-100 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-gray-900 leading-snug">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditNote(note)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded-lg"
                          title="Edit Note"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateNote(note)}
                          className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg"
                          title="Duplicate Note"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNote ? onDeleteNote(note.id) : null}
                          className="p-1 text-gray-300 hover:text-rose-600 rounded-lg"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-2 whitespace-pre-line leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 flex-wrap">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {note.updatedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-lg">Add New Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <SmartSuggestionInput
                type="task_title"
                label="Task Title *"
                value={taskTitle}
                onChange={setTaskTitle}
                placeholder="e.g. Review Q3 Sales Targets, Prepare Deck..."
                required
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none bg-white font-medium"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟠 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none bg-white"
                  >
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Task Notes
                </label>
                <input
                  type="text"
                  placeholder="Additional context or links..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEETING */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-lg">Add Meeting</h3>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <SmartSuggestionInput
                type="meeting_title"
                label="Meeting Title *"
                value={meetingTitle}
                onChange={setMeetingTitle}
                placeholder="e.g. Q3 Executive Sync, Client Strategy..."
                required
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Location / Video Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google Meet / Boardroom"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                >
                  Save Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NOTE */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-lg">Create Note</h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <SmartSuggestionInput
                type="note_title"
                label="Title *"
                value={noteTitle}
                onChange={setNoteTitle}
                placeholder="e.g. Growth Principles, Meeting Action Items..."
                required
                autoFocus
              />

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your thoughts, strategic ideas, or notes..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strategy, Philosophy, Tech"
                  value={noteTagInput}
                  onChange={(e) => setNoteTagInput(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TASK */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg">Edit Task</h3>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-3">
              <SmartSuggestionInput
                type="task_title"
                label="Task Title *"
                value={editTitle}
                onChange={setEditTitle}
                placeholder="e.g. Mail Check, Executive Review..."
                required
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none bg-white font-medium"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟠 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none bg-white font-medium"
                  >
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:30 AM"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Task Notes
                </label>
                <input
                  type="text"
                  placeholder="Additional context or notes..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEETING */}
      {editingMeeting && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg">Edit Meeting</h3>
              </div>
              <button
                onClick={() => setEditingMeeting(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMeeting} className="space-y-3">
              <SmartSuggestionInput
                type="meeting_title"
                label="Meeting Title *"
                value={editMeetingTitle}
                onChange={setEditMeetingTitle}
                placeholder="e.g. Q3 Sync, Client Demo..."
                required
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={editMeetingTime}
                    onChange={(e) => setEditMeetingTime(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editMeetingDuration}
                    onChange={(e) => setEditMeetingDuration(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Location / Video Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google Meet / Zoom"
                  value={editMeetingLink}
                  onChange={(e) => setEditMeetingLink(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Meeting details, agenda..."
                  value={editMeetingNotes}
                  onChange={(e) => setEditMeetingNotes(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingMeeting(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT NOTE */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg">Edit Note</h3>
              </div>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditNote} className="space-y-3">
              <SmartSuggestionInput
                type="note_title"
                label="Title *"
                value={editNoteTitle}
                onChange={setEditNoteTitle}
                placeholder="e.g. Growth Strategy, Key Notes..."
                required
                autoFocus
              />

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your note..."
                  value={editNoteContent}
                  onChange={(e) => setEditNoteContent(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strategy, Product, Ideas"
                  value={editNoteTagInput}
                  onChange={(e) => setEditNoteTagInput(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
