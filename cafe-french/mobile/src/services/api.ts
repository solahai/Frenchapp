// API Service - Handles all backend communication

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = useAuthStore.getState().refreshToken;
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              if (response.data) {
                useAuthStore.getState().setTokens(
                  response.data.accessToken,
                  response.data.refreshToken
                );
                // Retry original request
                const originalRequest = error.config;
                if (originalRequest) {
                  originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                  return this.client(originalRequest);
                }
              }
            } catch {
              // Refresh failed, logout
              useAuthStore.getState().logout();
            }
          } else {
            useAuthStore.getState().logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>>('/auth/login', { email, password });
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    displayName: string;
    nativeLanguage?: string;
    learningGoal?: string;
  }) {
    const response = await this.client.post<ApiResponse<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>>('/auth/register', data);
    return response.data;
  }

  async refreshToken(token: string) {
    const response = await this.client.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>>('/auth/refresh', { refreshToken: token });
    return response.data;
  }

  // User endpoints
  async getProfile() {
    const response = await this.client.get<ApiResponse<any>>('/user/profile');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.put<ApiResponse<any>>('/user/profile', data);
    return response.data;
  }

  async updatePreferences(preferences: any) {
    const response = await this.client.put<ApiResponse<any>>('/user/preferences', { preferences });
    return response.data;
  }

  async getStats() {
    const response = await this.client.get<ApiResponse<any>>('/user/stats');
    return response.data;
  }

  // Lesson endpoints
  async getDailyLesson(date?: string) {
    const response = await this.client.get<ApiResponse<any>>('/lessons/daily', {
      params: { date },
    });
    return response.data;
  }

  async startLesson(lessonId: string) {
    const response = await this.client.post<ApiResponse<any>>(`/lessons/${lessonId}/start`);
    return response.data;
  }

  async completeLesson(lessonId: string, metrics: any) {
    const response = await this.client.post<ApiResponse<any>>(`/lessons/${lessonId}/complete`, { metrics });
    return response.data;
  }

  async completeActivity(lessonId: string, activityId: string, data: any) {
    const response = await this.client.post<ApiResponse<any>>(
      `/lessons/${lessonId}/activity/${activityId}/complete`,
      data
    );
    return response.data;
  }

  // Conversation endpoints
  async startConversation(data: {
    type: string;
    scenarioId?: string;
    mode?: string;
    level?: string;
  }) {
    const response = await this.client.post<ApiResponse<any>>('/conversation/start', data);
    return response.data;
  }

  async sendMessage(sessionId: string, content: string, audioUrl?: string) {
    const response = await this.client.post<ApiResponse<any>>(`/conversation/${sessionId}/message`, {
      content,
      audioUrl,
    });
    return response.data;
  }

  async endConversation(sessionId: string) {
    const response = await this.client.post<ApiResponse<any>>(`/conversation/${sessionId}/end`);
    return response.data;
  }

  async getConversationScenarios() {
    const response = await this.client.get<ApiResponse<any[]>>('/conversation/scenarios');
    return response.data;
  }

  // Pronunciation endpoints
  async assessPronunciation(targetText: string, audioData: string, level: string) {
    const response = await this.client.post<ApiResponse<any>>('/pronunciation/assess', {
      targetText,
      audioData,
      level,
    });
    return response.data;
  }

  async getShadowingSession(level: string, count?: number) {
    const response = await this.client.get<ApiResponse<any>>('/pronunciation/shadowing', {
      params: { level, count },
    });
    return response.data;
  }

  // SRS endpoints
  async getDueCards(limit?: number) {
    const response = await this.client.get<ApiResponse<any>>('/srs/due', {
      params: { limit },
    });
    return response.data;
  }

  async submitReview(cardId: string, quality: number, timeSpent: number) {
    const response = await this.client.post<ApiResponse<any>>('/srs/review', {
      cardId,
      quality,
      timeSpent,
    });
    return response.data;
  }

  async getSRSStats() {
    const response = await this.client.get<ApiResponse<any>>('/srs/stats');
    return response.data;
  }

  // Mistakes endpoints
  async getMistakeProfile() {
    const response = await this.client.get<ApiResponse<any>>('/mistakes/profile');
    return response.data;
  }

  async getRemediationWorkout(maxMinutes?: number) {
    const response = await this.client.get<ApiResponse<any>>('/mistakes/workout', {
      params: { maxMinutes },
    });
    return response.data;
  }

  // Progress endpoints
  async getProgress() {
    const response = await this.client.get<ApiResponse<any>>('/progress');
    return response.data;
  }

  async getWeeklyReport(week?: number) {
    const response = await this.client.get<ApiResponse<any>>('/progress/weekly-report', {
      params: { week },
    });
    return response.data;
  }

  async startChallenge(startLevel: string, targetLevel: string) {
    const response = await this.client.post<ApiResponse<any>>('/progress/challenge/start', {
      startLevel,
      targetLevel,
    });
    return response.data;
  }

  async getCurrentChallenge() {
    const response = await this.client.get<ApiResponse<any>>('/progress/challenge');
    return response.data;
  }

  // Content endpoints
  async getVocabulary(level?: string, theme?: string, limit?: number) {
    const response = await this.client.get<ApiResponse<any[]>>('/content/vocabulary', {
      params: { level, theme, limit },
    });
    return response.data;
  }

  async getGrammarRules(level?: string, category?: string) {
    const response = await this.client.get<ApiResponse<any[]>>('/content/grammar', {
      params: { level, category },
    });
    return response.data;
  }

  async explainGrammar(topic: string, level: string, question?: string) {
    const response = await this.client.post<ApiResponse<any>>('/content/grammar/explain', {
      topic,
      level,
      question,
    });
    return response.data;
  }

  async getCulturalContent(level?: string, type?: string, limit?: number) {
    const response = await this.client.get<ApiResponse<any[]>>('/content/culture', {
      params: { level, type, limit },
    });
    return response.data;
  }

  async getCultureNugget(level: string) {
    const response = await this.client.get<ApiResponse<any>>('/content/culture/nugget', {
      params: { level },
    });
    return response.data;
  }

  // Speech endpoints
  async textToSpeech(text: string, voice?: string) {
    const response = await this.client.post<ApiResponse<{
      audioData: string;
      format: string;
    }>>('/speech/tts', { text, voice });
    return response.data;
  }

  async speechToText(audioData: string, language: 'fr' | 'en' = 'fr') {
    const response = await this.client.post<ApiResponse<{
      transcription: string;
      confidence: number;
    }>>('/speech/stt', { audioData, language });
    return response.data;
  }

  // Additional endpoints
  async getMistakeAnalytics() {
    const response = await this.client.get<ApiResponse<any>>('/mistakes/analytics');
    return response.data;
  }

  async generateMistakeWorkout() {
    const response = await this.client.post<ApiResponse<any>>('/mistakes/workout');
    return response.data;
  }

  async completeMistakeWorkout(workoutId: string, results: any) {
    const response = await this.client.post<ApiResponse<any>>(
      `/mistakes/workout/${workoutId}/complete`,
      results
    );
    return response.data;
  }

  async getNewCards(limit?: number) {
    const response = await this.client.get<ApiResponse<any>>('/srs/new', {
      params: { limit },
    });
    return response.data;
  }

  async getVocabularyThemes() {
    const response = await this.client.get<ApiResponse<any[]>>('/content/themes');
    return response.data;
  }

  async getCulturalNugget(level: string) {
    const response = await this.client.get<ApiResponse<any>>('/content/culture/nugget', {
      params: { level },
    });
    return response.data;
  }

  async getScenarios(level?: string) {
    const response = await this.client.get<ApiResponse<any[]>>('/conversation/scenarios', {
      params: { level },
    });
    return response.data;
  }

  async getUserStats() {
    const response = await this.client.get<ApiResponse<any>>('/user/stats');
    return response.data;
  }

  async getChallenge() {
    const response = await this.client.get<ApiResponse<any>>('/progress/challenge');
    return response.data;
  }

  async completeChallengeDay(challengeId: string, day: number, results: any) {
    const response = await this.client.post<ApiResponse<any>>(
      `/progress/challenge/${challengeId}/day/${day}/complete`,
      results
    );
    return response.data;
  }

  async getVoices() {
    const response = await this.client.get<ApiResponse<any[]>>('/speech/voices');
    return response.data;
  }

  async submitShadowingAttempt(phraseId: string, audioData: string) {
    const response = await this.client.post<ApiResponse<any>>(
      `/pronunciation/shadowing/${phraseId}/attempt`,
      { audioData }
    );
    return response.data;
  }
}

export const api = new ApiService();
export default api;
