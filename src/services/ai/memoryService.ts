/**
 * memoryService.ts
 * Sprint 6.4 – AI Memory & Personalization Engine for SARTHI OS.
 * Manages user long-term memories, preferences, routines, privacy safety guardrails,
 * auto-detection from natural language prompts, context retrieval, and developer APIs.
 *
 * STORAGE MODE: Strictly local (DEFAULT_STORAGE_MODE = "local").
 */

import { AIMemory, MemoryCategory, MemoryPriority, MemorySearchResult, UserPersonaProfile } from '../../types';

const STORAGE_KEY_PREFIX = 'sarthi_memories_';

// Initial sample memories seeded for demonstration users to guarantee instant context
const INITIAL_DEMO_MEMORIES: Record<string, Partial<AIMemory>[]> = {
  mihir: [
    {
      category: 'daily_routine',
      title: 'Morning Wakeup & Focus Routine',
      content: 'Wakes up at 6:00 AM daily; starts with 15 mins mindfulness & workout before board syncs.',
      priority: 'high',
      isPinned: true,
      tags: ['routine', 'morning', 'health'],
    },
    {
      category: 'work_preferences',
      title: 'Executive Focus Hours',
      content: 'Prefers deep work focus blocks between 9:00 AM and 11:30 AM without non-urgent meetings.',
      priority: 'high',
      isPinned: true,
      tags: ['focus', 'calendar', 'workstyle'],
    },
    {
      category: 'business_information',
      title: 'Company Context - SARTHI OS',
      content: 'Founder & CEO of SARTHI OS, expanding enterprise operating system and strategic AI coaching.',
      priority: 'critical',
      isPinned: true,
      tags: ['company', 'leadership', 'sarthi'],
    },
    {
      category: 'personal_preferences',
      title: 'Language & Interface',
      content: 'Prefers concise executive summaries, high contrast visuals, and English communication.',
      priority: 'medium',
      isPinned: false,
      tags: ['ui', 'language', 'preferences'],
    },
  ],
  mansi: [
    {
      category: 'daily_routine',
      title: 'Product Planning Rhythm',
      content: 'Reviews product roadmap and daily sprint backlog at 8:30 AM before team standup.',
      priority: 'high',
      isPinned: true,
      tags: ['product', 'routine', 'sprint'],
    },
    {
      category: 'personal_preferences',
      title: 'Notification Settings',
      content: 'Prefers batch notifications in morning and evening to avoid focus disruption.',
      priority: 'medium',
      isPinned: false,
      tags: ['notifications', 'preferences'],
    },
  ],
};

// Sensitive data patterns for Privacy Guard (Phase 6)
const SENSITIVE_PATTERNS = [
  /\b(password|passwd|pwd)\b[:=\s]*\S+/i,
  /\b(otp|one time password|verification code)\b[:=\s]*\d{4,8}/i,
  /\b(bank account|account number|iban|swift|routing number)\b/i,
  /\b(credit card|debit card|cvv|cvc|card number)\b/i,
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card format
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN format
  /\b(ssn|social security|pin number|secret key|private key)\b/i,
];

