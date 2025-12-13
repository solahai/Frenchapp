// Vocabulary and Lexical Types

import { CEFRLevel, SkillType } from './cefr';

export interface VocabularyItem {
  id: string;
  french: string;
  english: string;
  ipa: string;
  partOfSpeech: PartOfSpeech;
  gender?: 'masculine' | 'feminine';
  plural?: string;
  level: CEFRLevel;
  frequency: FrequencyBand;
  themes: string[];
  examples: VocabularyExample[];
  audioUrl: string;
  imageUrl?: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  confusionPairs: ConfusionPair[];
  conjugations?: VerbConjugation;
  notes?: string;
  mnemonicHint?: string;
  culturalNote?: string;
}

export type PartOfSpeech = 
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'article'
  | 'determiner'
  | 'expression';

export type FrequencyBand = 'very_high' | 'high' | 'medium' | 'low' | 'specialized';

export interface VocabularyExample {
  french: string;
  english: string;
  audioUrl?: string;
  context?: string;
  level: CEFRLevel;
}

export interface ConfusionPair {
  word: string;
  explanation: string;
  differentiatingExample: {
    correct: string;
    incorrect: string;
  };
}

export interface VerbConjugation {
  infinitive: string;
  group: 1 | 2 | 3;
  isIrregular: boolean;
  auxiliaryVerb: 'avoir' | 'être';
  pastParticiple: string;
  presentParticiple: string;
  tenses: Record<VerbTense, TenseConjugation>;
}

export type VerbTense = 
  | 'présent'
  | 'imparfait'
  | 'passé_composé'
  | 'plus_que_parfait'
  | 'futur_simple'
  | 'futur_antérieur'
  | 'conditionnel_présent'
  | 'conditionnel_passé'
  | 'subjonctif_présent'
  | 'subjonctif_passé'
  | 'impératif';

export interface TenseConjugation {
  je: string;
  tu: string;
  il_elle_on: string;
  nous: string;
  vous: string;
  ils_elles: string;
}

export interface VocabularyProgress {
  itemId: string;
  userId: string;
  status: LearningStatus;
  firstSeen: Date;
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  easeFactor: number; // SM-2 algorithm
  interval: number; // days
  streakCorrect: number;
  recallSpeed: number; // average ms
  productionAccuracy: number; // 0-1
  recognitionAccuracy: number; // 0-1
  pronunciationScore: number; // 0-100
  contexts: VocabularyContext[];
}

export type LearningStatus = 'new' | 'learning' | 'reviewing' | 'mastered' | 'struggling';

export interface VocabularyContext {
  date: Date;
  activityType: string;
  wasCorrect: boolean;
  responseTime: number;
  errorType?: string;
}

export interface VocabularyTheme {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  level: CEFRLevel;
  iconName: string;
  color: string;
  vocabularyCount: number;
  subthemes?: VocabularyTheme[];
}

export interface DailyVocabularySet {
  date: string;
  userId: string;
  newWords: VocabularyItem[];
  reviewWords: VocabularyItem[];
  targetTheme: string;
  cognitiveLoadScore: number; // 0-1, should stay below 0.7
}

// French vocabulary themes
export const VOCABULARY_THEMES: VocabularyTheme[] = [
  {
    id: 'greetings',
    name: 'Greetings & Politeness',
    nameFr: 'Salutations et politesse',
    description: 'Basic greetings and polite expressions',
    level: 'A1',
    iconName: 'hand-wave',
    color: '#4CAF50',
    vocabularyCount: 50
  },
  {
    id: 'cafe_restaurant',
    name: 'Café & Restaurant',
    nameFr: 'Café et restaurant',
    description: 'Ordering food and drinks, restaurant vocabulary',
    level: 'A1',
    iconName: 'coffee',
    color: '#795548',
    vocabularyCount: 80
  },
  {
    id: 'shopping',
    name: 'Shopping',
    nameFr: 'Faire les courses',
    description: 'Shopping, prices, and transactions',
    level: 'A1',
    iconName: 'shopping-cart',
    color: '#E91E63',
    vocabularyCount: 70
  },
  {
    id: 'family',
    name: 'Family & Relationships',
    nameFr: 'Famille et relations',
    description: 'Family members and relationships',
    level: 'A1',
    iconName: 'people',
    color: '#9C27B0',
    vocabularyCount: 60
  },
  {
    id: 'home',
    name: 'Home & Living',
    nameFr: 'La maison',
    description: 'House, rooms, furniture, and daily life',
    level: 'A1',
    iconName: 'home',
    color: '#FF9800',
    vocabularyCount: 90
  },
  {
    id: 'travel',
    name: 'Travel & Transportation',
    nameFr: 'Voyages et transports',
    description: 'Travel, directions, and transportation',
    level: 'A2',
    iconName: 'airplane',
    color: '#2196F3',
    vocabularyCount: 100
  },
  {
    id: 'health',
    name: 'Health & Body',
    nameFr: 'Santé et corps',
    description: 'Body parts, health, and medical vocabulary',
    level: 'A2',
    iconName: 'heart',
    color: '#F44336',
    vocabularyCount: 85
  },
  {
    id: 'work',
    name: 'Work & Professions',
    nameFr: 'Travail et métiers',
    description: 'Jobs, workplace, and professional vocabulary',
    level: 'A2',
    iconName: 'briefcase',
    color: '#607D8B',
    vocabularyCount: 95
  },
  {
    id: 'nature',
    name: 'Nature & Weather',
    nameFr: 'Nature et météo',
    description: 'Nature, animals, and weather',
    level: 'A2',
    iconName: 'leaf',
    color: '#4CAF50',
    vocabularyCount: 75
  },
  {
    id: 'education',
    name: 'Education & Learning',
    nameFr: 'Éducation et apprentissage',
    description: 'School, studies, and learning',
    level: 'A2',
    iconName: 'book',
    color: '#3F51B5',
    vocabularyCount: 70
  },
  {
    id: 'culture',
    name: 'Culture & Entertainment',
    nameFr: 'Culture et divertissement',
    description: 'Arts, entertainment, and leisure',
    level: 'B1',
    iconName: 'palette',
    color: '#9C27B0',
    vocabularyCount: 110
  },
  {
    id: 'technology',
    name: 'Technology & Media',
    nameFr: 'Technologie et médias',
    description: 'Computers, internet, and media',
    level: 'B1',
    iconName: 'smartphone',
    color: '#00BCD4',
    vocabularyCount: 80
  },
  {
    id: 'emotions',
    name: 'Emotions & Opinions',
    nameFr: 'Émotions et opinions',
    description: 'Feelings, opinions, and expressions',
    level: 'B1',
    iconName: 'emoji-emotions',
    color: '#FFEB3B',
    vocabularyCount: 90
  },
  {
    id: 'society',
    name: 'Society & Politics',
    nameFr: 'Société et politique',
    description: 'Social issues, politics, and current events',
    level: 'B2',
    iconName: 'public',
    color: '#673AB7',
    vocabularyCount: 120
  },
  {
    id: 'business',
    name: 'Business & Finance',
    nameFr: 'Affaires et finances',
    description: 'Business, economics, and finance',
    level: 'B2',
    iconName: 'trending-up',
    color: '#00897B',
    vocabularyCount: 100
  }
];
