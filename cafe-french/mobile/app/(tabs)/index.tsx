// Home Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, ProgressBar } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useLearningStore } from '../../src/store/learningStore';
import api from '../../src/services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { currentStreak, todayProgress } = useLearningStore();

  // Fetch daily lesson
  const { data: lessonData, isLoading: lessonLoading } = useQuery({
    queryKey: ['dailyLesson'],
    queryFn: () => api.getDailyLesson(),
  });

  // Fetch due cards
  const { data: cardsData } = useQuery({
    queryKey: ['dueCards'],
    queryFn: () => api.getDueCards(20),
  });

  // Fetch progress
  const { data: progressData } = useQuery({
    queryKey: ['progress'],
    queryFn: () => api.getProgress(),
  });

  const firstName = user?.displayName?.split(' ')[0] || 'Learner';
  const greeting = getGreeting();
  const level = user?.profile?.currentLevel || 'A1';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{firstName}! 👋</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>{currentStreak}</Text>
          </View>
        </View>

        {/* Today's Lesson Card */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => router.push('/lesson')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lessonCard}
          >
            <View style={styles.lessonHeader}>
              <View style={styles.lessonBadge}>
                <Text style={styles.lessonBadgeText}>Today's Lesson</Text>
              </View>
              <Text style={styles.lessonLevel}>{level}</Text>
            </View>
            
            <Text style={styles.lessonTitle}>
              {lessonData?.data?.lesson?.culturalNugget?.title || 'Daily French Practice'}
            </Text>
            
            <Text style={styles.lessonSubtitle}>
              {lessonData?.data?.lesson?.vocabulary?.length || 8} new words • 
              Grammar • Conversation
            </Text>
            
            <View style={styles.lessonProgress}>
              <ProgressBar
                progress={todayProgress.lessonsCompleted > 0 ? 100 : 0}
                color="rgba(255,255,255,0.9)"
                backgroundColor="rgba(255,255,255,0.3)"
                height={6}
              />
              <Text style={styles.lessonTime}>~20 min</Text>
            </View>
            
            <View style={styles.lessonAction}>
              <Text style={styles.lessonActionText}>
                {todayProgress.lessonsCompleted > 0 ? 'Review Lesson' : 'Start Lesson'}
              </Text>
              <Feather name="arrow-right" size={20} color={colors.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickActionCard
            icon="layers"
            title="Flashcards"
            subtitle={`${cardsData?.data?.dueToday || 0} due`}
            color={colors.accent}
            onPress={() => router.push('/flashcards')}
          />
          <QuickActionCard
            icon="message-circle"
            title="Café Chat"
            subtitle="Practice speaking"
            color={colors.secondary}
            onPress={() => router.push('/conversation')}
          />
          <QuickActionCard
            icon="mic"
            title="Pronunciation"
            subtitle="Improve accent"
            color={colors.speaking}
            onPress={() => router.push('/pronunciation')}
          />
        </View>

        {/* WRRS Score */}
        {progressData?.data?.wrrs && (
          <Card style={styles.wrrsCard}>
            <View style={styles.wrrsHeader}>
              <Text style={styles.wrrsTitle}>Weekly Readiness Score</Text>
              <TouchableOpacity>
                <Feather name="info" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.wrrsScore}>
              <Text style={styles.wrrsNumber}>
                {progressData.data.wrrs.overall}
              </Text>
              <Text style={styles.wrrsLabel}>/ 100</Text>
            </View>
            
            <View style={styles.wrrsMetrics}>
              <WRRSMetric
                label="Comprehension"
                value={progressData.data.wrrs.comprehension}
                color={colors.listening}
              />
              <WRRSMetric
                label="Speaking"
                value={progressData.data.wrrs.spokenIntelligibility}
                color={colors.speaking}
              />
              <WRRSMetric
                label="Error Reduction"
                value={progressData.data.wrrs.errorRecurrenceReduction}
                color={colors.success}
              />
              <WRRSMetric
                label="Recall Speed"
                value={progressData.data.wrrs.vocabularyRecallSpeed}
                color={colors.accent}
              />
            </View>
          </Card>
        )}

        {/* Recent Mistakes */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Focus Areas</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.focusAreas}>
            <FocusItem
              category="Gender Agreement"
              occurrences={5}
              trend="improving"
            />
            <FocusItem
              category="Passé Composé"
              occurrences={3}
              trend="stable"
            />
          </View>
        </Card>

        {/* 30-Day Challenge */}
        <Card style={styles.challengeCard} onPress={() => router.push('/progress')}>
          <View style={styles.challengeContent}>
            <View style={styles.challengeIcon}>
              <Text style={styles.challengeEmoji}>🎯</Text>
            </View>
            <View style={styles.challengeText}>
              <Text style={styles.challengeTitle}>30-Day Challenge</Text>
              <Text style={styles.challengeSubtitle}>
                Level up from {level} → {getNextLevel(level)}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color={colors.textSecondary} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Quick Action Card Component
interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  icon,
  title,
  subtitle,
  color,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.quickAction}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
      <Feather name={icon as any} size={22} color={color} />
    </View>
    <Text style={styles.quickActionTitle}>{title}</Text>
    <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

// WRRS Metric Component
interface WRRSMetricProps {
  label: string;
  value: number;
  color: string;
}

const WRRSMetric: React.FC<WRRSMetricProps> = ({ label, value, color }) => (
  <View style={styles.wrrsMetric}>
    <Text style={styles.wrrsMetricLabel}>{label}</Text>
    <View style={styles.wrrsMetricBar}>
      <View
        style={[
          styles.wrrsMetricFill,
          { width: `${value}%`, backgroundColor: color },
        ]}
      />
    </View>
  </View>
);

// Focus Item Component
interface FocusItemProps {
  category: string;
  occurrences: number;
  trend: 'improving' | 'stable' | 'increasing';
}

const FocusItem: React.FC<FocusItemProps> = ({ category, occurrences, trend }) => (
  <View style={styles.focusItem}>
    <View style={styles.focusItemInfo}>
      <Text style={styles.focusItemCategory}>{category}</Text>
      <Text style={styles.focusItemOccurrences}>{occurrences} this week</Text>
    </View>
    <View style={[
      styles.focusItemTrend,
      trend === 'improving' && styles.focusItemTrendImproving,
      trend === 'increasing' && styles.focusItemTrendIncreasing,
    ]}>
      <Feather
        name={trend === 'improving' ? 'trending-down' : trend === 'increasing' ? 'trending-up' : 'minus'}
        size={14}
        color={trend === 'improving' ? colors.success : trend === 'increasing' ? colors.error : colors.textSecondary}
      />
    </View>
  </View>
);

// Helper functions
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getNextLevel(level: string): string {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const index = levels.indexOf(level);
  return levels[Math.min(index + 1, levels.length - 1)];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  streakEmoji: {
    fontSize: 18,
  },
  streakCount: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Lesson Card
  lessonCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  lessonBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  lessonBadgeText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  lessonLevel: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
  },
  lessonTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  lessonSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.md,
  },
  lessonProgress: {
    marginBottom: spacing.md,
  },
  lessonTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  lessonAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  lessonActionText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // WRRS Card
  wrrsCard: {
    marginBottom: spacing.lg,
  },
  wrrsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  wrrsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  wrrsScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  wrrsNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  wrrsLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  wrrsMetrics: {
    gap: spacing.md,
  },
  wrrsMetric: {
    gap: spacing.xs,
  },
  wrrsMetricLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  wrrsMetricBar: {
    height: 6,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
  },
  wrrsMetricFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Section Card
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },

  // Focus Areas
  focusAreas: {
    gap: spacing.sm,
  },
  focusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
  },
  focusItemInfo: {},
  focusItemCategory: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  focusItemOccurrences: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  focusItemTrend: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusItemTrendImproving: {
    backgroundColor: colors.successLight,
  },
  focusItemTrendIncreasing: {
    backgroundColor: colors.errorLight,
  },

  // Challenge Card
  challengeCard: {
    marginBottom: spacing.lg,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeEmoji: {
    fontSize: 24,
  },
  challengeText: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  challengeSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
