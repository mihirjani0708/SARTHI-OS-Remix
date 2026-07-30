/**
 * errorService.ts
 * Centralized Enterprise Error Handling & Resilience Engine for SARTHI OS.
 * Provides structured logging, categorized errors, safe JSON parsing,
 * input validation helpers, and graceful fallbacks.
 */

export type ErrorCategory =
  | 'AUTH'
  | 'STORAGE'
  | 'VALIDATION'
  | 'NETWORK'
  | 'SYNC'
  | 'SYSTEM';

export interface AppError {
  id: string;
  category: ErrorCategory;
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  recoverable: boolean;
  stack?: string;
}

const ERROR_LOGS_KEY = 'sarthi_error_logs_v1';
const MAX_LOGS_CAP = 50;

export class ErrorService {
  private memoryErrorLogs: AppError[] = [];

  /** Create and record a structured AppError */
  public logError(
    category: ErrorCategory,
    code: string,
    message: string,
    details?: Record<string, any>,
    recoverable: boolean = true,
    errorObj?: any
  ): AppError {
    const error: AppError = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      recoverable,
      stack: errorObj?.stack || (errorObj ? String(errorObj) : undefined),
    };

    console.error(`[SARTHI ErrorService] [${category}:${code}] ${message}`, details || '', errorObj || '');

    // Record in buffer
    this.memoryErrorLogs.unshift(error);
    if (this.memoryErrorLogs.length > MAX_LOGS_CAP) {
      this.memoryErrorLogs.pop();
    }

    // Persist log safely
    this.persistErrorLogs();

    return error;
  }

  /** Safe synchronous function execution with structured error capture and fallback */
  public tryExecute<T>(
    fn: () => T,
    fallbackValue: T,
    category: ErrorCategory = 'SYSTEM',
    contextName: string = 'Operation'
  ): T {
    try {
      return fn();
    } catch (err: any) {
      this.logError(
        category,
        'EXECUTION_FAILED',
        `Failed to execute ${contextName}: ${err?.message || 'Unknown error'}`,
        { contextName },
        true,
        err
      );
      return fallbackValue;
    }
  }

  /** Safe asynchronous function execution with structured error capture and fallback */
  public async tryExecuteAsync<T>(
    fn: () => Promise<T>,
    fallbackValue: T,
    category: ErrorCategory = 'SYSTEM',
    contextName: string = 'AsyncOperation'
  ): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      this.logError(
        category,
        'ASYNC_EXECUTION_FAILED',
        `Failed to execute async ${contextName}: ${err?.message || 'Unknown error'}`,
        { contextName },
        true,
        err
      );
      return fallbackValue;
    }
  }

  /** Safe JSON parsing with fallback and error logging */
  public safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
    if (!raw || typeof raw !== 'string') return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logError('STORAGE', 'JSON_PARSE_ERROR', 'Failed to parse JSON content', { rawSnippet: raw.substring(0, 100) }, true, err);
      return fallback;
    }
  }

  // --- INPUT VALIDATION HELPERS ---

  public validateString(value: any, minLength: number = 1, maxLength: number = 10000): boolean {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  }

  public validateObject(obj: any, requiredKeys: string[] = []): boolean {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    for (const key of requiredKeys) {
      if (!(key in obj) || obj[key] === undefined || obj[key] === null) {
        return false;
      }
    }
    return true;
  }

  public validateArray(arr: any): boolean {
    return Array.isArray(arr);
  }

  public validateEmail(email: any): boolean {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  public validateId(id: any): boolean {
    return this.validateString(id, 1, 100) && !id.includes('/') && !id.includes('\\');
  }

  // --- LOG PERSISTENCE & RETRIEVAL ---

  private persistErrorLogs(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(this.memoryErrorLogs));
      } catch (e) {
        // Ignore quota limits on error logging
      }
    }
  }

  public getErrorLogs(): AppError[] {
    if (this.memoryErrorLogs.length === 0 && typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(ERROR_LOGS_KEY);
        if (raw) {
          this.memoryErrorLogs = JSON.parse(raw);
        }
      } catch (e) {
        // ignore
      }
    }
    return this.memoryErrorLogs;
  }

  public clearErrorLogs(): void {
    this.memoryErrorLogs = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(ERROR_LOGS_KEY);
      } catch (e) {
        // ignore
      }
    }
  }
}

export const errorService = new ErrorService();
