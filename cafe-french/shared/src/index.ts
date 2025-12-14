// Café French - Shared Types and Utilities
// Core domain models for the French learning application

// Core types - order matters to avoid circular dependencies
export * from './types/user';
export * from './types/cefr';
export * from './types/vocabulary';
export * from './types/grammar';
export * from './types/conversation';
export * from './types/pronunciation';
export * from './types/srs';
export * from './types/mistakes';
export * from './types/culture';
export * from './types/progress';
export * from './types/api';

// Lesson types (after grammar and conversation to use their types)
export {
  DailyLesson,
  LessonStatus,
  LessonSection,
  SectionType,
  Activity,
  ActivityType,
  ActivityContent,
  RecallItem,
  CulturalNugget,
  LessonMetrics,
  ErrorRecord,
  LessonPlan,
  DailyLessonPlan,
  WeeklyMilestone,
} from './types/lesson';

// Constants and utilities
export * from './constants';
export * from './utils';
