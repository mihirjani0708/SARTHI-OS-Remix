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
  X,
  Tag,
  AlertCircle,
  Check,
  Video,
  Search
} from 'lucide-react';
import { Task, Meeting, Note, Priority, TaskCategory } from '../types';
import { getTodayDateString } from '../data/initialData';
import { EmptyState } from './EmptyState';

interface PlannerViewProps {
  tasks: Task[];
  meetings: Meeting[];
  notes: Note[];
  onAddTask: (newTask: Task) => void;
  onUpdateTask?: (updatedTask: Task) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddMeeting: (newMeeting: Meeting) => void;
  onToggleMeeting: (meetingId: string) => void;
  onAddNote: (newNote: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  tasks,
  meetings,
  notes,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  onAddMeeting,
  onToggleMeeting,
  onAddNote,
  onDeleteNote,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'meetings' | 'notes'>('tasks');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title: meetingTitle.trim(),
      time: meetingTime,
      duration: meetingDuration,
      type: meetingType,
      locationOrLink: meetingLink.trim() || 'Google Meet / Zoom',
      notes: meetingNotes.trim(),
      completed: false,
    };

    onAddMeeting(newMeeting);
    setMeetingTitle('');
    setMeetingNotes('');
    setMeetingLink('');
    setShowMeetingModal(false);
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
      <div className="flex bg-gray-100 p-1 rounded-2xl w-full">
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

                    <button
                      onClick={() => onToggleMeeting(m.id)}
                      className={`p-1.5 rounded-xl transition-all shrink-0 ${
                        m.completed ? 'text-emerald-600' : 'text-gray-300 hover:text-blue-600'
                      }`}
                    >
                      {m.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
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
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-gray-300 hover:text-rose-600 rounded-lg shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Review Q3 Sales Targets"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

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
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
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
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Executive Sync"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

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
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
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
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Growth Principles 2026"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
                />
              </div>

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
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
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
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mail Check"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none font-medium"
                />
              </div>

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
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
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
    </div>
  );
};
