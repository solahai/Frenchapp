// Café French - Constants and Configuration

import { CEFRLevel } from './types/cefr';

// App configuration
export const APP_CONFIG = {
  name: 'Café French',
  version: '2.0.0',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'fr'],
  minPasswordLength: 8,
  maxSessionDuration: 120, // minutes
  defaultSessionDuration: 20, // minutes
};

// Learning configuration
export const LEARNING_CONFIG = {
  // Daily lesson settings
  defaultDailyMinutes: 20,
  minDailyMinutes: 10,
  maxDailyMinutes: 60,
  
  // Vocabulary settings
  newWordsPerDay: 8,
  maxNewWordsPerDay: 15,
  wordsPerRecallSprint: 3,
  
  // SRS settings
  newCardsPerDay: 20,
  maxReviewCardsPerDay: 200,
  
  // Conversation settings
  minConversationTurns: 4,
  maxConversationMinutes: 15,
  
  // Mistake tracker
  errorGraduationWeeks: 3,
  maxRemediationMinutes: 12,
  
  // Cognitive load
  maxCognitiveLoad: 0.7,
  restBreakMinutes: 5,
};

// CEFR level order and progression
export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_LEVEL_NAMES: Record<CEFRLevel, { name: string; description: string }> = {
  'A1': { name: 'Beginner', description: 'Can understand and use basic phrases' },
  'A2': { name: 'Elementary', description: 'Can communicate in simple, routine tasks' },
  'B1': { name: 'Intermediate', description: 'Can deal with most situations while travelling' },
  'B2': { name: 'Upper Intermediate', description: 'Can interact with native speakers fluently' },
  'C1': { name: 'Advanced', description: 'Can use language flexibly for social and professional purposes' },
  'C2': { name: 'Mastery', description: 'Can understand virtually everything heard or read' },
};

export const CEFR_VOCABULARY_TARGETS: Record<CEFRLevel, number> = {
  'A1': 500,
  'A2': 1000,
  'B1': 2000,
  'B2': 4000,
  'C1': 8000,
  'C2': 16000,
};

export const CEFR_ESTIMATED_HOURS: Record<CEFRLevel, number> = {
  'A1': 80,
  'A2': 180,
  'B1': 350,
  'B2': 600,
  'C1': 800,
  'C2': 1200,
};

// Pronunciation scoring thresholds
export const PRONUNCIATION_THRESHOLDS = {
  excellent: 90,
  good: 75,
  acceptable: 60,
  needsWork: 40,
  poor: 0,
};

// SRS intervals (in days)
export const SRS_INTERVALS = {
  initial: [0, 1, 3, 7, 14, 30, 60, 120],
  lapseReset: 1,
  minEaseFactor: 1.3,
  defaultEaseFactor: 2.5,
};

// Error severity weights
export const ERROR_SEVERITY_WEIGHTS = {
  minor: 1,
  moderate: 2,
  major: 3,
};

// Activity types for lessons
export const ACTIVITY_DURATION_ESTIMATES: Record<string, number> = {
  recall_sprint: 90, // seconds
  vocabulary_intro: 60,
  grammar_explanation: 120,
  pronunciation_drill: 45,
  translation_to_french: 30,
  translation_to_english: 20,
  listening_comprehension: 60,
  speaking_response: 45,
  cloze_exercise: 30,
  sentence_construction: 45,
  minimal_pairs: 30,
  shadowing: 60,
  conversation: 120,
  dictation: 60,
  picture_description: 60,
  error_correction: 30,
  reading_comprehension: 90,
  writing_exercise: 120,
};

// Color palette
export const COLORS = {
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#64B5F6',
  secondary: '#FF7043',
  accent: '#7C4DFF',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Skill colors
  listening: '#9C27B0',
  speaking: '#E91E63',
  reading: '#3F51B5',
  writing: '#009688',
  
  // Level colors
  A1: '#8BC34A',
  A2: '#CDDC39',
  B1: '#FFEB3B',
  B2: '#FFC107',
  C1: '#FF9800',
  C2: '#FF5722',
  
  // Neutrals
  white: '#FFFFFF',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
  divider: '#BDBDBD',
};

