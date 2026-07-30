# SARTHI OS — System Architecture Summary

## 1. Overview
SARTHI OS is an Executive Personal Life & Business Operating System engineered for personal organization, habit formation, strategic planning, productivity analytics, and proactive AI executive guidance.

- **Primary Storage Mode**: `DEFAULT_STORAGE_MODE = "local"` (Local-first architecture using browser LocalStorage and memory-cached state).
- **Architecture Pattern**: Centralized Data Service Facade with Singleton Service Architecture.
- **Client Framework**: React 18+ with Vite, Tailwind CSS, Lucide Icons, Framer Motion.

---

## 2. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│     (React Components, Framer Motion, Tailwind UI Views)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Global Command Palette                   │
│        (CommandPaletteService, Universal Search Engine)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  AI & Executive Coach Layer                 │
│  - AIActionService (NL Commands, Intents, Undo Stack)       │
│  - AIMemoryService (Vector-like Local Memory & Context)     │
│  - DailyBriefingService (Executive Briefs, Daily Scores)    │
│  - DecisionEngineService (Executive Advisor & Risk/Opp)     │
│  - ExecutiveDashboardService (Widget Data & Layouts)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Core Operations Services                   │
│  - CentralDataServiceFacade (Unified Local Data Bus)        │
│  - CalendarService (Unified 7-Source Timeline & Conflicts)  │
│  - NotificationService (Proactive Reminders & Audio Alerts) │
│  - AnalyticsService (Metrics, Event Counts, Performance)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                   Data Persistence Layer                    │
│      (LocalStorage Engine, Seed Storage, Caching Layer)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Service Catalog

### Central Services
1. **CentralDataServiceFacade**: Unified CRUD interface wrapping LocalStorage operations for Tasks, Habits, Goals, Meetings, Notes, Projects, Finance, and Journal entries.
2. **CalendarService**: Aggregates calendar items from 7 data sources, calculates free focus blocks, detects schedule conflicts, and manages timeline views.
3. **NotificationService**: Handles active reminders, browser push notifications, sound triggers, and unread badge state.
4. **AnalyticsService**: Tracks event counts, user execution metrics, time allocation distributions, and productivity scores.

### AI & Intelligence Services
1. **UniversalSearchEngine**: High-performance multi-attribute search across 9 modules with tokenization, fuzzy matching, and result ranking.
2. **CommandPaletteService**: Global command registry (`Ctrl+K`), pinned shortcuts, frequency tracking, and quick navigation.
3. **AIActionService**: Intent parsing engine for natural language action execution, parameter extraction, and destructive action guards with full undo capabilities.
4. **AIMemoryService**: Vector-like local memory store for user preferences, routine insights, auto-tagging, and context retrieval.
5. **ExecutiveDashboardService**: Dynamic widget layout engine, custom widget configuration, and executive KPI summaries.
6. **DailyBriefingService**: Proactive morning briefs, evening recaps, 5-metric daily scorecards, and multi-channel payload formats (Voice, Email, WhatsApp, Push).
7. **DecisionEngineService**: Executive Advisor providing risk detection, opportunity identification, explainable recommendations, and confidence scoring.

---

## 4. Local-First Data Flow & Offline Safety
- **No Remote Blockers**: All operations complete synchronously or near-instantaneously (<1ms) in local mode.
- **Fail-Safe Fallbacks**: Standard seed data is automatically initialized if browser state is cleared.
- **Cache Invalidation**: Performance cache map with 5-second TTL prevents duplicate evaluation during rapid UI re-renders while allowing programmatic cache flushes (`clearCache()`).

---

## 5. Security & Read-Only Boundaries
- **No Data Mutation without Intent**: Decision Engine and Daily Briefing services are strictly READ-ONLY advisory layers.
- **Destructive Guard**: Destructive operations (e.g. clearing data or resetting records) require explicit user confirmation via `AIActionService`.