export class AIMemoryService {
  private static instance: AIMemoryService;
  private memoryFallback: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): AIMemoryService {
    if (!AIMemoryService.instance) {
      AIMemoryService.instance = new AIMemoryService();
    }
    return AIMemoryService.instance;
  }

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // Helper: Read raw memories from localStorage
  private loadRawMemories(userId: string): AIMemory[] {
    if (!userId) return [];
    const key = `${STORAGE_KEY_PREFIX}${userId.toLowerCase().trim()}`;
    
    if (this.isLocalStorageAvailable()) {
      try {
        const stored = window.localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (err) {
        console.warn(`[AIMemoryService] Error loading memories for user ${userId}:`, err);
      }
    } else if (this.memoryFallback.has(key)) {
      try {
        return JSON.parse(this.memoryFallback.get(key)!);
      } catch {
        // continue
      }
    }

    // Seed initial demo memories if empty
    const seeded = this.seedInitialMemories(userId);
    return seeded;
  }

  // Helper: Write raw memories to localStorage
  private saveRawMemories(userId: string, memories: AIMemory[]): void {
    if (!userId) return;
    const key = `${STORAGE_KEY_PREFIX}${userId.toLowerCase().trim()}`;
    const serialized = JSON.stringify(memories);

    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(key, serialized);
      } catch (err) {
        console.error(`[AIMemoryService] Failed to persist memories for user ${userId}:`, err);
      }
    }
    this.memoryFallback.set(key, serialized);
  }

  // Helper: Seed demo memories
  private seedInitialMemories(userId: string): AIMemory[] {
    const normalized = (userId || 'mihir').toLowerCase().trim();
    const defaults = INITIAL_DEMO_MEMORIES[normalized] || INITIAL_DEMO_MEMORIES['mihir'];
    const now = new Date().toISOString();

    const seeded: AIMemory[] = defaults.map((m, idx) => ({
      id: `mem_seed_${normalized}_${idx + 1}`,
      userId,
      category: m.category || 'custom',
      title: m.title || 'Saved Context',
      content: m.content || '',
      tags: m.tags || ['general'],
      priority: m.priority || 'medium',
      isPinned: !!m.isPinned,
      isArchived: false,
      source: 'system',
      confidence: 1.0,
      lastAccessedAt: now,
      accessCount: 1,
      createdAt: now,
      updatedAt: now,
    }));

    this.saveRawMemories(userId, seeded);
    return seeded;
  }

  // ====================================================
  // PHASE 6: Privacy Safety Guard
  // ====================================================
  public containsSensitiveData(text: string): boolean {
    if (!text) return false;
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  }

  // ====================================================
  // PHASE 1 & 2: Categorization & Prioritization
  // ====================================================
  public categorizeMemory(content: string, title: string = ''): MemoryCategory {
    const combined = `${title} ${content}`.toLowerCase();

    if (/wake\s*up|sleep|morning|evening|night|exercise|walk|gym|workout|routine/i.test(combined)) {
      return 'daily_routine';
    }
    if (/prefer|favorite|like|dislike|theme|mode|language|style|communication/i.test(combined)) {
      return 'personal_preferences';
    }
    if (/work|office|meeting time|focus hour|slack|email|calendar|schedule/i.test(combined)) {
      return 'work_preferences';
    }
    if (/company|business|client|industry|revenue|founder|ceo|market|sarthi/i.test(combined)) {
      return 'business_information';
    }
    if (/goal|target|quarterly|annual|milestone|metric/i.test(combined)) {
      return 'goals';
    }
    if (/habit|streak|daily task|discipline/i.test(combined)) {
      return 'habits';
    }
    if (/birthday|anniversary|deadline|event date|due date/i.test(combined)) {
      return 'important_dates';
    }
    if (/meeting|standup|1-on-1|1on1|sync|board/i.test(combined)) {
      return 'meetings';
    }
    if (/project|sprint|roadmap|feature|launch|architecture/i.test(combined)) {
      return 'projects';
    }

    return 'custom';
  }

  public prioritizeMemory(content: string, category?: MemoryCategory): MemoryPriority {
    const text = content.toLowerCase();

    if (category === 'business_information' || /critical|essential|urgent|key metric|ceo/i.test(text)) {
      return 'critical';
    }
    if (category === 'daily_routine' || category === 'work_preferences' || /important|always|daily/i.test(text)) {
      return 'high';
    }
    if (/low priority|minor|optional/i.test(text)) {
      return 'low';
    }

    return 'medium';
  }

  // ====================================================
  // PHASE 3: Memory Intelligence & Auto Detection
  // ====================================================
  public detectAndSaveMemory(userId: string, userPrompt: string): AIMemory | null {
    if (!userId || !userPrompt || userPrompt.trim().length < 10) return null;

    // Privacy Guard check
    if (this.containsSensitiveData(userPrompt)) {
      console.warn('[AIMemoryService] Rejected auto-memory save: Sensitive data detected.');
      return null;
    }

    // Reject ephemeral/short commands
    if (/^(hi|hello|hey|what|how|show|create|delete|complete|open|move|show today)/i.test(userPrompt.trim()) &&
        !/remember|my preferred|i prefer|i wake up|my company|i usually|my goal/i.test(userPrompt.toLowerCase())) {
      return null;
    }

    // Triggers for long-term memory extraction
    const memoryTriggers = [
      /(?:remember that|my preferred|i prefer|i like to|i always|i usually|my wake-up time is|i wake up at|my company is|my business is|my goal is|preferred language is)\s+(.+)/i,
      /(?:keep in mind|note that|setting for my)\s+(.+)/i,
    ];

    let extractedContent: string | null = null;
    for (const trigger of memoryTriggers) {
      const match = userPrompt.match(trigger);
      if (match && match[1]) {
        extractedContent = match[1].trim();
        break;
      }
    }

    if (!extractedContent) {
      // Direct statements like "I wake up at 6 AM every day"
      if (/i wake up at \d+|i prefer \w+|my company name is/i.test(userPrompt)) {
        extractedContent = userPrompt.trim();
      } else {
        return null;
      }
    }

    const category = this.categorizeMemory(extractedContent);
    const priority = this.prioritizeMemory(extractedContent, category);
    const title = extractedContent.split('.')[0].slice(0, 40) || 'User Memory';

    return this.saveMemory({
      userId,
      category,
      title,
      content: extractedContent,
      priority,
      isPinned: false,
      source: 'auto_detected',
      confidence: 0.88,
      tags: ['auto', category],
    });
  }

  // ====================================================
  // PHASE 1, 5 & 7: Core Developer APIs
  // ====================================================

  /**
   * saveMemory - Creates or updates a memory item.
   */
  public saveMemory(data: Partial<AIMemory> & { userId: string; content: string }): AIMemory {
    if (!data.userId || !data.content) {
      throw new Error('[AIMemoryService] userId and content are required to save memory.');
    }

    // Privacy Safety Guard Validation
    if (this.containsSensitiveData(data.content) || (data.title && this.containsSensitiveData(data.title))) {
      throw new Error('[AIMemoryService] Privacy Error: Sensitive personal information (passwords, OTP, financial or private details) cannot be saved.');
    }

    const memories = this.loadRawMemories(data.userId);
    const now = new Date().toISOString();

    const category = data.category || this.categorizeMemory(data.content, data.title);
    const priority = data.priority || this.prioritizeMemory(data.content, category);
    const title = data.title || data.content.slice(0, 35) + '...';

    const newMemory: AIMemory = {
      id: data.id || `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: data.userId,
      category,
      title,
      content: data.content,
      tags: data.tags || [category],
      priority,
      isPinned: data.isPinned ?? false,
      isArchived: data.isArchived ?? false,
      source: data.source || 'user_created',
      confidence: data.confidence ?? 1.0,
      lastAccessedAt: now,
      accessCount: 1,
      createdAt: data.createdAt || now,
      updatedAt: now,
      metadata: data.metadata || {},
    };

    // Check if duplicate or existing id
    const existingIdx = memories.findIndex((m) => m.id === newMemory.id);
    if (existingIdx >= 0) {
      memories[existingIdx] = { ...memories[existingIdx], ...newMemory, updatedAt: now };
    } else {
      memories.unshift(newMemory);
    }

    this.saveRawMemories(data.userId, memories);
    return newMemory;
  }

  /**
   * updateMemory - Updates an existing memory.
   */
  public updateMemory(memoryId: string, updates: Partial<AIMemory>, userId?: string): AIMemory | null {
    if (!memoryId) return null;

    // Check sensitive data if updating content or title
    if ((updates.content && this.containsSensitiveData(updates.content)) ||
        (updates.title && this.containsSensitiveData(updates.title))) {
      throw new Error('[AIMemoryService] Privacy Error: Sensitive information cannot be stored.');
    }

    const targetUserId = userId || updates.userId || 'mihir';
    const memories = this.loadRawMemories(targetUserId);

    const idx = memories.findIndex((m) => m.id === memoryId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const updated = {
      ...memories[idx],
      ...updates,
      updatedAt: now,
    };

    memories[idx] = updated;
    this.saveRawMemories(targetUserId, memories);
    return updated;
  }

  /**
   * deleteMemory - Removes a memory permanently.
   */
  public deleteMemory(memoryId: string, userId: string = 'mihir'): boolean {
    if (!memoryId) return false;
    const memories = this.loadRawMemories(userId);
    const initialCount = memories.length;
    const filtered = memories.filter((m) => m.id !== memoryId);

    if (filtered.length === initialCount) return false;

    this.saveRawMemories(userId, filtered);
    return true;
  }

  /**
   * pinMemory - Toggles or sets pinned state for high-priority retention.
   */
  public pinMemory(memoryId: string, pinned: boolean = true, userId: string = 'mihir'): AIMemory | null {
    return this.updateMemory(memoryId, { isPinned: pinned }, userId);
  }

  /**
   * archiveMemory - Archives or unarchives a memory.
   */
  public archiveMemory(memoryId: string, archived: boolean = true, userId: string = 'mihir'): AIMemory | null {
    return this.updateMemory(memoryId, { isArchived: archived }, userId);
  }

  /**
   * searchMemory - Searches memories by query string and optional category filter.
   */
  public searchMemory(userId: string, query: string, category?: MemoryCategory): AIMemory[] {
    const memories = this.loadRawMemories(userId).filter((m) => !m.isArchived);
    const q = (query || '').toLowerCase().trim();

    return memories.filter((m) => {
      if (category && m.category !== category) return false;
      if (!q) return true;

      const titleMatch = m.title.toLowerCase().includes(q);
      const contentMatch = m.content.toLowerCase().includes(q);
      const tagMatch = m.tags?.some((t) => t.toLowerCase().includes(q));

      return titleMatch || contentMatch || tagMatch;
    });
  }

  // ====================================================
  // PHASE 4: Memory Retrieval Engine
  // ====================================================
  public getRelevantMemories(userId: string, contextQuery: string = '', limit: number = 5): AIMemory[] {
    const all = this.loadRawMemories(userId).filter((m) => !m.isArchived);
    if (all.length === 0) return [];

    const qTerms = contextQuery.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

    const scored: { memory: AIMemory; score: number }[] = all.map((m) => {
      let score = 0;

      // Pinned bonus
      if (m.isPinned) score += 50;

      // Priority score
      if (m.priority === 'critical') score += 30;
      else if (m.priority === 'high') score += 20;
      else if (m.priority === 'medium') score += 10;

      // Access frequency bonus
      score += Math.min(m.accessCount || 0, 15);

      // Relevance term matches
      if (qTerms.length > 0) {
        const text = `${m.title} ${m.content} ${m.category} ${(m.tags || []).join(' ')}`.toLowerCase();
        for (const term of qTerms) {
          if (text.includes(term)) {
            score += 15;
          }
        }
      }

      return { memory: m, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, limit).map((s) => s.memory);

    // Update access timestamps asynchronously
    if (top.length > 0) {
      const now = new Date().toISOString();
      const updatedAll = all.map((m) => {
        if (top.some((t) => t.id === m.id)) {
          return {
            ...m,
            lastAccessedAt: now,
            accessCount: (m.accessCount || 0) + 1,
          };
        }
        return m;
      });
      this.saveRawMemories(userId, updatedAll);
    }

    return top;
  }

  /**
   * getMemoryContextForAI - Returns formatted long-term memory prompt block for Gemini / AI Assistant.
   */
  public getMemoryContextForAI(userId: string, currentContext: string = ''): string {
    const relevant = this.getRelevantMemories(userId, currentContext, 6);
    if (relevant.length === 0) return '';

    const lines = relevant.map(
      (m) => `- [${m.category.toUpperCase().replace('_', ' ')}] ${m.title}: ${m.content}`
    );

    return `\n--- USER LONG-TERM MEMORY & CONTEXT ---\n${lines.join('\n')}\n-------------------------------------\n`;
  }

  /**
   * getMemories - Filterable retrieval method.
   */
  public getMemories(
    userId: string,
    filter?: { category?: MemoryCategory; isArchived?: boolean; isPinned?: boolean; query?: string }
  ): AIMemory[] {
    let list = this.loadRawMemories(userId);

    if (filter) {
      if (filter.isArchived !== undefined) {
        list = list.filter((m) => m.isArchived === filter.isArchived);
      }
      if (filter.isPinned !== undefined) {
        list = list.filter((m) => m.isPinned === filter.isPinned);
      }
      if (filter.category) {
        list = list.filter((m) => m.category === filter.category);
      }
      if (filter.query) {
        const q = filter.query.toLowerCase();
        list = list.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q) ||
            m.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }
    }

    return list;
  }

  public clearAllMemories(userId: string): boolean {
    this.saveRawMemories(userId, []);
    return true;
  }

  public exportMemories(userId: string): string {
    const memories = this.loadRawMemories(userId);
    return JSON.stringify(
      {
        userId,
        exportedAt: new Date().toISOString(),
        totalCount: memories.length,
        memories,
      },
      null,
      2
    );
  }

  // ====================================================
  // PHASE 8: Future Ready Architecture Stubs
  // ====================================================

  /**
   * Cloud Memory Adapter & Sync Stub (Future Cloud Ready)
   */
  public async syncMemoriesToCloud(userId: string): Promise<{ success: boolean; mode: string; count: number }> {
    console.log(`[CloudMemoryAdapter] [FUTURE_READY] Local storage mode active. Memory count for ${userId}: ${this.loadRawMemories(userId).length}`);
    return {
      success: true,
      mode: 'LOCAL_MODE_ACTIVE',
      count: this.loadRawMemories(userId).length,
    };
  }

  /**
   * Generates a high-level user persona profile from stored memories.
   */
  public generateUserPersonaProfile(userId: string): UserPersonaProfile {
    const memories = this.loadRawMemories(userId).filter((m) => !m.isArchived);

    const preferences = memories.filter((m) => m.category === 'personal_preferences').map((m) => m.content);
    const routines = memories.filter((m) => m.category === 'daily_routine').map((m) => m.content);
    const goals = memories.filter((m) => m.category === 'goals').map((m) => m.content);
    const workStyles = memories.filter((m) => m.category === 'work_preferences').map((m) => m.content);
    const business = memories.filter((m) => m.category === 'business_information').map((m) => m.content);

    return {
      userId,
      summary: `User Profile synthesised from ${memories.length} long-term memories across ${new Set(memories.map((m) => m.category)).size} categories.`,
      keyPreferences: preferences,
      routines,
      topGoals: goals,
      workStyle: workStyles.join('; ') || 'Standard Executive Workstyle',
      businessContext: business,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Formats compact context string for Voice Assistant mode.
   */
  public formatVoiceAssistantMemoryContext(userId: string): string {
    const topMemories = this.getRelevantMemories(userId, 'voice prompt', 3);
    if (topMemories.length === 0) return 'No voice context stored.';
    return topMemories.map((m) => `${m.title}: ${m.content}`).join(' | ');
  }
}

export const aiMemoryService = AIMemoryService.getInstance();
