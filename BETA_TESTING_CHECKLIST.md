# SARTHI OS v1.0 — Closed Beta Testing Checklist

Welcome to the Closed Beta for **SARTHI OS v1.0**. Please use this checklist to verify core functional workflows across supported devices and platforms.

---

## 1. Authentication & Session Flow
- [ ] Sign up with email/password or proceed with Guest mode.
- [ ] Perform Login / Logout cycle. Verify session state persists across app reopens.
- [ ] Verify "Remember Me" functionality.
- [ ] Test password reset request flow.

## 2. Dashboard & Navigation
- [ ] Verify bottom navigation order: Home 🏠 → Habits ✅ → Planner 📋 → Goals 🎯 → Journal 📖 → Profile 👤 → Calendar 📅.
- [ ] Confirm active tab blue glow indicator and smooth selection scaling.
- [ ] Check Header profile drawer, notification bell dropdown, and quick search shortcut.

## 3. Executive Planner (Work Management)
- [ ] Create a new task via Quick Add bar with intelligent date parsing (e.g. "Meeting with client tomorrow at 3pm").
- [ ] Test task completion, editing, priority tag assignment, and deletion.
- [ ] Verify overdue task banner appears for past incomplete items with instant "Reschedule to Today".
- [ ] Check Daily, Tasks, Meetings, and Notes sub-navigation tabs.

## 4. Smart Calendar (Date Navigation & Scheduling)
- [ ] Toggle between Month, Week, Day, and Agenda views.
- [ ] Check month view date cells: verify small multi-colored event count indicators (`🔵2 🟢1 🟠3`).
- [ ] Select a date and verify the timeline drawer groups items into Morning, Afternoon, Evening, Completed, and Overdue.
- [ ] Confirm long task chips are NOT rendered directly inside monthly grid cells.

## 5. Strategic Goals Management
- [ ] Filter goals by status (All, Active, Completed, On Hold) and category chips (Business, Personal, Health, Finance, Career, Learning, Travel).
- [ ] Check progress bar rendering: single numerical percentage (e.g. `75%`) with animated completion fill.
- [ ] Verify due date format (`📅 Due: 30 Sep 2026`).
- [ ] Test semantic action buttons: Edit (Blue), Duplicate (Gray), Delete (Red) with hover scaling.

## 6. Smart Habit Tracker
- [ ] Log habit completion for today. Verify current streak and longest streak increment.
- [ ] View habit completion heatmap and daily history.
- [ ] Add a new habit, edit target frequency, or archive an existing habit.

## 7. Daily Reflective Journal & Notes
- [ ] Save a daily journal entry with mood score and reflective tags.
- [ ] Search past journal entries by keyword or tag filter.
- [ ] Create, pin, duplicate, and format markdown notes.

## 8. Voice AI Coach & Sound Assistant
- [ ] Trigger Voice AI modal via microphone button.
- [ ] Speak commands in English, Hindi, or Gujarati.
- [ ] Verify AI text-to-speech output speaks natural sentences without reading markdown symbols or code blocks.
- [ ] Verify graceful permission denied fallback.

## 9. Offline PWA & Service Worker
- [ ] Disconnect internet / turn on Airplane Mode.
- [ ] Refresh app and verify offline startup via Service Worker cache (`v1.0`).
- [ ] Perform offline CRUD edits and confirm data persists locally.

---

**Completion Status**: All core items verified for Closed Beta v1.0 Certification.
