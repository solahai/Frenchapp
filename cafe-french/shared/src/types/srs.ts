// Spaced Repetition System Types

import { CEFRLevel, SkillType } from './cefr';

export interface SRSCard {
  id: string;
  userId: string;
  type: CardType;
  
  // Content
  front: CardFace;
  back: CardFace;
  
  // Source reference
  sourceType: 'vocabulary' | 'grammar' | 'phrase' | 'pronunciation';
  sourceId: string;
  
  // Metadata
  level: CEFRLevel;
  skill: SkillType;
  tags: string[];
  theme: string;
  
  // SRS scheduling (SM-2 algorithm inspired)
  status: CardStatus;
  easeFactor: number; // starts at 2.5
  interval: number; // days until next review
  repetitions: number;
  
  // Timing
  createdAt: Date;
  lastReviewedAt?: Date;
  nextReviewAt: Date;
  
  // Performance metrics
  totalReviews: number;
  correctReviews: number;
  averageRecallTime: number; // ms
  streakCorrect: number;
  
  // Difficulty tracking
  lapses: number; // times card was forgotten
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
}

export type CardType = 
  | 'l1_to_l2'         // English to French (hard - production)
  | 'l2_to_l1'         // French to English (easy - recognition)
  | 'cloze'            // Fill in the blank
  | 'audio_recognition' // Hear French, identify meaning
  | 'speaking'         // Produce speech
  | 'image_to_l2'      // See image, say French
  | 'sentence_order'   // Arrange words into correct order
  | 'conjugation'      // Conjugate verb form
  | 'gender'           // Identify masculine/feminine
  | 'transcription';   // Write what you hear

export type CardStatus = 'new' | 'learning' | 'review' | 'relearning' | 'suspended' | 'buried';

export interface CardFace {
  text?: string;
  html?: string;
  audioUrl?: string;
  imageUrl?: string;
  hint?: string;
  ipa?: string;
  example?: string;
}

export interface ReviewSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  
  // Cards reviewed
  cardsToReview: string[];
  cardsReviewed: CardReview[];
  
  // Session stats
  newCards: number;
  reviewCards: number;
  learningCards: number;
  
  // Performance
  correctCount: number;
  incorrectCount: number;
  averageTime: number;
}

export interface CardReview {
  cardId: string;
  timestamp: Date;
  
  // User response
  response: ReviewResponse;
  timeSpent: number; // ms
  
  // For speaking cards
  audioUrl?: string;
  transcription?: string;
  
  // Result
  wasCorrect: boolean;
  quality: ReviewQuality;
  
  // Updated scheduling
  newInterval: number;
  newEaseFactor: number;
  nextReviewAt: Date;
}

export type ReviewResponse = 'typed' | 'spoken' | 'tapped' | 'revealed';
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = complete blackout, 1 = wrong but remembered after seeing, 
// 2 = wrong, 3 = correct with difficulty, 4 = correct, 5 = perfect/easy

export interface SRSSettings {
  userId: string;
  
  // Daily limits
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  
  // Learning steps
  learningSteps: number[]; // minutes: [1, 10, 60, 1440]
  graduatingInterval: number; // days
  easyInterval: number; // days
  
  // Review settings
  startingEase: number; // 2.5 default
  easyBonus: number; // 1.3 default
  intervalModifier: number; // 1.0 default
  hardIntervalModifier: number; // 1.2 default
  newIntervalAfterLapse: number; // 0.0 = reset to 1 day
  
  // Lapse settings
  lapseSteps: number[]; // minutes
  lapseNewInterval: number; // percentage: 0.0-1.0
  leechThreshold: number; // lapses before leech tag
  leechAction: 'tag' | 'suspend';
  
  // Presentation
  showAnswerTimer: boolean;
  autoPlayAudio: boolean;
  maxAnswerTime: number; // seconds
}

export const DEFAULT_SRS_SETTINGS: SRSSettings = {
  userId: '',
  newCardsPerDay: 20,
  maxReviewsPerDay: 200,
  learningSteps: [1, 10, 60, 1440], // 1min, 10min, 1hr, 1day
  graduatingInterval: 1,
  easyInterval: 4,
  startingEase: 2.5,
  easyBonus: 1.3,
  intervalModifier: 1.0,
  hardIntervalModifier: 1.2,
  newIntervalAfterLapse: 0.0,
  lapseSteps: [10],
  lapseNewInterval: 0.0,
  leechThreshold: 8,
  leechAction: 'tag',
  showAnswerTimer: true,
  autoPlayAudio: true,
  maxAnswerTime: 60
};

export interface DeckStats {
  userId: string;
  date: string;
  
  // Card counts by status
  newCount: number;
  learningCount: number;
  reviewCount: number;
  relearningCount: number;
  suspendedCount: number;
  
  // Due today
  dueNew: number;
  dueReview: number;
  dueLearning: number;
  
  // By difficulty
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  veryHardCount: number;
  
  // Recent performance
  retention7Days: number;
  retention30Days: number;
  averageInterval: number;
}

export interface StudyForecast {
  date: string;
  newCards: number;
  reviewCards: number;
  totalCards: number;
  estimatedMinutes: number;
}

export interface CardGenerator {
  generateFromVocabulary(vocabularyId: string, types: CardType[]): SRSCard[];
  generateFromGrammar(grammarId: string, types: CardType[]): SRSCard[];
  generateFromPhrase(phrase: string, translation: string, types: CardType[]): SRSCard[];
}

// SM-2 Algorithm implementation helpers
export function calculateNextReview(
  quality: ReviewQuality,
  currentEase: number,
  currentInterval: number,
  repetitions: number
): { interval: number; easeFactor: number; repetitions: number } {
  let newEase = currentEase;
  let newInterval = currentInterval;
  let newRepetitions = repetitions;

  if (quality < 3) {
    // Failed review - restart learning
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Successful review
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEase);
    }
    newRepetitions++;
  }

  // Update ease factor
  newEase = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;

  return {
    interval: newInterval,
    easeFactor: newEase,
    repetitions: newRepetitions
  };
}

export function getCardPriority(card: SRSCard): number {
  // Priority for daily review order
  // Lower number = higher priority
  
  const now = new Date();
  const dueDate = new Date(card.nextReviewAt);
  const overdueDays = Math.max(0, (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let priority = 0;
  
  // Status priority
  switch (card.status) {
    case 'relearning': priority = 0; break;
    case 'learning': priority = 100; break;
    case 'review': priority = 200; break;
    case 'new': priority = 300; break;
    default: priority = 1000;
  }
  
  // Overdue cards get higher priority
  priority -= Math.min(overdueDays * 10, 50);
  
  // Lapsed cards get higher priority
  priority -= card.lapses * 5;
  
  // Difficult cards get slightly higher priority
  if (card.difficulty === 'very_hard') priority -= 20;
  if (card.difficulty === 'hard') priority -= 10;
  
  return priority;
}

export function estimateReviewTime(cards: SRSCard[]): number {
  // Estimate time in minutes
  return cards.reduce((total, card) => {
    let baseTime = 10; // seconds
    
    switch (card.type) {
      case 'speaking': baseTime = 20; break;
      case 'l1_to_l2': baseTime = 15; break;
      case 'cloze': baseTime = 12; break;
      case 'audio_recognition': baseTime = 15; break;
      default: baseTime = 10;
    }
    
    // Adjust for difficulty
    if (card.difficulty === 'hard') baseTime *= 1.5;
    if (card.difficulty === 'very_hard') baseTime *= 2;
    
    return total + baseTime;
  }, 0) / 60;
}
