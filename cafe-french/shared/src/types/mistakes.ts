// Mistake Tracking and Error Genome Types

import { CEFRLevel, SkillType } from './cefr';
import { ErrorType } from './conversation';

export interface MistakeProfile {
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Error categories
  grammarErrors: GrammarErrorCluster[];
  vocabularyConfusions: VocabularyConfusion[];
  pronunciationErrors: PronunciationErrorCluster[];
  
  // Statistics
  totalErrorsTracked: number;
  errorsThisWeek: number;
  errorsThisMonth: number;
  
  // Top issues
  topRecurringErrors: RecurringErrorSummary[];
  
  // Progress
  graduatedErrors: string[]; // error IDs that are now resolved
  activeErrors: string[];
  
  // Weekly remediation
  lastRemediationDate?: Date;
  remediationWorkoutScheduled?: Date;
}

export interface GrammarErrorCluster {
  id: string;
  category: string; // e.g., "gender_agreement", "passé_composé"
  subcategory?: string;
  level: CEFRLevel;
  
  // Error instances
  instances: GrammarErrorInstance[];
  
  // Statistics
  totalOccurrences: number;
  occurrencesLast7Days: number;
  occurrencesLast30Days: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  
  // Learning status
  status: ErrorStatus;
  graduationProgress: number; // 0-100
  weeksWithoutError: number;
  
  // Remediation
  suggestedExercises: string[];
  relatedGrammarRules: string[];
}

export type ErrorStatus = 
  | 'new'           // Just identified
  | 'recurring'     // Keeps happening
  | 'improving'     // Frequency decreasing
  | 'monitoring'    // Rare, still watching
  | 'graduated';    // 3+ weeks without occurrence

export interface GrammarErrorInstance {
  id: string;
  timestamp: Date;
  context: ErrorContext;
  
  // What happened
  userInput: string;
  expectedOutput: string;
  errorType: ErrorType;
  
  // Details
  explanation: string;
  correctedVersion: string;
  
  // Session info
  activityType: string;
  skill: SkillType;
  wasAddressed: boolean;
  
  // Factors
  cognitiveFactors: CognitiveFactors;
}

export interface ErrorContext {
  topic: string;
  scenario?: string;
  timeInSession: number; // seconds into session
  speedPressure: 'none' | 'low' | 'medium' | 'high';
  isConversation: boolean;
}

export interface CognitiveFactors {
  sessionDuration: number; // minutes when error occurred
  errorsBeforeThis: number;
  timeSinceLastBreak: number;
  estimatedFatigue: 'low' | 'medium' | 'high';
}

export interface VocabularyConfusion {
  id: string;
  word1: string;
  word2: string;
  confusionType: ConfusionType;
  
  // Instances
  instances: ConfusionInstance[];
  totalConfusions: number;
  
  // Learning status
  status: ErrorStatus;
  
  // Differentiation strategy
  differentiationTip: string;
  memoryAid: string;
  practiceExercises: string[];
}

export type ConfusionType =
  | 'spelling_similar'      // poisson / poison
  | 'pronunciation_similar' // dessus / dessous
  | 'meaning_similar'       // savoir / connaître
  | 'false_friend'          // actuellement ≠ actually
  | 'gender_confusion'      // le/la mémoire
  | 'form_confusion';       // été (summer) / été (been)

export interface ConfusionInstance {
  timestamp: Date;
  context: string;
  usedWord: string;
  intendedWord: string;
  activityType: string;
}

export interface PronunciationErrorCluster {
  id: string;
  phoneme: string;
  ipa: string;
  category: string;
  
  // Instances
  instances: PronunciationErrorInstance[];
  totalOccurrences: number;
  
  // Status
  status: ErrorStatus;
  averageScore: number;
  scoreTrend: number[]; // last 10 attempts
  
  // Remediation
  targetSound: string;
  commonSubstitution: string;
  articulationTips: string[];
  practiceWords: string[];
}

export interface PronunciationErrorInstance {
  timestamp: Date;
  word: string;
  expectedIpa: string;
  producedIpa: string;
  score: number;
  audioUrl?: string;
}

