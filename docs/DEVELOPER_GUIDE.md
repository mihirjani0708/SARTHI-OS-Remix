# SARTHI OS — Developer & Maintenance Guide

## 1. Environment Requirements
- **Runtime**: Node.js v18+ / v20+
- **Package Manager**: npm v9+
- **Module Resolution**: ES Modules with TypeScript (`tsx` runner for dev scripts)

---

## 2. Quick Start & Setup

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run full TypeScript verification / lint
npm run lint

# Build production bundle
npm run build
```

---

## 3. Running Verification Audit Scripts
SARTHI OS maintains an automated verification test suite covering all major AI & operational engines (Sprints 6.0 - 6.7).

```bash
# Run Universal Search Engine Audit (Sprint 6.0)
npx tsx scripts/verifySprint60_UniversalSearchEngine.ts

# Run Command Palette Audit (Sprint 6.1)
npx tsx scripts/verifySprint61_CommandPalette.ts

# Run Unified Calendar Engine Audit (Sprint 6.2)
npx tsx scripts/verifySprint62_CalendarEngine.ts

# Run AI Action Engine Audit (Sprint 6.3)
npx tsx scripts/verifySprint63_AIActionEngine.ts

# Run AI Memory Engine Audit (Sprint 6.4)
npx tsx scripts/verifySprint64_AIMemoryEngine.ts

# Run Executive Dashboard Audit (Sprint 6.5)
npx tsx scripts/verifySprint65_ExecutiveDashboardEngine.ts

# Run AI Daily Briefing Engine Audit (Sprint 6.6)
npx tsx scripts/verifySprint66_AIDailyBriefingEngine.ts

# Run AI Decision Engine Audit (Sprint 6.7)
npx tsx scripts/verifySprint67_AIDecisionEngine.ts

# Run Production Readiness Audit (Sprint 6.9)
npx tsx scripts/verifySprint69_ProductionReadiness.ts
```

---

## 4. Coding & Architecture Standards
1. **Types First**: Always declare global interfaces and types in `/src/types.ts`.
2. **Singleton Pattern**: Core services export singleton instances (e.g., `export const decisionEngineService = DecisionEngineService.getInstance();`).
3. **Storage Discipline**: Maintain `DEFAULT_STORAGE_MODE = "local"`. Never write cloud mutation hooks unless explicitly authorized.
4. **Advisory Safety**: AI advisory services must never auto-modify user data. Only return recommendations with confidence scores and actionable choices.
5. **Linting Compliance**: Ensure zero TypeScript errors (`npm run lint`).
