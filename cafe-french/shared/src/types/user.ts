// User and Profile Types

import { CEFRLevel, SkillType, LevelProgress } from './cefr';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  profile: LearnerProfile;
  subscription: SubscriptionStatus;
}

export interface UserPreferences {
  dailyGoalMinutes: 10 | 20 | 30;
  preferredTopics: TopicPreference[];
  notificationSettings: NotificationSettings;
  accessibilitySettings: AccessibilitySettings;
  audioSettings: AudioSettings;
  learningGoal: LearningGoal;
  timezone: string;
  locale: string;
}

export type LearningGoal = 'travel' | 'daily_life' | 'work' | 'test_prep' | 'immigration' | 'culture';

export interface TopicPreference {
  topicId: string;
  weight: number; // 0-1, higher = more interested
}

export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string; // HH:MM format
  weeklyReport: boolean;
  achievementAlerts: boolean;
  streakReminders: boolean;
}

export interface AccessibilitySettings {
  dyslexiaFriendlyFont: boolean;
  increasedSpacing: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  captionsAlways: boolean;
}

export interface AudioSettings {
  speechRate: number; // 0.5 - 1.5
  autoPlayAudio: boolean;
  nativeSpeakerVoice: 'male' | 'female' | 'random';
  volume: number; // 0 - 1
}

export interface LearnerProfile {
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  skillLevels: Record<SkillType, CEFRLevel>;
  nativeLanguage: string;
  otherLanguages: string[];
  learningStartDate: Date;
  totalStudyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  placementTestCompleted: boolean;
  placementTestDate?: Date;
  levelProgress: LevelProgress;
  weeklyRealWorldReadinessScore: WRRSData;
}

export interface WRRSData {
  overall: number; // 0-100
  comprehension: number;
  spokenIntelligibility: number;
  errorRecurrenceReduction: number;
  vocabularyRecallSpeed: number;
  weeklyTrend: number[]; // Last 12 weeks
  lastUpdated: Date;
}

export interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'premium_plus';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate?: Date;
  endDate?: Date;
  trialEndsAt?: Date;
  features: string[];
}

export interface UserStats {
  userId: string;
  totalLessonsCompleted: number;
  totalWordsLearned: number;
  totalGrammarRulesLearned: number;
  totalConversationMinutes: number;
  totalPronunciationDrills: number;
  averageSessionLength: number;
  completionRate: number;
  weeklyActiveMinutes: number[];
  monthlyProgress: MonthlyProgress[];
}

export interface MonthlyProgress {
  month: string; // YYYY-MM
  lessonsCompleted: number;
  wordsLearned: number;
  conversationMinutes: number;
  wrrsScore: number;
  skillImprovement: Record<SkillType, number>;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  deviceInfo: DeviceInfo;
  lessonsCompleted: string[];
  activitiesCompleted: ActivityLog[];
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  deviceModel: string;
  osVersion: string;
}

export interface ActivityLog {
  activityType: string;
  activityId: string;
  startTime: Date;
  endTime: Date;
  score?: number;
  metadata?: Record<string, any>;
}
