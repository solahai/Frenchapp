// Progress Tracking and Level-Up Planner Types

import { CEFRLevel, SkillType } from './cefr';
import { WRRSData } from './user';

export interface LevelUpChallenge {
  id: string;
  userId: string;
  
  // Challenge parameters
  startLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  startDate: Date;
  endDate: Date;
  durationDays: 30;
  
  // Status
  status: ChallengeStatus;
  currentDay: number;
  completedDays: number;
  missedDays: number;
  
  // Plan
  dailyPlan: DailyChallengePlan[];
  weeklyMilestones: ChallengeMilestone[];
  
  // Progress
  progressMetrics: ChallengeProgressMetrics;
  
  // Achievements
  achievementsUnlocked: string[];
}

export type ChallengeStatus = 'not_started' | 'active' | 'completed' | 'abandoned';

export interface DailyChallengePlan {
  day: number;
  date: string;
  theme: string;
  themeFr: string;
  
  // Required activities
  lessonId?: string;
  conversationScenario?: string;
  vocabularyFocus: string[];
  grammarFocus?: string;
  pronunciationFocus?: string;
  
  // Goals
  targetMinutes: number;
  targetNewWords: number;
  targetReviewCards: number;
  
  // Completion
  completed: boolean;
  completedAt?: Date;
  minutesSpent: number;
  activitiesCompleted: string[];
}

export interface ChallengeMilestone {
  week: number;
  title: string;
  description: string;
  
  // Targets
  speakingMilestone: MilestoneTarget;
  listeningMilestone: MilestoneTarget;
  writingTask: WritingTask;
  confidenceCheck: ConfidenceCheck;
  targetWRRS: number;
  
  // Status
  completed: boolean;
  completedAt?: Date;
  results?: MilestoneResults;
}

export interface MilestoneTarget {
  description: string;
  canDoStatement: string;
  assessmentType: 'conversation' | 'comprehension_test' | 'production_test';
  passingCriteria: string;
}

export interface WritingTask {
  prompt: string;
  wordCountTarget: number;
  evaluationCriteria: string[];
}

export interface ConfidenceCheck {
  scenarios: string[];
  selfAssessmentQuestions: string[];
}

export interface MilestoneResults {
  speakingScore: number;
  listeningScore: number;
  writingScore: number;
  confidenceScore: number;
  wrrsScore: number;
  feedback: string;
  areasToImprove: string[];
}

export interface ChallengeProgressMetrics {
  // Time
  totalMinutesStudied: number;
  averageMinutesPerDay: number;
  longestSession: number;
  
  // Content
  lessonsCompleted: number;
  conversationsHeld: number;
  wordsLearned: number;
  grammarRulesLearned: number;
  
  // Skills
  skillProgress: Record<SkillType, SkillProgressData>;
  
  // WRRS trend
  wrrsTrend: WRRSData[];
  wrrsImprovement: number;
  
  // Engagement
  currentStreak: number;
  perfectDays: number;
}

export interface SkillProgressData {
  startScore: number;
  currentScore: number;
  improvement: number;
  practiceMinutes: number;
  activitiesCompleted: number;
}

export interface ProgressSnapshot {
  userId: string;
  timestamp: Date;
  
  // Overall
  currentLevel: CEFRLevel;
  overallProgress: number;
  
  // WRRS
  wrrs: WRRSData;
  
  // By skill
  skillLevels: Record<SkillType, CEFRLevel>;
  skillScores: Record<SkillType, number>;
  
  // Activity
  studyStreak: number;
  totalStudyDays: number;
  totalStudyMinutes: number;
  
  // Vocabulary
  totalWordsLearned: number;
  wordsInReview: number;
  wordsMastered: number;
  
  // Grammar
  grammarRulesLearned: number;
  grammarMastery: number;
  
  // Conversation
  totalConversations: number;
  conversationMinutes: number;
  
  // Pronunciation
  pronunciationScore: number;
  
  // Errors
  activeErrors: number;
  resolvedErrors: number;
}

export interface WeeklyReport {
  userId: string;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  
  // Summary
  totalMinutes: number;
  lessonsCompleted: number;
  daysActive: number;
  
  // Achievement highlights
  highlights: string[];
  
  // WRRS
  wrrsScore: number;
  wrrsChange: number;
  wrrsBreakdown: {
    comprehension: number;
    intelligibility: number;
    errorReduction: number;
    recallSpeed: number;
  };
  
  // Skill progress
  skillProgress: Record<SkillType, WeeklySkillProgress>;
  
  // Vocabulary
  newWords: number;
  wordsReviewed: number;
  retentionRate: number;
  
  // Errors
  errorsThisWeek: number;
  errorsResolved: number;
  topRecurringError: string;
  
  // Recommendations
  focusForNextWeek: string[];
  suggestedActivities: string[];
  
  // Comparison
  comparedToLastWeek: 'better' | 'same' | 'worse';
  percentile?: number; // compared to similar learners
}

export interface WeeklySkillProgress {
  skill: SkillType;
  practiceMinutes: number;
  activitiesCompleted: number;
  score: number;
  change: number;
  recommendation: string;
}

export interface LearningPath {
  userId: string;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  estimatedWeeksToTarget: number;
  
  // Milestones to target
  remainingMilestones: PathMilestone[];
  completedMilestones: PathMilestone[];
  
