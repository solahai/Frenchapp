// Learning Store - Manages lesson state, progress, and offline data

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Lesson {
  id: string;
  date: string;
  level: string;
  status: string;
  sections: any[];
  vocabulary: any[];
  grammarRule: any;
  pronunciationTarget: any;
  culturalNugget: any;
  metrics: any;
}

interface SRSCard {
  id: string;
  type: string;
  front: any;
  back: any;
  level: string;
  status: string;
  difficulty: string;
}

interface LearningState {
  // Current session
  currentLesson: Lesson | null;
  currentSectionIndex: number;
  currentActivityIndex: number;
  
  // SRS
  dueCards: SRSCard[];
  reviewSession: {
    cardsReviewed: number;
    correctCount: number;
    totalCards: number;
  };
  
  // Progress
  todayProgress: {
    lessonsCompleted: number;
    cardsReviewed: number;
    conversationMinutes: number;
    pronunciationDrills: number;
  };
  
  // Streak
  currentStreak: number;
  lastActiveDate: string | null;
  
  // Offline cache
  offlineLessons: Lesson[];
  offlineCards: SRSCard[];
  
  // Actions
  setCurrentLesson: (lesson: Lesson | null) => void;
  setCurrentSection: (index: number) => void;
  setCurrentActivity: (index: number) => void;
  completeActivity: (activityId: string, score: number) => void;
  completeLesson: (metrics: any) => void;
  
  setDueCards: (cards: SRSCard[]) => void;
  reviewCard: (cardId: string, correct: boolean) => void;
  resetReviewSession: () => void;
  
  updateTodayProgress: (key: keyof LearningState['todayProgress'], value: number) => void;
  resetDailyProgress: () => void;
  
  updateStreak: () => void;
  
  cacheLesson: (lesson: Lesson) => void;
  cacheCards: (cards: SRSCard[]) => void;
  getCachedLesson: (date: string) => Lesson | undefined;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLesson: null,
      currentSectionIndex: 0,
      currentActivityIndex: 0,
      
      dueCards: [],
      reviewSession: {
        cardsReviewed: 0,
        correctCount: 0,
        totalCards: 0,
      },
      
      todayProgress: {
        lessonsCompleted: 0,
        cardsReviewed: 0,
        conversationMinutes: 0,
        pronunciationDrills: 0,
      },
      
      currentStreak: 0,
      lastActiveDate: null,
      
      offlineLessons: [],
      offlineCards: [],

      // Lesson actions
      setCurrentLesson: (lesson) => {
        set({
          currentLesson: lesson,
          currentSectionIndex: 0,
          currentActivityIndex: 0,
        });
      },

      setCurrentSection: (index) => {
        set({ currentSectionIndex: index, currentActivityIndex: 0 });
      },

      setCurrentActivity: (index) => {
        set({ currentActivityIndex: index });
      },

      completeActivity: (activityId, score) => {
        const lesson = get().currentLesson;
        if (!lesson) return;

        const updatedSections = lesson.sections.map((section) => ({
          ...section,
          activities: section.activities.map((activity: any) =>
            activity.id === activityId
              ? { ...activity, completed: true, score }
              : activity
          ),
        }));

        set({
          currentLesson: { ...lesson, sections: updatedSections },
        });
      },

      completeLesson: (metrics) => {
        set((state) => ({
          currentLesson: null,
          todayProgress: {
            ...state.todayProgress,
            lessonsCompleted: state.todayProgress.lessonsCompleted + 1,
          },
        }));
        get().updateStreak();
      },

      // SRS actions
      setDueCards: (cards) => {
        set({
          dueCards: cards,
          reviewSession: {
            cardsReviewed: 0,
            correctCount: 0,
            totalCards: cards.length,
          },
        });
      },

      reviewCard: (cardId, correct) => {
        set((state) => ({
          dueCards: state.dueCards.filter((c) => c.id !== cardId),
          reviewSession: {
            ...state.reviewSession,
            cardsReviewed: state.reviewSession.cardsReviewed + 1,
            correctCount: state.reviewSession.correctCount + (correct ? 1 : 0),
          },
          todayProgress: {
            ...state.todayProgress,
            cardsReviewed: state.todayProgress.cardsReviewed + 1,
          },
        }));
      },

      resetReviewSession: () => {
        set({
          reviewSession: {
            cardsReviewed: 0,
            correctCount: 0,
            totalCards: 0,
          },
        });
      },

      // Progress actions
      updateTodayProgress: (key, value) => {
        set((state) => ({
          todayProgress: {
            ...state.todayProgress,
            [key]: state.todayProgress[key] + value,
          },
        }));
      },

      resetDailyProgress: () => {
        set({
          todayProgress: {
            lessonsCompleted: 0,
            cardsReviewed: 0,
            conversationMinutes: 0,
            pronunciationDrills: 0,
          },
        });
      },

      // Streak actions
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = get().lastActiveDate;

        if (lastActive === today) {
          // Already active today
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
          // Continue streak
          set((state) => ({
            currentStreak: state.currentStreak + 1,
            lastActiveDate: today,
          }));
        } else {
          // Reset streak
          set({
            currentStreak: 1,
            lastActiveDate: today,
          });
        }
      },

      // Offline cache actions
      cacheLesson: (lesson) => {
        set((state) => ({
          offlineLessons: [
            ...state.offlineLessons.filter((l) => l.id !== lesson.id),
            lesson,
          ].slice(-7), // Keep last 7 lessons
        }));
      },

      cacheCards: (cards) => {
        set((state) => {
          const existingIds = new Set(state.offlineCards.map((c) => c.id));
          const newCards = cards.filter((c) => !existingIds.has(c.id));
          return {
            offlineCards: [...state.offlineCards, ...newCards].slice(-100), // Keep last 100 cards
          };
        });
      },

      getCachedLesson: (date) => {
        return get().offlineLessons.find((l) => l.date === date);
      },
    }),
    {
      name: 'learning-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentStreak: state.currentStreak,
        lastActiveDate: state.lastActiveDate,
        todayProgress: state.todayProgress,
        offlineLessons: state.offlineLessons,
        offlineCards: state.offlineCards,
      }),
    }
  )
);
