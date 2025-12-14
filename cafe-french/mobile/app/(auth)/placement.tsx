// Placement Test Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Card, ProgressBar } from '../../src/components/ui';
import { colors, spacing, typography, borderRadius } from '../../src/theme';

interface Question {
  id: string;
  type: 'vocabulary' | 'listening' | 'grammar';
  question: string;
  options: string[];
  correctIndex: number;
  level: string;
}

const PLACEMENT_QUESTIONS: Question[] = [
  {
    id: '1',
    type: 'vocabulary',
    question: 'What does "Bonjour" mean?',
    options: ['Goodbye', 'Hello/Good day', 'Thank you', 'Please'],
    correctIndex: 1,
    level: 'A1',
  },
  {
    id: '2',
    type: 'vocabulary',
    question: 'How do you say "thank you" in French?',
    options: ['S\'il vous plaît', 'Au revoir', 'Merci', 'Pardon'],
    correctIndex: 2,
    level: 'A1',
  },
  {
    id: '3',
    type: 'grammar',
    question: 'Complete: "Je ___ français."',
    options: ['suis', 'parle', 'est', 'va'],
    correctIndex: 1,
    level: 'A1',
  },
  {
    id: '4',
    type: 'vocabulary',
    question: 'What is "l\'eau"?',
    options: ['Fire', 'Air', 'Water', 'Earth'],
    correctIndex: 2,
    level: 'A1',
  },
  {
    id: '5',
    type: 'grammar',
    question: '"Les enfants" is:',
    options: ['The child', 'The children', 'A child', 'Some children'],
    correctIndex: 1,
    level: 'A2',
  },
];

export default function PlacementScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = PLACEMENT_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / PLACEMENT_QUESTIONS.length) * 100;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === question.correctIndex) {
      setCorrectAnswers((prev) => prev + 1);
    }

    if (currentQuestion < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleComplete = () => {
    router.replace('/(tabs)');
  };

  const getLevel = (): string => {
    const percentage = (correctAnswers / PLACEMENT_QUESTIONS.length) * 100;
    if (percentage >= 80) return 'A2';
    if (percentage >= 40) return 'A1';
    return 'A1';
  };

  if (showResult) {
    const level = getLevel();
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContent}>
          <View style={styles.resultIcon}>
            <Text style={styles.resultEmoji}>🎉</Text>
          </View>
          
          <Text style={styles.resultTitle}>Great job!</Text>
          <Text style={styles.resultSubtitle}>
            Based on your answers, we recommend starting at level:
          </Text>
          
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
          
          <Text style={styles.resultDescription}>
            {level === 'A1'
              ? "You're a beginner - that's perfect! We'll start with the basics and build your foundation."
              : "You have some basics down! We'll build on what you know."}
          </Text>
          
          <Button
            title="Start Learning"
            onPress={handleComplete}
            size="large"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipButton}>Skip</Text>
          </TouchableOpacity>
          <Text style={styles.questionCount}>
            {currentQuestion + 1} of {PLACEMENT_QUESTIONS.length}
          </Text>
        </View>
        <ProgressBar progress={progress} height={4} />
      </View>

      <View style={styles.content}>
        <View style={styles.questionContainer}>
          <View style={styles.questionType}>
            <Feather
              name={question.type === 'listening' ? 'headphones' : 'book'}
              size={16}
              color={colors.primary}
            />
            <Text style={styles.questionTypeText}>
              {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
            </Text>
          </View>
          
          <Text style={styles.question}>{question.question}</Text>
        </View>

        <View style={styles.options}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                selectedAnswer === index && styles.optionSelected,
              ]}
              onPress={() => handleAnswer(index)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.optionRadio,
                  selectedAnswer === index && styles.optionRadioSelected,
                ]}
              >
                {selectedAnswer === index && (
                  <View style={styles.optionRadioInner} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === index && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Next"
          onPress={handleNext}
          disabled={selectedAnswer === null}
          size="large"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
  questionCount: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  questionContainer: {
    marginBottom: spacing.xl,
  },
  questionType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  questionTypeText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  question: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 32,
  },

  // Options
  options: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: colors.primary,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '600',
  },

  // Footer
  footer: {
    padding: spacing.lg,
  },

  // Result
  resultContent: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  resultEmoji: {
    fontSize: 48,
  },
  resultTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  resultSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  levelBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  levelText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.white,
  },
  resultDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
