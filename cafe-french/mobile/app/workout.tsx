// Mistake Workout Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Card, ProgressBar } from '../src/components/ui';
import api from '../src/services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme';

export default function WorkoutScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  // Fetch workout
  const { data: workoutData, isLoading } = useQuery({
    queryKey: ['mistakeWorkout'],
    queryFn: () => api.generateMistakeWorkout(),
  });

  // Complete workout
  const completeMutation = useMutation({
    mutationFn: () =>
      api.completeMistakeWorkout(workout?.id, {
        exercisesCompleted: results.total,
        correctAnswers: results.correct,
        timeSpent: 600, // Placeholder
      }),
    onSuccess: () => {
      setIsComplete(true);
    },
  });

  const workout = workoutData?.data?.workout;
  const exercises = workout?.exercises || [];
  const currentExercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  const handleSubmit = () => {
    if (!userAnswer) return;

    const isCorrect = userAnswer === currentExercise?.content?.correctAnswer;
    setShowFeedback(true);
    setResults({
      correct: results.correct + (isCorrect ? 1 : 0),
      total: results.total + 1,
    });
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer(null);
      setShowFeedback(false);
    } else {
      completeMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating your workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout || exercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>No workout needed!</Text>
          <Text style={styles.emptySubtitle}>
            You don't have enough tracked errors yet.{'\n'}
            Keep practicing and we'll create targeted workouts.
          </Text>
          <Button
            title="Back"
            onPress={() => router.back()}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    const percentage = Math.round((results.correct / results.total) * 100);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>💪</Text>
          <Text style={styles.completeTitle}>Workout Complete!</Text>
          
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>Accuracy</Text>
          </View>
          
          <View style={styles.resultsCard}>
            <View style={styles.resultItem}>
              <Text style={styles.resultNumber}>{results.correct}</Text>
              <Text style={styles.resultLabel}>Correct</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultItem}>
              <Text style={[styles.resultNumber, { color: colors.error }]}>
                {results.total - results.correct}
              </Text>
              <Text style={styles.resultLabel}>To Review</Text>
            </View>
          </View>
          
          <Text style={styles.encouragement}>
            {percentage >= 80
              ? "Excellent! You're mastering these patterns!"
              : percentage >= 60
              ? "Good progress! Keep practicing these areas."
              : "Keep at it! These exercises will help you improve."}
          </Text>
          
          <Button
            title="Done"
            onPress={() => router.back()}
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
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Feather name="x" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} height={4} />
        </View>
        <Text style={styles.counterText}>
          {currentIndex + 1}/{exercises.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Error Info */}
        <View style={styles.errorInfo}>
          <View style={styles.errorBadge}>
            <Text style={styles.errorBadgeText}>
              {getExerciseTypeLabel(currentExercise?.type)}
            </Text>
          </View>
          {currentExercise?.targetError && (
            <Text style={styles.targetError}>
              Focus: {currentExercise.targetError}
            </Text>
          )}
        </View>

        {/* Prompt */}
        <Card style={styles.promptCard}>
          <Text style={styles.promptText}>
            {currentExercise?.content?.prompt}
          </Text>
        </Card>

        {/* Options */}
        {currentExercise?.content?.options && (
          <View style={styles.optionsList}>
            {currentExercise.content.options.map((option: string, i: number) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.optionButton,
                  userAnswer === option && styles.optionSelected,
                  showFeedback &&
                    option === currentExercise.content.correctAnswer &&
                    styles.optionCorrect,
                  showFeedback &&
                    userAnswer === option &&
                    option !== currentExercise.content.correctAnswer &&
                    styles.optionIncorrect,
                ]}
                onPress={() => !showFeedback && setUserAnswer(option)}
                disabled={showFeedback}
              >
                <Text
                  style={[
                    styles.optionText,
                    userAnswer === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {showFeedback && option === currentExercise.content.correctAnswer && (
                  <Feather name="check" size={20} color={colors.success} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Feedback */}
        {showFeedback && (
          <Card
            style={[
              styles.feedbackCard,
              userAnswer === currentExercise?.content?.correctAnswer
                ? styles.feedbackCorrect
                : styles.feedbackIncorrect,
            ]}
          >
            {userAnswer === currentExercise?.content?.correctAnswer ? (
              <>
                <View style={styles.feedbackHeader}>
                  <Feather name="check-circle" size={24} color={colors.success} />
                  <Text style={styles.feedbackTitle}>Correct!</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.feedbackHeader}>
                  <Feather name="x-circle" size={24} color={colors.error} />
                  <Text style={[styles.feedbackTitle, { color: colors.error }]}>
                    Not quite
                  </Text>
                </View>
                <Text style={styles.feedbackExplanation}>
                  The correct answer is: {currentExercise?.content?.correctAnswer}
                </Text>
              </>
            )}
            {currentExercise?.content?.explanation && (
              <Text style={styles.feedbackExplanation}>
                {currentExercise.content.explanation}
              </Text>
            )}
          </Card>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        {!showFeedback ? (
          <Button
            title="Check Answer"
            onPress={handleSubmit}
            disabled={!userAnswer}
            fullWidth
            size="large"
          />
        ) : (
          <Button
            title={currentIndex < exercises.length - 1 ? 'Next' : 'Complete'}
            onPress={handleNext}
            fullWidth
            size="large"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function getExerciseTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    fill_blank: 'Fill in the Blank',
    multiple_choice: 'Multiple Choice',
    translation: 'Translation',
    error_correction: 'Error Correction',
    conjugation: 'Conjugation',
    gender_agreement: 'Gender Agreement',
  };
  return labels[type] || type?.replace(/_/g, ' ') || 'Exercise';
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
  
  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
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
  counterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
  
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  
  // Error Info
  errorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  errorBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.error,
    textTransform: 'capitalize',
  },
  targetError: {
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
    lineHeight: 26,
  },
  
  // Options
  optionsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  
  // Feedback
  feedbackCard: {
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  feedbackIncorrect: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  feedbackTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.success,
  },
  feedbackExplanation: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  
  // Footer
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  // Complete
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  completeTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    marginBottom: spacing.lg,
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  resultsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  resultNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.success,
  },
  resultLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  encouragement: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
});
