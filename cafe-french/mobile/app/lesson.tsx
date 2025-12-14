// Daily Lesson Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Card, ProgressBar } from '../src/components/ui';
import { useLearningStore } from '../src/store/learningStore';
import api from '../src/services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme';

export default function LessonScreen() {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);
  const { setCurrentLesson, completeActivity } = useLearningStore();

  // Fetch daily lesson
  const { data: lessonData, isLoading } = useQuery({
    queryKey: ['dailyLesson'],
    queryFn: () => api.getDailyLesson(),
  });

  const lesson = lessonData?.data?.lesson;
  const section = lesson?.sections?.[currentSection];
  const activity = section?.activities?.[currentActivity];

  // Calculate progress
  const totalActivities = lesson?.sections?.reduce(
    (sum: number, s: any) => sum + (s.activities?.length || 0),
    0
  ) || 0;
  
  const completedActivities = lesson?.sections?.reduce(
    (sum: number, s: any) => sum + (s.activities?.filter((a: any) => a.completed)?.length || 0),
    0
  ) || 0;

  const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  // Complete lesson mutation
  const completeLessonMutation = useMutation({
    mutationFn: (metrics: any) => api.completeLesson(lesson.id, metrics),
    onSuccess: () => {
      Alert.alert(
        '🎉 Lesson Complete!',
        'Great work! You\'ve completed today\'s lesson.',
        [{ text: 'Continue', onPress: () => router.back() }]
      );
    },
  });

  const handleStartLesson = async () => {
    if (lesson) {
      await api.startLesson(lesson.id);
      setLessonStarted(true);
    }
  };

  const handleActivityComplete = async (score: number) => {
    if (!activity) return;

    // Mark activity complete
    completeActivity(activity.id, score);
    
    // Move to next activity
    if (currentActivity < (section?.activities?.length || 0) - 1) {
      setCurrentActivity(currentActivity + 1);
    } else if (currentSection < (lesson?.sections?.length || 0) - 1) {
      // Move to next section
      setCurrentSection(currentSection + 1);
      setCurrentActivity(0);
    } else {
      // Lesson complete
      completeLessonMutation.mutate({
        totalTimeSpent: 1200, // Placeholder - would track actual time
        activitiesCompleted: totalActivities,
        averageScore: 85,
      });
    }
  };

  const handleClose = () => {
    if (lessonStarted && progress < 100) {
      Alert.alert(
        'Leave Lesson?',
        'Your progress will be saved.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparing your lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lessonStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.introContent}
        >
          <View style={styles.introHeader}>
            <Text style={styles.introEmoji}>📚</Text>
            <Text style={styles.introTitle}>Today's Lesson</Text>
            <Text style={styles.introSubtitle}>
              {lesson?.culturalNugget?.title || 'French Practice'}
            </Text>
          </View>

          <View style={styles.lessonPreview}>
            {/* Vocabulary Preview */}
            <Card style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewEmoji}>🗣️</Text>
                <Text style={styles.previewTitle}>
                  {lesson?.vocabulary?.length || 8} New Words
                </Text>
              </View>
              <View style={styles.vocabPreview}>
                {lesson?.vocabulary?.slice(0, 4).map((word: any, i: number) => (
                  <View key={i} style={styles.vocabItem}>
                    <Text style={styles.vocabFrench}>{word.french}</Text>
                    <Text style={styles.vocabEnglish}>{word.english}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Grammar Preview */}
            <Card style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewEmoji}>📝</Text>
                <Text style={styles.previewTitle}>Grammar Focus</Text>
              </View>
              <Text style={styles.grammarTitle}>
                {lesson?.grammarRule?.title || 'Grammar Rule'}
              </Text>
            </Card>

            {/* Conversation Preview */}
            <Card style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewEmoji}>💬</Text>
                <Text style={styles.previewTitle}>Café Mini-Chat</Text>
              </View>
              <Text style={styles.conversationDesc}>
                Practice what you've learned in a real scenario
              </Text>
            </Card>
          </View>

          <View style={styles.timeEstimate}>
            <Feather name="clock" size={18} color={colors.textSecondary} />
            <Text style={styles.timeText}>About 20 minutes</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Start Lesson"
            onPress={handleStartLesson}
            size="large"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} height={4} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {/* Section Indicator */}
      <View style={styles.sectionIndicator}>
        <Text style={styles.sectionTitle}>{section?.title}</Text>
        <Text style={styles.sectionActivity}>
          {currentActivity + 1} / {section?.activities?.length}
        </Text>
      </View>

      {/* Activity Content */}
      <ScrollView style={styles.activityContainer}>
        {activity && (
          <ActivityRenderer
            activity={activity}
            onComplete={handleActivityComplete}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Activity Renderer Component
interface ActivityRendererProps {
  activity: any;
  onComplete: (score: number) => void;
}

const ActivityRenderer: React.FC<ActivityRendererProps> = ({ activity, onComplete }) => {
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = () => {
    const isCorrect = userAnswer === activity.content?.correctAnswer;
    setShowFeedback(true);
    
    setTimeout(() => {
      onComplete(isCorrect ? 100 : 50);
      setShowFeedback(false);
      setUserAnswer(null);
    }, 1500);
  };

  // Vocabulary Introduction
  if (activity.type === 'vocabulary_intro') {
    return (
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>New Vocabulary</Text>
        <Text style={styles.activityInstructions}>{activity.instructions}</Text>
        
        <View style={styles.vocabList}>
          {activity.content?.vocabularyItems?.map((item: any, i: number) => (
            <Card key={i} style={styles.vocabCard}>
              <View style={styles.vocabCardHeader}>
                <Text style={styles.vocabCardFrench}>{item.french}</Text>
                <TouchableOpacity>
                  <Feather name="volume-2" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.vocabCardIpa}>{item.ipa}</Text>
              <Text style={styles.vocabCardEnglish}>{item.english}</Text>
              {item.example && (
                <Text style={styles.vocabCardExample}>"{item.example}"</Text>
              )}
            </Card>
          ))}
        </View>
        
        <Button
          title="I've learned these"
          onPress={() => onComplete(100)}
          size="large"
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  // Grammar Explanation
  if (activity.type === 'grammar_explanation') {
    const rule = activity.content?.rule;
    return (
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{rule?.title}</Text>
        
        <Card style={styles.grammarCard}>
          <Text style={styles.grammarLabel}>What it means:</Text>
          <Text style={styles.grammarText}>{rule?.explanation}</Text>
        </Card>
        
        {rule?.examples && (
          <View style={styles.grammarExamples}>
            <Text style={styles.grammarLabel}>Examples:</Text>
            {rule.examples.map((ex: any, i: number) => (
              <View key={i} style={styles.grammarExample}>
                <Text style={styles.exampleFrench}>{ex.french}</Text>
                <Text style={styles.exampleEnglish}>{ex.english}</Text>
              </View>
            ))}
          </View>
        )}
        
        <Button
          title="Got it!"
          onPress={() => onComplete(100)}
          size="large"
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  // Default activity with options
  return (
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{activity.type.replace(/_/g, ' ')}</Text>
      <Text style={styles.activityInstructions}>{activity.instructions}</Text>
      
      {activity.content?.prompt && (
        <Card style={styles.promptCard}>
          <Text style={styles.promptText}>{activity.content.prompt}</Text>
        </Card>
      )}
      
      {activity.content?.options && (
        <View style={styles.optionsList}>
          {activity.content.options.map((option: string, i: number) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionButton,
                userAnswer === option && styles.optionSelected,
                showFeedback && option === activity.content.correctAnswer && styles.optionCorrect,
                showFeedback && userAnswer === option && option !== activity.content.correctAnswer && styles.optionIncorrect,
              ]}
              onPress={() => !showFeedback && setUserAnswer(option)}
              disabled={showFeedback}
            >
              <Text style={[
                styles.optionText,
                userAnswer === option && styles.optionTextSelected,
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <Button
        title="Check Answer"
        onPress={handleSubmit}
        disabled={!userAnswer || showFeedback}
        size="large"
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );
};

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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'right',
  },
  
  // Intro
  scrollView: {
    flex: 1,
  },
  introContent: {
    padding: spacing.lg,
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  introEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  introSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  
  // Preview
  lessonPreview: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  previewCard: {},
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  previewEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  previewTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  vocabPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  vocabItem: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  vocabFrench: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  vocabEnglish: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  grammarTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  conversationDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  // Section
  sectionIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceVariant,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionActivity: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  // Activity
  activityContainer: {
    flex: 1,
  },
  activityContent: {
    padding: spacing.lg,
  },
  activityTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: 'capitalize',
  },
  activityInstructions: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  
  // Vocab Cards
  vocabList: {
    gap: spacing.md,
  },
  vocabCard: {},
  vocabCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  vocabCardFrench: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  vocabCardIpa: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  vocabCardEnglish: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  vocabCardExample: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  // Grammar
  grammarCard: {
    marginBottom: spacing.lg,
  },
  grammarLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  grammarText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  grammarExamples: {
    gap: spacing.md,
  },
  grammarExample: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  exampleFrench: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  exampleEnglish: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  // Prompt
  promptCard: {
    backgroundColor: colors.primaryLight + '10',
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: spacing.lg,
  },
  promptText: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  // Options
  optionsList: {
    gap: spacing.sm,
  },
  optionButton: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  optionIncorrect: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  optionText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
});