export interface RecurringErrorSummary {
  errorId: string;
  errorType: 'grammar' | 'vocabulary' | 'pronunciation';
  description: string;
  occurrences: number;
  lastOccurrence: Date;
  trend: 'increasing' | 'stable' | 'decreasing';
  priority: 'high' | 'medium' | 'low';
  suggestedAction: string;
}

export interface RemediationWorkout {
  id: string;
  userId: string;
  scheduledDate: Date;
  completedDate?: Date;
  
  // Duration
  estimatedMinutes: number;
  actualMinutes?: number;
  
  // Content
  exercises: RemediationExercise[];
  targetErrors: string[];
  
  // Results
  completed: boolean;
  score?: number;
  errorsAddressed: number;
  errorsResolved: number;
}

export interface RemediationExercise {
  id: string;
  type: RemediationExerciseType;
  targetErrorId: string;
  
  // Content
  instructions: string;
  content: ExerciseContent;
  
  // Results
  completed: boolean;
  attempts: number;
  score?: number;
  feedback?: string;
}

export type RemediationExerciseType =
  | 'focused_drill'          // Repeated practice of specific structure
  | 'error_correction'       // Find and fix errors
  | 'minimal_pair'           // Distinguish similar items
  | 'production_practice'    // Produce correct form
  | 'contextualized_use'     // Use in natural context
  | 'rule_review'            // Review the underlying rule
  | 'spaced_recall';         // Recall after delay

export interface ExerciseContent {
  prompt?: string;
  items?: ExerciseItem[];
  targetStructure?: string;
  audioUrl?: string;
  imageUrl?: string;
}

export interface ExerciseItem {
  id: string;
  prompt: string;
  correctAnswer: string;
  distractors?: string[];
  explanation: string;
}

export interface ErrorAnalytics {
  userId: string;
  period: 'week' | 'month' | 'all_time';
  
  // Overview
  totalErrors: number;
  uniqueErrorTypes: number;
  mostCommonCategory: string;
  
  // By type
  grammarErrorCount: number;
  vocabularyErrorCount: number;
  pronunciationErrorCount: number;
  
  // By category
  errorsByCategory: Record<string, number>;
  
  // Trends
  errorTrend: ErrorTrendData[];
  
  // Improvement
  resolvedErrors: number;
  improvingErrors: number;
  persistentErrors: number;
  
  // Recommendations
  priorityAreas: string[];
  suggestedFocus: string;
}

export interface ErrorTrendData {
  date: string;
  grammarErrors: number;
  vocabularyErrors: number;
  pronunciationErrors: number;
  totalErrors: number;
}

// Graduation criteria
export const GRADUATION_CRITERIA = {
  weeksWithoutError: 3,
  minCorrectUsages: 5,
  minDifferentContexts: 3
};

// Priority calculation
export function calculateErrorPriority(
  error: GrammarErrorCluster | VocabularyConfusion | PronunciationErrorCluster,
  recentOccurrences: number
): 'high' | 'medium' | 'low' {
  if (recentOccurrences >= 3) return 'high';
  if (recentOccurrences >= 1) return 'medium';
  return 'low';
}

// Generate remediation workout
export function generateRemediationTargets(
  profile: MistakeProfile,
  maxExercises: number = 10
): string[] {
  const targets: Array<{ id: string; priority: number }> = [];
  
  // Add grammar errors
  for (const error of profile.grammarErrors) {
    if (error.status !== 'graduated') {
      targets.push({
        id: error.id,
        priority: error.occurrencesLast7Days * 10 + error.totalOccurrences
      });
    }
  }
  
  // Add vocabulary confusions
  for (const confusion of profile.vocabularyConfusions) {
    if (confusion.status !== 'graduated') {
      targets.push({
        id: confusion.id,
        priority: confusion.totalConfusions * 5
      });
    }
  }
  
  // Add pronunciation errors
  for (const error of profile.pronunciationErrors) {
    if (error.status !== 'graduated') {
      targets.push({
        id: error.id,
        priority: error.totalOccurrences * 3
      });
    }
  }
  
  // Sort by priority and take top N
  return targets
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxExercises)
    .map(t => t.id);
}