  // Current focus
  currentFocus: {
    vocabulary: string[];
    grammar: string[];
    pronunciation: string[];
    scenarios: string[];
  };
  
  // Recommendations
  dailyRecommendations: string[];
  weeklyGoals: string[];
}

export interface PathMilestone {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  skill: SkillType;
  estimatedDays: number;
  requirements: string[];
  completed: boolean;
  completedAt?: Date;
}

// Assessment types for progress measurement
export interface PlacementTest {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  
  // Sections
  listeningSection: TestSection;
  speakingSection: TestSection;
  vocabularySection: TestSection;
  grammarSection?: TestSection;
  
  // Results
  completed: boolean;
  results?: PlacementResults;
}

export interface TestSection {
  type: 'listening' | 'speaking' | 'vocabulary' | 'grammar' | 'reading' | 'writing';
  questions: TestQuestion[];
  completed: boolean;
  score?: number;
}

export interface TestQuestion {
  id: string;
  type: 'multiple_choice' | 'audio_response' | 'written_response' | 'speaking';
  level: CEFRLevel;
  content: string;
  audioUrl?: string;
  options?: string[];
  correctAnswer?: string | string[];
  userAnswer?: string;
  score?: number;
  maxScore: number;
}

export interface PlacementResults {
  overallLevel: CEFRLevel;
  skillLevels: Record<SkillType, CEFRLevel>;
  confidence: number; // 0-1
  recommendations: string[];
  suggestedStartingPoint: string;
}

// 30-day challenge templates
export const THIRTY_DAY_THEMES: Array<{ day: number; theme: string; themeFr: string; focus: string }> = [
  { day: 1, theme: 'Greetings & Introductions', themeFr: 'Salutations et présentations', focus: 'Basic greetings' },
  { day: 2, theme: 'At the Café', themeFr: 'Au café', focus: 'Ordering drinks' },
  { day: 3, theme: 'Numbers & Prices', themeFr: 'Nombres et prix', focus: 'Counting, paying' },
  { day: 4, theme: 'Daily Routine', themeFr: 'La routine quotidienne', focus: 'Present tense verbs' },
  { day: 5, theme: 'Review Day', themeFr: 'Jour de révision', focus: 'Week 1 consolidation' },
  { day: 6, theme: 'Family & Friends', themeFr: 'Famille et amis', focus: 'Possessives' },
  { day: 7, theme: 'At the Market', themeFr: 'Au marché', focus: 'Food vocabulary' },
  { day: 8, theme: 'Describing People', themeFr: 'Décrire les gens', focus: 'Adjective agreement' },
  { day: 9, theme: 'Weather & Seasons', themeFr: 'Le temps et les saisons', focus: 'Weather expressions' },
  { day: 10, theme: 'Week 1 Milestone', themeFr: 'Bilan semaine 1', focus: 'Speaking assessment' },
  { day: 11, theme: 'Getting Around', themeFr: 'Se déplacer', focus: 'Transportation' },
  { day: 12, theme: 'At the Restaurant', themeFr: 'Au restaurant', focus: 'Ordering food' },
  { day: 13, theme: 'Shopping', themeFr: 'Faire du shopping', focus: 'Clothes, colors' },
  { day: 14, theme: 'Telling Time', themeFr: 'Dire l\'heure', focus: 'Time expressions' },
  { day: 15, theme: 'Review Day', themeFr: 'Jour de révision', focus: 'Week 2 consolidation' },
  { day: 16, theme: 'At the Doctor', themeFr: 'Chez le médecin', focus: 'Body parts, symptoms' },
  { day: 17, theme: 'Past Events', themeFr: 'Événements passés', focus: 'Passé composé intro' },
  { day: 18, theme: 'At the Hotel', themeFr: 'À l\'hôtel', focus: 'Reservations' },
  { day: 19, theme: 'Directions', themeFr: 'Les directions', focus: 'Giving directions' },
  { day: 20, theme: 'Week 2 Milestone', themeFr: 'Bilan semaine 2', focus: 'Listening assessment' },
  { day: 21, theme: 'Hobbies & Interests', themeFr: 'Loisirs et intérêts', focus: 'Preferences' },
  { day: 22, theme: 'Making Plans', themeFr: 'Faire des projets', focus: 'Future expressions' },
  { day: 23, theme: 'Phone Calls', themeFr: 'Au téléphone', focus: 'Phone vocabulary' },
  { day: 24, theme: 'At the Bank/Post Office', themeFr: 'À la banque/poste', focus: 'Transactions' },
  { day: 25, theme: 'Review Day', themeFr: 'Jour de révision', focus: 'Week 3 consolidation' },
  { day: 26, theme: 'Expressing Opinions', themeFr: 'Exprimer ses opinions', focus: 'Opinion phrases' },
  { day: 27, theme: 'Problem Solving', themeFr: 'Résoudre des problèmes', focus: 'Complaints, solutions' },
  { day: 28, theme: 'Social Situations', themeFr: 'Situations sociales', focus: 'Invitations, thanks' },
  { day: 29, theme: 'French Culture', themeFr: 'La culture française', focus: 'Cultural practices' },
  { day: 30, theme: 'Final Assessment', themeFr: 'Évaluation finale', focus: 'Complete assessment' }
];
