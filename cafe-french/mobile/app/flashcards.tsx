// Flashcards Screen

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, ProgressBar } from '../src/components/ui';
import { useLearningStore } from '../src/store/learningStore';
import api from '../src/services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function FlashcardsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  const { reviewSession, reviewCard, setDueCards, resetReviewSession } = useLearningStore();
  
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Fetch due cards
  const { data: cardsData, isLoading, refetch } = useQuery({
    queryKey: ['dueCards'],
    queryFn: () => api.getDueCards(50),
  });

  // Set due cards when data is loaded
  useEffect(() => {
    if (cardsData?.data?.cards) {
      setDueCards(cardsData.data.cards);
    }
  }, [cardsData]);

  // Submit review
  const reviewMutation = useMutation({
    mutationFn: ({ cardId, quality }: { cardId: string; quality: number }) =>
      api.submitReview(cardId, quality, 10),
  });

  const cards = cardsData?.data?.cards || [];
  const currentCard = cards[currentIndex];

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          handleSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handleSwipe('left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipe = (direction: 'left' | 'right') => {
    const quality = direction === 'right' ? 4 : 1; // Easy = 4, Hard = 1
    
    Animated.timing(position, {
      toValue: { x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentCard) {
        reviewCard(currentCard.id, quality >= 3);
        reviewMutation.mutate({ cardId: currentCard.id, quality });
      }
      
      if (currentIndex >= cards.length - 1) {
        setSessionComplete(true);
      } else {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        position.setValue({ x: 0, y: 0 });
        flipAnim.setValue(0);
      }
    });
  };

  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: showAnswer ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowAnswer(!showAnswer);
  };

  const handleQualityButton = (quality: number) => {
    if (currentCard) {
      reviewCard(currentCard.id, quality >= 3);
      reviewMutation.mutate({ cardId: currentCard.id, quality });
    }

    if (currentIndex >= cards.length - 1) {
      setSessionComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      position.setValue({ x: 0, y: 0 });
      flipAnim.setValue(0);
    }
  };

  const handleRestart = () => {
    resetReviewSession();
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionComplete(false);
    refetch();
  };

  // Interpolations
  const rotateCard = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const flipFront = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });

  const flipBack = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['90deg', '90deg', '0deg'],
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading cards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            No cards due for review right now.{'\n'}Check back later or learn new content.
          </Text>
          <Button
            title="Back to Home"
            onPress={() => router.back()}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (sessionComplete) {
    const correctRate = reviewSession.totalCards > 0
      ? Math.round((reviewSession.correctCount / reviewSession.cardsReviewed) * 100)
      : 0;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎊</Text>
          <Text style={styles.completeTitle}>Session Complete!</Text>
          
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reviewSession.cardsReviewed}</Text>
              <Text style={styles.statLabel}>Cards Reviewed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {correctRate}%
              </Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
          </View>

          <View style={styles.completeActions}>
            <Button
              title="Review More"
              onPress={handleRestart}
              variant="outline"
              fullWidth
            />
            <Button
              title="Done"
              onPress={() => router.back()}
              fullWidth
            />
          </View>
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
          <ProgressBar
            progress={((currentIndex + 1) / cards.length) * 100}
            height={4}
          />
        </View>
        <Text style={styles.counterText}>
          {currentIndex + 1}/{cards.length}
        </Text>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { rotate: rotateCard },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={handleFlip}
            activeOpacity={0.95}
          >
            {/* Front of card */}
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardFront,
                { transform: [{ rotateY: flipFront }] },
              ]}
            >
              <View style={styles.cardTypeTag}>
                <Text style={styles.cardTypeText}>
                  {getCardTypeLabel(currentCard?.type)}
                </Text>
              </View>
              <Text style={styles.cardContent}>
                {typeof currentCard?.front === 'object' 
                  ? currentCard.front.text 
                  : currentCard?.front}
              </Text>
              <Text style={styles.tapHint}>Tap to flip</Text>
            </Animated.View>

            {/* Back of card */}
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardBack,
                { transform: [{ rotateY: flipBack }] },
              ]}
            >
              <Text style={styles.cardAnswer}>
                {typeof currentCard?.back === 'object'
                  ? currentCard.back.text
                  : currentCard?.back}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Swipe hints */}
        <View style={styles.swipeHints}>
          <View style={[styles.swipeHint, styles.swipeLeft]}>
            <Feather name="x" size={20} color={colors.error} />
            <Text style={[styles.swipeHintText, { color: colors.error }]}>Again</Text>
          </View>
          <View style={[styles.swipeHint, styles.swipeRight]}>
            <Feather name="check" size={20} color={colors.success} />
            <Text style={[styles.swipeHintText, { color: colors.success }]}>Got it</Text>
          </View>
        </View>
      </View>

      {/* Quality buttons */}
      {showAnswer && (
        <View style={styles.qualityButtons}>
          <TouchableOpacity
            style={[styles.qualityButton, styles.qualityAgain]}
            onPress={() => handleQualityButton(1)}
          >
            <Text style={styles.qualityButtonText}>Again</Text>
            <Text style={styles.qualityButtonSubtext}>&lt;1m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.qualityButton, styles.qualityHard]}
            onPress={() => handleQualityButton(2)}
          >
            <Text style={styles.qualityButtonText}>Hard</Text>
            <Text style={styles.qualityButtonSubtext}>10m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.qualityButton, styles.qualityGood]}
            onPress={() => handleQualityButton(4)}
          >
            <Text style={styles.qualityButtonText}>Good</Text>
            <Text style={styles.qualityButtonSubtext}>1d</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.qualityButton, styles.qualityEasy]}
            onPress={() => handleQualityButton(5)}
          >
            <Text style={styles.qualityButtonText}>Easy</Text>
            <Text style={styles.qualityButtonSubtext}>4d</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function getCardTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'l1_to_l2': '🇬🇧→🇫🇷',
    'l2_to_l1': '🇫🇷→🇬🇧',
    'audio_recognition': '🔊',
    'cloze': 'Fill blank',
    'speaking': '🎤',
  };
  return labels[type] || type;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Loading/Empty
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
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
  
  // Card
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: SCREEN_HEIGHT * 0.45,
    ...shadows.lg,
  },
  cardTouchable: {
    flex: 1,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardFront: {},
  cardBack: {
    backgroundColor: colors.primary,
  },
  cardTypeTag: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  cardTypeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  cardContent: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardAnswer: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  tapHint: {
    position: 'absolute',
    bottom: spacing.lg,
    fontSize: typography.fontSize.sm,
    color: colors.textDisabled,
  },
  
  // Swipe hints
  swipeHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    opacity: 0.5,
  },
  swipeLeft: {},
  swipeRight: {},
  swipeHintText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  
  // Quality buttons
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  qualityAgain: {
    backgroundColor: colors.errorLight,
  },
  qualityHard: {
    backgroundColor: colors.warningLight,
  },
  qualityGood: {
    backgroundColor: colors.infoLight,
  },
  qualityEasy: {
    backgroundColor: colors.successLight,
  },
  qualityButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  qualityButtonSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  statNumber: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  completeActions: {
    width: '100%',
    gap: spacing.sm,
  },
});
