import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Smile,
  Frown,
  Meh,
  SmilePlus,
  Sparkles,
  Plus,
  Save,
  Check,
  Calendar,
  Heart,
  Award,
  Lightbulb
} from 'lucide-react';
import { JournalEntry } from '../types';
import { getTodayDateString } from '../data/initialData';
import { SmartSuggestionInput } from './SmartSuggestionInput';

interface JournalViewProps {
  journalEntries: Record<string, JournalEntry>;
  onSaveJournal: (entry: JournalEntry) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journalEntries,
  onSaveJournal,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Load selected date entry or initialize defaults
  const currentEntry = journalEntries[selectedDate] || {
    date: selectedDate,
    moodRating: 5,
    gratitude: ['', '', ''],
    dailyWins: ['', ''],
    learnings: '',
    journalText: '',
    manifestationFocus: '',
  };

  const [moodRating, setMoodRating] = useState<number>(currentEntry.moodRating || 5);
  const [gratitude1, setGratitude1] = useState<string>(currentEntry.gratitude[0] || '');
  const [gratitude2, setGratitude2] = useState<string>(currentEntry.gratitude[1] || '');
  const [gratitude3, setGratitude3] = useState<string>(currentEntry.gratitude[2] || '');
  const [win1, setWin1] = useState<string>(currentEntry.dailyWins[0] || '');
  const [win2, setWin2] = useState<string>(currentEntry.dailyWins[1] || '');
  const [learnings, setLearnings] = useState<string>(currentEntry.learnings || '');
  const [journalText, setJournalText] = useState<string>(currentEntry.journalText || '');
  const [manifestation, setManifestation] = useState<string>(
    currentEntry.manifestationFocus || ''
  );

  const [isSaved, setIsSaved] = useState(false);

  // Synchronize local form state whenever selectedDate or journalEntries change
  useEffect(() => {
    const entry = journalEntries[selectedDate] || {
      date: selectedDate,
      moodRating: 5,
      gratitude: ['', '', ''],
      dailyWins: ['', ''],
      learnings: '',
      journalText: '',
      manifestationFocus: '',
    };
    setMoodRating(entry.moodRating || 5);
    setGratitude1(entry.gratitude[0] || '');
    setGratitude2(entry.gratitude[1] || '');
    setGratitude3(entry.gratitude[2] || '');
    setWin1(entry.dailyWins[0] || '');
    setWin2(entry.dailyWins[1] || '');
    setLearnings(entry.learnings || '');
    setJournalText(entry.journalText || '');
    setManifestation(entry.manifestationFocus || '');
    setIsSaved(false);
  }, [selectedDate, journalEntries]);

  // When date selection changes
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    const entry = journalEntries[date] || {
      date,
      moodRating: 5,
      gratitude: ['', '', ''],
      dailyWins: ['', ''],
      learnings: '',
      journalText: '',
      manifestationFocus: '',
    };
    setMoodRating(entry.moodRating || 5);
    setGratitude1(entry.gratitude[0] || '');
    setGratitude2(entry.gratitude[1] || '');
    setGratitude3(entry.gratitude[2] || '');
    setWin1(entry.dailyWins[0] || '');
    setWin2(entry.dailyWins[1] || '');
    setLearnings(entry.learnings || '');
    setJournalText(entry.journalText || '');
    setManifestation(entry.manifestationFocus || '');
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedEntry: JournalEntry = {
      date: selectedDate,
      moodRating,
      gratitude: [gratitude1, gratitude2, gratitude3].filter((g) => g.trim() !== ''),
      dailyWins: [win1, win2].filter((w) => w.trim() !== ''),
      learnings: learnings.trim(),
      journalText: journalText.trim(),
      manifestationFocus: manifestation.trim(),
    };

    onSaveJournal(updatedEntry);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const moodIcons = [
    { rating: 1, label: 'Low', icon: Frown, color: 'text-rose-500' },
    { rating: 2, label: 'Tired', icon: Meh, color: 'text-amber-500' },
    { rating: 3, label: 'Calm', icon: Smile, color: 'text-blue-500' },
    { rating: 4, label: 'Good', icon: SmilePlus, color: 'text-emerald-500' },
    { rating: 5, label: 'Peak', icon: Sparkles, color: 'text-indigo-600' },
  ];

  // Past dates for quick switching
  const entryDates = Object.keys(journalEntries).sort().reverse();
  if (!entryDates.includes(todayStr)) {
    entryDates.unshift(todayStr);
  }

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Title & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Daily Journal
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Gratitude, Reflections & Manifestation
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleSelectDate(e.target.value)}
            className="text-xs font-bold bg-white border border-gray-200 px-3 py-2 rounded-xl outline-none text-gray-800 shadow-2xs min-h-[40px] cursor-pointer"
          />
        </div>
      </div>

      {/* Date pill history scrollbar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {entryDates.slice(0, 7).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleSelectDate(d)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] cursor-pointer ${
              selectedDate === d
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {d === todayStr ? 'Today' : d}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mood Tracker Card */}
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-2xs">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            Today's State of Mind & Energy
          </p>
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {moodIcons.map((m) => {
              const Icon = m.icon;
              const isSelected = moodRating === m.rating;
              return (
                <button
                  key={m.rating}
                  type="button"
                  onClick={() => setMoodRating(m.rating)}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all min-h-[54px] cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-2 border-blue-600 shadow-xs'
                      : 'hover:bg-gray-50 opacity-60'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${m.color}`} />
                  <span className="text-[10px] font-bold text-gray-700">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gratitude & Prayer Section */}
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-100 shrink-0" />
            <h3 className="font-bold text-gray-900 text-sm">3 Things I Am Grateful For</h3>
          </div>
          <SmartSuggestionInput
            type="gratitude"
            value={gratitude1}
            onChange={setGratitude1}
            placeholder="1. Grateful for..."
          />
          <SmartSuggestionInput
            type="gratitude"
            value={gratitude2}
            onChange={setGratitude2}
            placeholder="2. Grateful for..."
          />
          <SmartSuggestionInput
            type="gratitude"
            value={gratitude3}
            onChange={setGratitude3}
            placeholder="3. Grateful for..."
          />
        </div>

        {/* Daily Wins & Manifestation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <h3 className="font-bold text-gray-900 text-sm">Today's Key Wins</h3>
            </div>
            <SmartSuggestionInput
              type="win"
              value={win1}
              onChange={setWin1}
              placeholder="Win #1..."
            />
            <SmartSuggestionInput
              type="win"
              value={win2}
              onChange={setWin2}
              placeholder="Win #2..."
            />
          </div>

          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <h3 className="font-bold text-gray-900 text-sm">Manifestation Focus</h3>
            </div>
            <textarea
              rows={3}
              placeholder="What abundance and outcome are you attracting?"
              value={manifestation}
              onChange={(e) => setManifestation(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none"
            />
          </div>
        </div>

        {/* Reflections & Free Form Text */}
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <h3 className="font-bold text-gray-900 text-sm">Key Learnings & Deep Journal</h3>
          </div>
          <SmartSuggestionInput
            type="learning"
            value={learnings}
            onChange={setLearnings}
            placeholder="Main lesson learned today..."
          />
          <textarea
            rows={5}
            placeholder="Write your detailed evening journal entry here..."
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:border-blue-600 outline-none leading-relaxed"
          />
        </div>

        {/* Save Button */}
        <div className="sticky bottom-16 z-30 pt-2">
          <button
            type="submit"
            className={`w-full min-h-[48px] py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSaved
                ? 'bg-emerald-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-5 h-5" />
                <span>Journal Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Today's Journal Entry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