// Icon names (for React Native)
export const ICONS = {
  home: 'home',
  lesson: 'book-open',
  conversation: 'message-circle',
  pronunciation: 'mic',
  flashcards: 'layers',
  progress: 'trending-up',
  settings: 'settings',
  profile: 'user',
  
  // Actions
  play: 'play',
  pause: 'pause',
  record: 'mic',
  stop: 'square',
  check: 'check',
  close: 'x',
  back: 'arrow-left',
  forward: 'arrow-right',
  refresh: 'refresh-cw',
  
  // Skills
  listening: 'headphones',
  speaking: 'message-square',
  reading: 'book',
  writing: 'edit-2',
  
  // Status
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info',
  star: 'star',
  heart: 'heart',
  
  // Content
  vocabulary: 'book',
  grammar: 'code',
  culture: 'globe',
  tips: 'lightbulb',
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  refreshToken: '/auth/refresh',
  logout: '/auth/logout',
  
  // User
  profile: '/user/profile',
  preferences: '/user/preferences',
  progress: '/user/progress',
  
  // Lessons
  dailyLesson: '/lessons/daily',
  generateLesson: '/lessons/generate',
  completeLesson: '/lessons/complete',
  
  // Conversation
  startConversation: '/conversation/start',
  sendMessage: '/conversation/message',
  endConversation: '/conversation/end',
  
  // Pronunciation
  assessPronunciation: '/pronunciation/assess',
  getShadowing: '/pronunciation/shadowing',
  
  // SRS
  getDueCards: '/srs/due',
  submitReview: '/srs/review',
  
  // Mistakes
  getMistakes: '/mistakes/profile',
  getRemediation: '/mistakes/workout',
  
  // Content
  getCulture: '/content/culture',
  getVocabulary: '/content/vocabulary',
  getGrammar: '/content/grammar',
  
  // TTS/STT
  textToSpeech: '/speech/tts',
  speechToText: '/speech/stt',
  
  // Challenge
  startChallenge: '/challenge/start',
  getChallengeProgress: '/challenge/progress',
  
  // Placement
  startPlacement: '/placement/start',
  submitPlacementAnswer: '/placement/answer',
};

// Error codes
export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'AUTH001',
  TOKEN_EXPIRED: 'AUTH002',
  UNAUTHORIZED: 'AUTH003',
  
  // Validation errors
  INVALID_INPUT: 'VAL001',
  MISSING_REQUIRED: 'VAL002',
  
  // Content errors
  CONTENT_NOT_FOUND: 'CNT001',
  LESSON_NOT_AVAILABLE: 'CNT002',
  
  // AI errors
  AI_SERVICE_ERROR: 'AI001',
  SPEECH_RECOGNITION_FAILED: 'AI002',
  TTS_FAILED: 'AI003',
  
  // Network errors
  NETWORK_ERROR: 'NET001',
  TIMEOUT: 'NET002',
  
  // Server errors
  INTERNAL_ERROR: 'SRV001',
  SERVICE_UNAVAILABLE: 'SRV002',
};

// Feature flags
export const FEATURE_FLAGS = {
  enableVoiceConversation: true,
  enableProsodyScoring: true,
  enableAdaptiveScenarios: true,
  enableRealTimeRepair: true,
  enableOfflineMode: true,
  enableParentDashboard: false,
  enableExamPrep: true,
  enableBetaFeatures: false,
};

// Subscription tiers
export const SUBSCRIPTION_FEATURES = {
  free: [
    'Daily lesson (1 per day)',
    'Basic flashcards (20 new/day)',
    'Limited café chat (3 per day)',
    'Basic progress tracking',
  ],
  premium: [
    'Unlimited daily lessons',
    'Unlimited flashcards',
    'Unlimited café conversations',
    'Full pronunciation lab',
    'Weekly mistake workout',
    'Detailed progress reports',
    'Offline content packs',
    'Culture library access',
  ],
  premium_plus: [
    'Everything in Premium',
    'Priority AI response',
    'Exam prep tracks (DELF/TEF)',
    'Advanced prosody coaching',
    'Personal tutor mode',
    'Family sharing (up to 5)',
  ],
};
