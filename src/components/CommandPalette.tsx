import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Pin,
  History,
  Mic,
  MicOff,
  Sparkles,
  Cloud,
  CheckCircle2,
  Calendar,
  Flame,
  Target,
  BookOpen,
  FileText,
  Bell,
  User,
  Settings,
  Smartphone,
  Tag,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { commandPaletteService } from '../services/command/commandPaletteService';
import { searchService } from '../services/search/searchService';
import { DynamicIcon } from './DynamicIcon';
import { CommandGroup, CommandItem, SearchResult, NavTab } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSelectTab: (tab: NavTab) => void;
  onOpenCoach: () => void;
  onToggleFrame?: () => void;
  onQuickAction?: (actionId: string) => void;
}

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'quick_actions', label: '⚡ Actions' },
  { id: 'task', label: 'Tasks' },
  { id: 'habit', label: 'Habits' },
  { id: 'goal', label: 'Goals' },
  { id: 'note', label: 'Notes' },
  { id: 'meeting', label: 'Meetings' },
  { id: 'ai', label: 'AI Tools' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  userId = 'mansi',
  onSelectTab,
  onOpenCoach,
  onToggleFrame,
  onQuickAction,
}) => {
  const [query, setQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Future AI Readiness States
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isAiSearchMode, setIsAiSearchMode] = useState(false);
  const [isCloudSearchMode, setIsCloudSearchMode] = useState(false);
  const [voiceNotification, setVoiceNotification] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto focus on open & reset state
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Retrieve command groups based on query and filter tab
  const groups: CommandGroup[] = useMemo(() => {
    if (!isOpen) return [];

    let filterModule: string | undefined = undefined;
    if (activeTabFilter !== 'all' && activeTabFilter !== 'quick_actions' && activeTabFilter !== 'ai') {
      filterModule = activeTabFilter;
    }

    let resultGroups = commandPaletteService.searchCommandPalette(userId, query, filterModule);

    // Apply UI tab filter if Quick Actions or AI selected
    if (activeTabFilter === 'quick_actions') {
      resultGroups = resultGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => 'category' in item && item.category === 'quick_action'),
        }))
        .filter((g) => g.items.length > 0);
    } else if (activeTabFilter === 'ai') {
      resultGroups = resultGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => 'category' in item && item.category === 'ai_tools'),
        }))
        .filter((g) => g.items.length > 0);
    }

    return resultGroups;
  }, [isOpen, userId, query, activeTabFilter]);

  // Flattened items array for arrow key navigation mapping
  const flattenedItems = useMemo(() => {
    const list: { item: CommandItem | SearchResult; groupId: string }[] = [];
    groups.forEach((g) => {
      g.items.forEach((item) => {
        list.push({ item, groupId: g.id });
      });
    });
    return list;
  }, [groups]);

  // Keep selected index within valid range
  useEffect(() => {
    if (selectedIndex >= flattenedItems.length) {
      setSelectedIndex(Math.max(0, flattenedItems.length - 1));
    }
  }, [flattenedItems.length, selectedIndex]);

  // Auto scroll selected element into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Handle Quick Action Execution
  const executeItem = (item: CommandItem | SearchResult) => {
    if (!item) return;

    // Is CommandItem Quick Action
    if ('actionId' in item && item.actionId) {
      commandPaletteService.recordCommandExecution(userId, item.id);

      switch (item.actionId) {
        case 'create_task':
          onSelectTab('planner');
          if (onQuickAction) onQuickAction('create_task');
          break;
        case 'create_habit':
          onSelectTab('habits');
          if (onQuickAction) onQuickAction('create_habit');
          break;
        case 'create_goal':
          onSelectTab('goals');
          if (onQuickAction) onQuickAction('create_goal');
          break;
        case 'open_planner':
          onSelectTab('planner');
          break;
        case 'open_journal':
          onSelectTab('journal');
          break;
        case 'add_note':
          onSelectTab('planner');
          if (onQuickAction) onQuickAction('add_note');
          break;
        case 'create_reminder':
          onSelectTab('planner');
          if (onQuickAction) onQuickAction('create_reminder');
          break;
        case 'open_ai_coach':
          onOpenCoach();
          break;
        case 'open_profile':
          onSelectTab('profile');
          break;
        case 'open_settings':
          onSelectTab('profile');
          break;
        case 'toggle_frame':
          if (onToggleFrame) onToggleFrame();
          break;
        case 'replay_search':
          setQuery(item.title);
          return;
        default:
          onSelectTab('home');
          break;
      }
    } else if ('module' in item) {
      // Is SearchResult item
      const searchRes = item as SearchResult;
      // Record query history
      if (query.trim()) {
        searchService.recordSearchQuery(userId, query.trim());
      }

      switch (searchRes.module) {
        case 'task':
        case 'meeting':
        case 'note':
        case 'planner':
          onSelectTab('planner');
          break;
        case 'habit':
          onSelectTab('habits');
          break;
        case 'goal':
          onSelectTab('goals');
          break;
        case 'journal':
          onSelectTab('journal');
          break;
        case 'profile':
          onSelectTab('profile');
          break;
        default:
          onSelectTab('home');
          break;
      }
    }

    onClose();
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flattenedItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % flattenedItems.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flattenedItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % flattenedItems.length);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (flattenedItems.length > 0 && selectedIndex < flattenedItems.length) {
        executeItem(flattenedItems[selectedIndex].item);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const currentTabIdx = FILTER_TABS.findIndex((t) => t.id === activeTabFilter);
      const nextTabIdx = (currentTabIdx + 1) % FILTER_TABS.length;
      setActiveTabFilter(FILTER_TABS[nextTabIdx].id);
      setSelectedIndex(0);
      return;
    }
  };

  // Pin / Unpin command action
  const handleTogglePin = (e: React.MouseEvent, commandId: string) => {
    e.stopPropagation();
    commandPaletteService.togglePinCommand(userId, commandId);
    setSelectedIndex(0);
  };

  // Voice Command Toggle Handler (Future AI Readiness)
  const handleVoiceToggle = () => {
    if (!isVoiceListening) {
      setIsVoiceListening(true);
      setVoiceNotification('Listening for voice command... (Say e.g. "Create Task")');

      // Voice recognition simulation
      setTimeout(() => {
        const voiceRes = commandPaletteService.processVoiceCommand(userId, 'Create Task');
        setVoiceNotification(voiceRes.responseMessage);
        setIsVoiceListening(false);
        if (voiceRes.recognizedAction) {
          onSelectTab('planner');
          onClose();
        }
      }, 2000);
    } else {
      setIsVoiceListening(false);
      setVoiceNotification(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[85vh] sm:max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Spotlight Search Input Bar */}
        <div className="relative px-4 py-3.5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, tasks, habits, goals, notes, AI..."
            className="w-full bg-transparent border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 text-sm sm:text-base font-medium"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* AI & Voice Toolbar Actions */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-slate-200">
            <button
              onClick={handleVoiceToggle}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                isVoiceListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Voice Command Mode"
            >
              {isVoiceListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-500" />}
            </button>

            <button
              onClick={() => setIsAiSearchMode(!isAiSearchMode)}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                isAiSearchMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="AI Search Booster"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiSearchMode ? 'text-amber-300' : 'text-blue-600'}`} />
            </button>

            <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-white border border-slate-200 shadow-xs px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-500">
              ESC
            </kbd>
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTabFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabFilter(tab.id);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200/60 text-slate-600 border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Voice / AI Notification Banner */}
        {voiceNotification && (
          <div className="bg-rose-50 text-rose-700 px-4 py-2 text-xs font-semibold border-b border-rose-100 flex items-center justify-between">
            <span>{voiceNotification}</span>
            <button onClick={() => setVoiceNotification(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Results List View */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-4">
          {groups.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Command className="w-10 h-10 mx-auto mb-2 text-slate-300 animate-bounce" />
              <p className="text-sm font-semibold text-slate-600">No matching commands or search results</p>
              <p className="text-xs text-slate-400 mt-1">Try searching with keywords or selecting another filter tab</p>
            </div>
          ) : (
            groups.map((group) => {
              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Section Header */}
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{group.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{group.items.length} items</span>
                  </div>

                  {/* Group Items */}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      // Find item index in flattened items array
                      const itemFlatIdx = flattenedItems.findIndex((f) => f.item === item);
                      const isSelected = itemFlatIdx === selectedIndex;

                      const isCommand = 'actionId' in item;
                      const commandItem = isCommand ? (item as CommandItem) : null;
                      const searchResult = !isCommand ? (item as SearchResult) : null;

                      // Badge color helper
                      let moduleBadge = searchResult?.module || commandItem?.module || 'system';
                      let badgeBg = 'bg-slate-100 text-slate-700';
                      if (moduleBadge === 'task') badgeBg = 'bg-blue-100 text-blue-700';
                      else if (moduleBadge === 'habit') badgeBg = 'bg-emerald-100 text-emerald-700';
                      else if (moduleBadge === 'goal') badgeBg = 'bg-purple-100 text-purple-700';
                      else if (moduleBadge === 'meeting') badgeBg = 'bg-amber-100 text-amber-700';
                      else if (moduleBadge === 'journal') badgeBg = 'bg-indigo-100 text-indigo-700';
                      else if (moduleBadge === 'note') badgeBg = 'bg-cyan-100 text-cyan-700';
                      else if (moduleBadge === 'notification') badgeBg = 'bg-rose-100 text-rose-700';

                      return (
                        <div
                          key={item.id}
                          data-index={itemFlatIdx}
                          onClick={() => executeItem(item)}
                          onMouseEnter={() => setSelectedIndex(itemFlatIdx)}
                          className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-all ${
                            isSelected
                              ? 'bg-blue-50/90 border-l-4 border-blue-600 shadow-2xs text-slate-900'
                              : 'hover:bg-slate-100/70 text-slate-700 border-l-4 border-transparent'
                          }`}
                        >
                          {/* Left Icon & Text Content */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {commandItem ? (
                                <DynamicIcon name={commandItem.iconName} className="w-4 h-4" />
                              ) : (
                                <Search className="w-4 h-4 text-blue-500" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold truncate text-slate-800">
                                  {item.title}
                                </span>
                                <span
                                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${badgeBg}`}
                                >
                                  {moduleBadge}
                                </span>
                              </div>

                              {(item.description || searchResult?.snippet) && (
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {searchResult?.snippet || item.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right Shortcut / Action Trigger Info */}
                          <div className="flex items-center gap-2 shrink-0">
                            {commandItem?.shortcut && (
                              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-500 shadow-2xs">
                                {commandItem.shortcut}
                              </kbd>
                            )}

                            {commandItem && (
                              <button
                                onClick={(e) => handleTogglePin(e, commandItem.id)}
                                className="p-1 hover:bg-slate-200/80 rounded-md text-slate-400 hover:text-amber-500 transition-colors"
                                title={commandItem.pinned ? 'Unpin Command' : 'Pin Command'}
                              >
                                <Pin
                                  className={`w-3.5 h-3.5 ${
                                    commandItem.pinned ? 'fill-amber-400 text-amber-500' : ''
                                  }`}
                                />
                              </button>
                            )}

                            {isSelected && <CornerDownLeft className="w-4 h-4 text-blue-600 animate-pulse" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" /> Navigate
            </span>
            <span className="flex items-center gap-1 font-mono">
              <CornerDownLeft className="w-3 h-3" /> Select
            </span>
            <span className="flex items-center gap-1 font-mono">
              <kbd className="bg-white px-1 border border-slate-200 rounded">Tab</kbd> Filter
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 font-semibold">
            <Command className="w-3.5 h-3.5 text-blue-600" />
            <span>SARTHI Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
