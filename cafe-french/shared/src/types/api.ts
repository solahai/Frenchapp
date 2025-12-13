// API Request and Response Types

import { User, UserPreferences, LearnerProfile } from './user';
import { CEFRLevel, SkillType } from './cefr';
import { DailyLesson, LessonPlan } from './lesson';
import { ConversationSession, ConversationMessage, ConversationDebrief } from './conversation';
import { PronunciationAssessment, ShadowingSession } from './pronunciation';
import { SRSCard, ReviewSession } from './srs';
import { MistakeProfile, RemediationWorkout } from './mistakes';
import { LevelUpChallenge, WeeklyReport, PlacementTest } from './progress';

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Auth endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  nativeLanguage: string;
  learningGoal: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User endpoints
export interface UpdatePreferencesRequest {
  preferences: Partial<UserPreferences>;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  learnerProfile?: Partial<LearnerProfile>;
}

// Lesson endpoints
export interface GenerateLessonRequest {
  userId: string;
  date: string;
  level: CEFRLevel;
  durationMinutes: number;
  focusAreas?: SkillType[];
  preferredTopics?: string[];
  includeReview: boolean;
}

export interface GenerateLessonResponse {
  lesson: DailyLesson;
  estimatedDuration: number;
  learningObjectives: string[];
}

export interface CompleteLessonRequest {
  lessonId: string;
  metrics: {
    timeSpent: number;
    activitiesCompleted: string[];
    scores: Record<string, number>;
  };
}

// Conversation endpoints
export interface StartConversationRequest {
  userId: string;
  type: 'free_chat' | 'scenario_chat' | 'hard_mode';
  scenarioId?: string;
  mode: 'text' | 'voice' | 'mixed';
  level: CEFRLevel;
}

export interface StartConversationResponse {
  session: ConversationSession;
  openingMessage: ConversationMessage;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
  audioUrl?: string;
  language: 'french' | 'english';
}

export interface SendMessageResponse {
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
  corrections?: any[];
  shouldRepair?: boolean;
  repairPrompt?: string;
}

export interface EndConversationRequest {
  sessionId: string;
}

export interface EndConversationResponse {
  session: ConversationSession;
  debrief: ConversationDebrief;
}

// Pronunciation endpoints
export interface AssessPronunciationRequest {
  userId: string;
  targetText: string;
  audioData: string; // base64 encoded audio
  level: CEFRLevel;
}

export interface AssessPronunciationResponse {
  assessment: PronunciationAssessment;
  suggestions: string[];
  practiceRecommendations: string[];
}

export interface GetShadowingSessionRequest {
  userId: string;
  level: CEFRLevel;
  phraseCount: number;
  topics?: string[];
}

export interface GetShadowingSessionResponse {
  session: ShadowingSession;
}

// SRS endpoints
export interface GetDueCardsRequest {
  userId: string;
  limit?: number;
  cardTypes?: string[];
}

export interface GetDueCardsResponse {
  cards: SRSCard[];
  newCount: number;
  reviewCount: number;
  estimatedMinutes: number;
}

export interface SubmitReviewRequest {
  cardId: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  timeSpent: number;
  audioUrl?: string;
}

export interface SubmitReviewResponse {
  card: SRSCard;
  nextReviewAt: Date;
  stats: {
    cardsReviewed: number;
    cardsRemaining: number;
    correctRate: number;
  };
}

// Mistake tracker endpoints
export interface GetMistakeProfileRequest {
  userId: string;
}

export interface GetMistakeProfileResponse {
  profile: MistakeProfile;
  topErrors: any[];
  recommendations: string[];
}

export interface GetRemediationWorkoutRequest {
  userId: string;
  maxMinutes?: number;
  focusCategories?: string[];
}

export interface GetRemediationWorkoutResponse {
  workout: RemediationWorkout;
  estimatedMinutes: number;
}

// Progress endpoints
export interface GetProgressRequest {
  userId: string;
  period?: 'week' | 'month' | 'all_time';
}

export interface GetProgressResponse {
  wrrs: any;
  levelProgress: any;
  skillProgress: Record<SkillType, any>;
  streak: number;
  totalStudyMinutes: number;
}

export interface GetWeeklyReportRequest {
  userId: string;
  weekNumber?: number;
}

export interface GetWeeklyReportResponse {
  report: WeeklyReport;
}

export interface StartChallengeRequest {
  userId: string;
  startLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  startDate: string;
}

export interface StartChallengeResponse {
  challenge: LevelUpChallenge;
}

// Placement test endpoints
export interface StartPlacementTestRequest {
  userId: string;
}

export interface StartPlacementTestResponse {
  test: PlacementTest;
  firstQuestion: any;
}

export interface SubmitPlacementAnswerRequest {
  testId: string;
  questionId: string;
  answer: string | string[];
  audioUrl?: string;
}

export interface SubmitPlacementAnswerResponse {
  nextQuestion?: any;
  sectionComplete: boolean;
  testComplete: boolean;
  results?: any;
}

// Text-to-Speech endpoints
export interface TextToSpeechRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export interface TextToSpeechResponse {
  audioUrl: string;
  duration: number;
}

// Speech-to-Text endpoints
export interface SpeechToTextRequest {
  audioData: string; // base64 encoded
  language: 'fr' | 'en';
}

export interface SpeechToTextResponse {
  transcription: string;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

// Grammar explanation endpoints
export interface ExplainGrammarRequest {
  ruleId?: string;
  context?: string;
  userQuestion?: string;
  level: CEFRLevel;
}

export interface ExplainGrammarResponse {
  explanation: string;
  examples: Array<{
    french: string;
    english: string;
  }>;
  practiceExercises: any[];
}

// Content endpoints
export interface GetCulturalContentRequest {
  userId: string;
  level: CEFRLevel;
  type?: string;
  topic?: string;
  limit?: number;
}

export interface GetCulturalContentResponse {
  content: any[];
  totalCount: number;
}

// WebSocket events for real-time features
export type WebSocketEvent = 
  | { type: 'conversation_message'; data: ConversationMessage }
  | { type: 'pronunciation_feedback'; data: any }
  | { type: 'typing_indicator'; data: { isTyping: boolean } }
  | { type: 'error'; data: ApiError }
  | { type: 'connection_status'; data: { connected: boolean } };
