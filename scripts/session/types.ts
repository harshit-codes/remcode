/**
 * Session Data Types for CSV to JSON Migration
 * 
 * TypeScript definitions for session tracking data with validation support
 */

export interface SessionData {
  sessionId: string;
  timestamp: string;
  developer: string;
  status: 'completed' | 'in_progress' | 'blocked';
  focus: string;
  achievements: string;
  blockers: string;
  nextSteps: string;
  filesChanged: string;
  learnings: string;
  notes: string;
  duration: number;
}

export interface SessionsJSON {
  sessions: SessionData[];
  metadata: {
    version: string;
    migratedFrom: string;
    migratedAt: string;
    totalSessions: number;
  };
}

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number';
  pattern?: RegExp;
  allowedValues?: string[];
  minLength?: number;
  min?: number;
  max?: number;
  error: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Quick validation rules for session data
 */
export const VALIDATION_RULES: ValidationRules = {
  sessionId: {
    required: true,
    type: 'string',
    pattern: /^\d{4}-\d{2}-\d{2}-.+$/,
    minLength: 12,
    error: 'Session ID must be format: YYYY-MM-DD-description (e.g., 2025-05-26-feature-work)'
  },
  timestamp: {
    required: true,
    type: 'string',
    pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    error: 'Timestamp must be ISO format: YYYY-MM-DDTHH:MM:SSZ (e.g., 2025-05-26T14:30:00Z)'
  },
  developer: {
    required: true,
    type: 'string',
    minLength: 2,
    error: 'Developer name must be at least 2 characters'
  },
  status: {
    required: true,
    type: 'string',
    allowedValues: ['completed', 'in_progress', 'blocked'],
    error: 'Status must be: completed, in_progress, or blocked'
  },
  focus: {
    required: true,
    type: 'string',
    minLength: 5,
    error: 'Focus description must be at least 5 characters'
  },
  achievements: {
    required: true,
    type: 'string',
    error: 'Achievements field is required (use "None" if no achievements)'
  },
  blockers: {
    required: true,
    type: 'string',
    error: 'Blockers field is required (use "None" or empty string if no blockers)'
  },
  nextSteps: {
    required: true,
    type: 'string',
    error: 'Next steps field is required'
  },
  filesChanged: {
    required: true,
    type: 'string',
    error: 'Files changed field is required (use "None" if no files changed)'
  },
  learnings: {
    required: true,
    type: 'string',
    error: 'Learnings field is required'
  },
  notes: {
    required: true,
    type: 'string',
    error: 'Notes field is required'
  },
  duration: {
    required: true,
    type: 'number',
    min: 1,
    max: 600,
    error: 'Duration must be a number between 1 and 600 minutes'
  }
};
