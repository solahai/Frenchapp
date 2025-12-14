// Mistakes/Error Tracking Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Card, ProgressBar } from '../src/components/ui';
import api from '../src/services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme';

type TabType = 'overview' | 'grammar' | 'vocabulary' | 'pronunciation';

export default function MistakesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Fetch mistake profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['mistakeProfile'],
    queryFn: () => api.getMistakeProfile(),
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['mistakeAnalytics'],
    queryFn: () => api.getMistakeAnalytics(),
  });

  // Generate workout
  const workoutMutation = useMutation({
    mutationFn: () => api.generateMistakeWorkout(),
    onSuccess: () => {
      router.push('/workout');
    },
  });

  const profile = profileData?.data?.profile;
  const analytics = analyticsData?.data?.analytics;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your mistake profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Mistakes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['overview', 'grammar', 'vocabulary', 'pronunciation'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <OverviewTab
            profile={profile}
            analytics={analytics}
            onStartWorkout={() => workoutMutation.mutate()}
            isLoading={workoutMutation.isPending}
          />
        )}
        
        {activeTab === 'grammar' && (
          <GrammarTab errors={profile?.grammarErrors || []} />
        )}
        
        {activeTab === 'vocabulary' && (
          <VocabularyTab confusions={profile?.vocabularyConfusions || []} />
        )}
        
        {activeTab === 'pronunciation' && (
          <PronunciationTab errors={profile?.pronunciationErrors || []} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Overview Tab
interface OverviewTabProps {
  profile: any;
  analytics: any;
  onStartWorkout: () => void;
  isLoading: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  analytics,
  onStartWorkout,
  isLoading,
}) => {
  const totalErrors = 
    (profile?.grammarErrors?.length || 0) +
    (profile?.vocabularyConfusions?.length || 0) +
    (profile?.pronunciationErrors?.length || 0);

  return (
    <View style={styles.content}>
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Feather name="target" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.summaryTitle}>Error Genome</Text>
            <Text style={styles.summarySubtitle}>Your personalized mistake profile</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.grammarErrors?.length || 0}</Text>
            <Text style={styles.statLabel}>Grammar</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.vocabularyConfusions?.length || 0}</Text>
            <Text style={styles.statLabel}>Vocabulary</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.pronunciationErrors?.length || 0}</Text>
            <Text style={styles.statLabel}>Pronunciation</Text>
          </View>
        </View>
      </Card>

      {/* Workout CTA */}
      {totalErrors > 0 && (
        <Card style={styles.workoutCard}>
          <View style={styles.workoutContent}>
            <Text style={styles.workoutEmoji}>💪</Text>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutTitle}>Mistake Workout</Text>
              <Text style={styles.workoutSubtitle}>
                Targeted practice for your top errors
              </Text>
            </View>
          </View>
          <Button
            title="Start Workout"
            onPress={onStartWorkout}
            loading={isLoading}
            size="small"
          />
        </Card>
      )}

      {/* Top Recurring Errors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Recurring Errors</Text>
        {profile?.topRecurringErrors?.map((error: any, i: number) => (
          <Card key={i} style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <View style={[styles.errorType, getErrorTypeStyle(error.type)]}>
                <Text style={styles.errorTypeText}>
                  {getErrorTypeLabel(error.type)}
                </Text>
              </View>
              <Text style={styles.errorCount}>{error.occurrences}x</Text>
            </View>
            <Text style={styles.errorDescription}>{error.pattern}</Text>
            {error.lastExample && (
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleWrong}>{error.lastExample.original}</Text>
                <Feather name="arrow-right" size={14} color={colors.textSecondary} />
                <Text style={styles.exampleCorrect}>{error.lastExample.corrected}</Text>
              </View>
            )}
          </Card>
        ))}
        
        {(!profile?.topRecurringErrors || profile.topRecurringErrors.length === 0) && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyText}>No recurring errors yet!</Text>
            <Text style={styles.emptySubtext}>
              Keep practicing and we'll track your patterns
            </Text>
          </Card>
        )}
      </View>

      {/* Trend */}
      {analytics?.weeklyTrend && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Trend</Text>
          <Card>
            <View style={styles.trendRow}>
              <View style={styles.trendItem}>
                <Feather
                  name={analytics.weeklyTrend > 0 ? 'trending-down' : 'trending-up'}
                  size={24}
                  color={analytics.weeklyTrend > 0 ? colors.success : colors.error}
                />
                <Text style={styles.trendNumber}>
                  {Math.abs(analytics.weeklyTrend)}%
                </Text>
              </View>
              <Text style={styles.trendLabel}>
                {analytics.weeklyTrend > 0
                  ? 'Error rate decreased this week!'
                  : 'Let\'s work on reducing errors'}
              </Text>
            </View>
          </Card>
        </View>
      )}
    </View>
  );
};

// Grammar Tab
interface GrammarTabProps {
  errors: any[];
}

