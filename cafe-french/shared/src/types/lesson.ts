// Lesson and Daily Session Types

import { CEFRLevel, SkillType } from './cefr';
import { VocabularyItem } from './vocabulary';
import { GrammarRule } from './grammar';
import { PronunciationPattern } from './pronunciation';

export interface DailyLesson {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  level: CEFRLevel;
  targetDurationMinutes: number;
  status: LessonStatus;
  sections: LessonSection[];
  vocabulary: VocabularyItem[];
  grammarRule: GrammarRule;
  pronunciationTarget: PronunciationPattern;
  culturalNugget: CulturalNugget;
  createdAt: Date;
  completedAt?: Date;
  metrics: LessonMetrics;
}

export type LessonStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped';

export interface LessonSection {
  id: string;
  type: SectionType;
  title: string;
  durationMinutes: number;
  activities: Activity[];
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
}

export type SectionType = 
  | 'warm_start'      // Recall sprint (60-90s)
  | 'new_material'    // New content (6-7 min)
  | 'practice_block'  // Interleaved practice (8-9 min)
  | 'cafe_chat'       // Mini conversation (2-3 min)
  | 'wrap_up';        // Summary (60s)

export interface Activity {
  id: string;
  type: ActivityType;
  skill: SkillType;
  content: ActivityContent;
  instructions: string;
  timeLimit?: number; // seconds
  requiresProduction: boolean;
  completed: boolean;
  score?: number;
  attempts: ActivityAttempt[];
}

export type ActivityType = 
  | 'recall_sprint'
  | 'vocabulary_intro'
  | 'grammar_explanation'
  | 'pronunciation_drill'
  | 'translation_to_french'
  | 'translation_to_english'
  | 'listening_comprehension'
  | 'speaking_response'
  | 'cloze_exercise'
  | 'sentence_construction'
  | 'minimal_pairs'
  | 'shadowing'
  | 'conversation'
  | 'dictation'
  | 'picture_description'
  | 'error_correction'
  | 'reading_comprehension'
  | 'writing_exercise';

export interface ActivityContent {
  // Generic content fields
  prompt?: string;
  targetText?: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer?: string | string[];
  hints?: string[];
  explanation?: string;
  
  // Vocabulary-specific
  vocabularyItems?: string[];
  
  // Grammar-specific
  grammarRuleId?: string;
  examples?: GrammarExample[];
  
  // Pronunciation-specific
  ipaTranscription?: string;
  phonemes?: string[];
  
  // Conversation-specific
  scenario?: ConversationScenario;
  
  // Recall-specific
  recallItems?: RecallItem[];
}

// GrammarExample and ConversationScenario are imported from their respective modules
// to avoid duplication. Use:
// - GrammarExample from './grammar'
// - ConversationScenario from './conversation'

import { GrammarExample } from './grammar';
import { ConversationScenario } from './conversation';

// Re-export for convenience within lesson context
export type { GrammarExample as LessonGrammarExample };
export type { ConversationScenario as LessonConversationScenario };

export interface RecallItem {
  type: 'vocabulary' | 'grammar' | 'phrase';
  itemId: string;
  prompt: string;
  expectedResponse: string;
  lastReviewed: Date;
  daysAgo: number;
}

export interface ActivityAttempt {
  timestamp: Date;
  userResponse: string | string[];
  isCorrect: boolean;
  score: number;
  feedback?: string;
  timeSpent: number; // seconds
  audioRecordingUrl?: string;
}

export interface CulturalNugget {
  id: string;
  title: string;
  content: string;
  category: CultureCategory;
  level: CEFRLevel;
  relatedVocabulary: string[];
  imageUrl?: string;
  audioUrl?: string;
  funFact?: string;
}

export type CultureCategory = 
  | 'food_drink'
  | 'customs'
  | 'history'
  | 'geography'
  | 'expressions'
  | 'etiquette'
  | 'holidays'
  | 'arts'
  | 'daily_life'
  | 'humor';

export interface LessonMetrics {
  totalTimeSpent: number; // seconds
  activitiesCompleted: number;
  activitiesTotal: number;
  averageScore: number;
  newWordsLearned: number;
  wordsReviewed: number;
  speakingTime: number;
  listeningTime: number;
  errorsCommitted: ErrorRecord[];
  improvementsShown: string[];
}

export interface ErrorRecord {
  activityId: string;
  errorType: string;
  errorCategory: string;
  originalResponse: string;
  expectedResponse: string;
  correction: string;
  timestamp: Date;
}

export interface LessonPlan {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  level: CEFRLevel;
  goal: string;
  dailyLessons: DailyLessonPlan[];
  weeklyMilestones: WeeklyMilestone[];
}

export interface DailyLessonPlan {
  day: number;
  date: string;
  theme: string;
  focusAreas: SkillType[];
  vocabularyCount: number;
  grammarTopic?: string;
  pronunciationFocus?: string;
  conversationScenario?: string;
}

export interface WeeklyMilestone {
  week: number;
  speakingMilestone: string;
  listeningMilestone: string;
  writingTask: string;
  confidenceCheck: string;
  targetWRRS: number;
}
