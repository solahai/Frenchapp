// Progress Screen

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
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Card, ProgressBar, SkillProgress } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useLearningStore } from '../../src/store/learningStore';
import api from '../../src/services/api';
import { colors, spacing, typography, borderRadius, shadows, getLevelColor, getSkillColor } from '../../src/theme';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const user = useAuthStore((state) => state.user);
  const { currentStreak, todayProgress } = useLearningStore();

  // Fetch progress data
  const { data: progressData } = useQuery({
    queryKey: ['progress'],
    queryFn: () => api.getProgress(),
  });

  // Fetch weekly report
  const { data: weeklyData } = useQuery({
    queryKey: ['weeklyReport'],
    queryFn: () => api.getWeeklyReport(),
  });

  // Fetch current challenge
  const { data: challengeData } = useQuery({
    queryKey: ['challenge'],
    queryFn: () => api.getCurrentChallenge(),
  });

  const level = user?.profile?.currentLevel || 'A1';
  const progress = progressData?.data;
  const weekly = weeklyData?.data?.report;
  const challenge = challengeData?.data?.challenge;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
        </View>

        {/* Level Card */}
        <Card style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelLabel}>Current Level</Text>
              <Text style={[styles.levelText, { color: getLevelColor(level) }]}>
                {level}
              </Text>
            </View>
            <View style={styles.streakContainer}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
          </View>
          
          <View style={styles.levelProgress}>
            <View style={styles.levelProgressHeader}>
              <Text style={styles.levelProgressLabel}>Progress to {getNextLevel(level)}</Text>
              <Text style={styles.levelProgressPercent}>
                {progress?.levelProgress?.overallProgress || 0}%
              </Text>
            </View>
            <ProgressBar
              progress={progress?.levelProgress?.overallProgress || 0}
              color={getLevelColor(level)}
              height={8}
            />
          </View>
        </Card>

        {/* WRRS Score */}
        <Card style={styles.wrrsCard}>
          <View style={styles.wrrsHeader}>
            <Text style={styles.wrrsTitle}>Weekly Readiness Score</Text>
            <TouchableOpacity>
              <Feather name="info" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.wrrsScoreContainer}>
            <View style={styles.wrrsScoreCircle}>
              <Text style={styles.wrrsScoreNumber}>
                {progress?.wrrs?.overall || 0}
              </Text>
              <Text style={styles.wrrsScoreLabel}>/ 100</Text>
            </View>
            
            <View style={styles.wrrsChange}>
              {(progress?.wrrs?.overall || 0) > 0 && (
                <>
                  <Feather name="trending-up" size={16} color={colors.success} />
                  <Text style={styles.wrrsChangeText}>+5 this week</Text>
                </>
              )}
            </View>
          </View>
          
          <Text style={styles.wrrsDescription}>
            Measures your real-world conversation readiness based on comprehension, 
            speaking, error reduction, and recall speed.
          </Text>
        </Card>

        {/* Skills */}
        <Card style={styles.skillsCard}>
          <Text style={styles.skillsTitle}>Skills Breakdown</Text>
          
          <View style={styles.skillsList}>
            <SkillProgress
              skill="Listening"
              level={progress?.skillProgress?.listening || 'A1'}
              progress={getSkillProgressPercent(progress?.skillProgress?.listening)}
              color={getSkillColor('listening')}
            />
            <SkillProgress
              skill="Speaking"
              level={progress?.skillProgress?.speaking || 'A1'}
              progress={getSkillProgressPercent(progress?.skillProgress?.speaking)}
              color={getSkillColor('speaking')}
            />
            <SkillProgress
              skill="Reading"
              level={progress?.skillProgress?.reading || 'A1'}
              progress={getSkillProgressPercent(progress?.skillProgress?.reading)}
              color={getSkillColor('reading')}
            />
            <SkillProgress
              skill="Writing"
              level={progress?.skillProgress?.writing || 'A1'}
              progress={getSkillProgressPercent(progress?.skillProgress?.writing)}
              color={getSkillColor('writing')}
            />
          </View>
        </Card>

        {/* Weekly Stats */}
        {weekly && (
          <Card style={styles.weeklyCard}>
            <View style={styles.weeklyHeader}>
              <Text style={styles.weeklyTitle}>This Week</Text>
              <Text style={styles.weeklyDates}>
                {weekly.weekStart} - {weekly.weekEnd}
              </Text>
            </View>
            
            <View style={styles.weeklyStats}>
              <WeeklyStat
                icon="clock"
                value={`${weekly.totalMinutes || 0}`}
                label="minutes"
              />
              <WeeklyStat
                icon="book"
                value={`${weekly.lessonsCompleted || 0}`}
                label="lessons"
              />
              <WeeklyStat
                icon="check-circle"
                value={`${weekly.daysActive || 0}/7`}
                label="days"
              />
              <WeeklyStat
                icon="star"
                value={`${weekly.newWords || 0}`}
                label="words"
              />
            </View>
            
            {weekly.highlights && weekly.highlights.length > 0 && (
              <View style={styles.highlights}>
                {weekly.highlights.map((highlight: string, i: number) => (
                  <View key={i} style={styles.highlightItem}>
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* 30-Day Challenge */}
        {challenge && (
          <Card style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeEmoji}>🎯</Text>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>30-Day Challenge</Text>
                <Text style={styles.challengeSubtitle}>
                  {challenge.startLevel} → {challenge.targetLevel}
                </Text>
              </View>
              <View style={styles.challengeDay}>
                <Text style={styles.challengeDayNumber}>Day {challenge.currentDay}</Text>
              </View>
            </View>
            
            <ProgressBar
              progress={(challenge.completedDays / 30) * 100}
              color={colors.primary}
              height={8}
              showLabel
              labelPosition="top"
            />
            
            <View style={styles.challengeStats}>
              <View style={styles.challengeStat}>
                <Text style={styles.challengeStatNumber}>{challenge.completedDays}</Text>
                <Text style={styles.challengeStatLabel}>completed</Text>
              </View>
              <View style={styles.challengeStat}>
                <Text style={styles.challengeStatNumber}>{30 - challenge.currentDay}</Text>
                <Text style={styles.challengeStatLabel}>remaining</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Stats Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>All-Time Stats</Text>
          
          <View style={styles.summaryGrid}>
            <SummaryStat
              value={progress?.totalWordsLearned || 0}
              label="Words Learned"
            />
            <SummaryStat
              value={progress?.lessonsCompleted || 0}
              label="Lessons Completed"
            />
            <SummaryStat
              value={Math.floor((progress?.totalStudyMinutes || 0) / 60)}
              label="Hours Studied"
            />
            <SummaryStat
              value={progress?.longestStreak || currentStreak}
              label="Longest Streak"
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Weekly Stat Component
interface WeeklyStatProps {
  icon: string;
  value: string;
  label: string;
}

const WeeklyStat: React.FC<WeeklyStatProps> = ({ icon, value, label }) => (
  <View style={styles.weeklyStat}>
    <Feather name={icon as any} size={18} color={colors.primary} />
    <Text style={styles.weeklyStatValue}>{value}</Text>
    <Text style={styles.weeklyStatLabel}>{label}</Text>
  </View>
);

// Summary Stat Component
interface SummaryStatProps {
  value: number;
  label: string;
}

const SummaryStat: React.FC<SummaryStatProps> = ({ value, label }) => (
  <View style={styles.summaryStat}>
    <Text style={styles.summaryStatValue}>{value}</Text>
    <Text style={styles.summaryStatLabel}>{label}</Text>
  </View>
);

// Helper functions
function getNextLevel(level: string): string {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const index = levels.indexOf(level);
  return levels[Math.min(index + 1, levels.length - 1)];
}

function getSkillProgressPercent(level: string | undefined): number {
  const progressMap: Record<string, number> = {
    'A1': 20,
    'A2': 40,
    'B1': 55,
    'B2': 70,
    'C1': 85,
    'C2': 100,
  };
  return progressMap[level || 'A1'] || 20;
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
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Level Card
  levelCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  levelLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  levelText: {
    fontSize: 48,
    fontWeight: '700',
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streakLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  levelProgress: {},
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  levelProgressLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  levelProgressPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // WRRS Card
  wrrsCard: {
    marginHorizontal: spacing.lg,
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
  wrrsScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  wrrsScoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wrrsScoreNumber: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.primary,
  },
  wrrsScoreLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  wrrsChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.lg,
    gap: spacing.xs,
  },
  wrrsChangeText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: '500',
  },
  wrrsDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Skills Card
  skillsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  skillsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  skillsList: {},

  // Weekly Card
  weeklyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weeklyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  weeklyDates: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  weeklyStat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  weeklyStatValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  weeklyStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  highlights: {
    gap: spacing.sm,
  },
  highlightItem: {
    backgroundColor: colors.successLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  highlightText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },

  // Challenge Card
  challengeCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  challengeInfo: {
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
  challengeDay: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  challengeDayNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  challengeStat: {
    alignItems: 'center',
  },
  challengeStatNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  challengeStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // Summary Card
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryStat: {
    width: (width - spacing.lg * 2 - spacing.md * 3) / 2,
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