const GrammarTab: React.FC<GrammarTabProps> = ({ errors }) => (
  <View style={styles.content}>
    {errors.map((error, i) => (
      <Card key={i} style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailCategory}>{error.category}</Text>
          <View style={styles.severityBadge}>
            <Text style={styles.severityText}>{error.totalOccurrences}x</Text>
          </View>
        </View>
        <Text style={styles.detailPattern}>{error.pattern}</Text>
        
        {error.instances?.slice(0, 2).map((instance: any, j: number) => (
          <View key={j} style={styles.instanceItem}>
            <Text style={styles.instanceWrong}>{instance.original}</Text>
            <Text style={styles.instanceCorrect}>{instance.corrected}</Text>
          </View>
        ))}
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress to mastery</Text>
          <ProgressBar
            progress={(error.correctStreak / 3) * 100}
            height={6}
            color={error.correctStreak >= 3 ? colors.success : colors.primary}
          />
          <Text style={styles.progressText}>{error.correctStreak}/3 correct in a row</Text>
        </View>
      </Card>
    ))}
    
    {errors.length === 0 && (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyEmoji}>📝</Text>
        <Text style={styles.emptyText}>No grammar errors tracked</Text>
        <Text style={styles.emptySubtext}>
          Practice conversations to track your progress
        </Text>
      </Card>
    )}
  </View>
);

// Vocabulary Tab
interface VocabularyTabProps {
  confusions: any[];
}

const VocabularyTab: React.FC<VocabularyTabProps> = ({ confusions }) => (
  <View style={styles.content}>
    {confusions.map((confusion, i) => (
      <Card key={i} style={styles.detailCard}>
        <View style={styles.confusionPair}>
          <View style={styles.confusionWord}>
            <Text style={styles.confusionWordText}>{confusion.word1}</Text>
          </View>
          <Feather name="repeat" size={20} color={colors.textSecondary} />
          <View style={styles.confusionWord}>
            <Text style={styles.confusionWordText}>{confusion.word2}</Text>
          </View>
        </View>
        
        <Text style={styles.confusionType}>{confusion.confusionType}</Text>
        <Text style={styles.confusionTip}>{confusion.clarification}</Text>
      </Card>
    ))}
    
    {confusions.length === 0 && (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyText}>No vocabulary confusions</Text>
        <Text style={styles.emptySubtext}>
          We'll track words you mix up as you learn
        </Text>
      </Card>
    )}
  </View>
);

// Pronunciation Tab
interface PronunciationTabProps {
  errors: any[];
}

const PronunciationTab: React.FC<PronunciationTabProps> = ({ errors }) => (
  <View style={styles.content}>
    {errors.map((error, i) => (
      <Card key={i} style={styles.detailCard}>
        <View style={styles.phonemeHeader}>
          <Text style={styles.phonemeSymbol}>{error.targetPhoneme}</Text>
          <View style={styles.phonemeInfo}>
            <Text style={styles.phonemeCategory}>{error.category}</Text>
            <Text style={styles.phonemeOccurrences}>{error.totalOccurrences} occurrences</Text>
          </View>
        </View>
        
        <View style={styles.phonemeExample}>
          <Text style={styles.phonemeWord}>{error.exampleWord}</Text>
          <TouchableOpacity style={styles.playIcon}>
            <Feather name="volume-2" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tipBox}>
          <Feather name="info" size={14} color={colors.info} />
          <Text style={styles.tipText}>{error.mouthPositionTip}</Text>
        </View>
      </Card>
    ))}
    
    {errors.length === 0 && (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyEmoji}>🎤</Text>
        <Text style={styles.emptyText}>No pronunciation issues</Text>
        <Text style={styles.emptySubtext}>
          Practice speaking to track your pronunciation
        </Text>
      </Card>
    )}
  </View>
);

// Helper functions
function getErrorTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    grammar: 'Grammar',
    vocabulary: 'Vocab',
    pronunciation: 'Pronunciation',
  };
  return labels[type] || type;
}

function getErrorTypeStyle(type: string) {
  const styles: Record<string, any> = {
    grammar: { backgroundColor: colors.primaryLight + '30' },
    vocabulary: { backgroundColor: colors.warningLight },
    pronunciation: { backgroundColor: colors.infoLight },
  };
  return styles[type] || {};
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  
  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  
  // Summary Card
  summaryCard: {},
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  summarySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  
  // Workout Card
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  workoutSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  // Section
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  // Error Card
  errorCard: {},
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  errorType: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  errorTypeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  errorCount: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.error,
  },
  errorDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  exampleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  exampleWrong: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textDecorationLine: 'line-through',
  },
  exampleCorrect: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: '500',
  },
  
  // Empty Card
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  
  // Trend
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  trendNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  trendLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  // Detail Card
  detailCard: {
    marginBottom: spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailCategory: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  severityBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  severityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.error,
  },
  detailPattern: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  instanceItem: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  instanceWrong: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textDecorationLine: 'line-through',
    marginBottom: spacing.xs,
  },
  instanceCorrect: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  // Confusion Pair
  confusionPair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  confusionWord: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confusionWordText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  confusionType: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  confusionTip: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Phoneme
  phonemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  phonemeSymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginRight: spacing.md,
  },
  phonemeInfo: {
    flex: 1,
  },
  phonemeCategory: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  phonemeOccurrences: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  phonemeExample: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  phonemeWord: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  playIcon: {
    padding: spacing.sm,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.info,
    lineHeight: 18,
  },
});
