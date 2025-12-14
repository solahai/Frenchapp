// Practice Screen - Conversation and Speaking Practice

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Button } from '../../src/components/ui';
import api from '../../src/services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';

const PRACTICE_MODES = [
  {
    id: 'free_chat',
    title: 'Free Chat',
    description: 'Talk about anything',
    icon: '💬',
    color: colors.primary,
  },
  {
    id: 'hard_mode',
    title: 'Hard Mode',
    description: 'French only, no English!',
    icon: '🔥',
    color: colors.error,
  },
];

export default function PracticeScreen() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  // Fetch scenarios
  const { data: scenariosData } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => api.getConversationScenarios(),
  });

  // Fetch shadowing session
  const { data: shadowingData } = useQuery({
    queryKey: ['shadowing'],
    queryFn: () => api.getShadowingSession('A1', 5),
  });

  const handleStartConversation = (type: string, scenarioId?: string) => {
    router.push({
      pathname: '/conversation',
      params: { type, scenarioId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>
          <Text style={styles.subtitle}>Improve your speaking & listening</Text>
        </View>

        {/* AI Conversation Partner */}
        <Card style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>👩‍🏫</Text>
            </View>
            <View style={styles.mainCardInfo}>
              <Text style={styles.mainCardTitle}>Marie</Text>
              <Text style={styles.mainCardSubtitle}>Your AI Conversation Partner</Text>
            </View>
          </View>
          
          <Text style={styles.mainCardDescription}>
            Practice real-life scenarios with instant feedback on your grammar, 
            pronunciation, and vocabulary. Marie will help you improve naturally.
          </Text>
          
          <View style={styles.practiceModesContainer}>
            {PRACTICE_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.practiceMode,
                  selectedMode === mode.id && styles.practiceModeSelected,
                ]}
                onPress={() => setSelectedMode(mode.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.practiceModeIcon}>{mode.icon}</Text>
                <Text style={styles.practiceModeTitle}>{mode.title}</Text>
                <Text style={styles.practiceModeDesc}>{mode.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Button
            title="Start Conversation"
            onPress={() => handleStartConversation(selectedMode || 'free_chat')}
            size="large"
            fullWidth
          />
        </Card>

        {/* Scenario Practice */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scenario Practice</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Practice specific real-world situations
          </Text>
          
          <View style={styles.scenarios}>
            {scenariosData?.data?.map((scenario: any) => (
              <TouchableOpacity
                key={scenario.id}
                style={styles.scenarioCard}
                onPress={() => handleStartConversation('scenario_chat', scenario.id)}
                activeOpacity={0.8}
              >
                <View style={styles.scenarioIcon}>
                  <Text style={styles.scenarioEmoji}>
                    {getScenarioEmoji(scenario.id)}
                  </Text>
                </View>
                <View style={styles.scenarioContent}>
                  <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                  <Text style={styles.scenarioDesc}>{scenario.context}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pronunciation Practice */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pronunciation Practice</Text>
          </View>
          
          <Card style={styles.pronunciationCard}>
            <View style={styles.pronunciationHeader}>
              <View style={styles.pronunciationIcon}>
                <Feather name="mic" size={24} color={colors.speaking} />
              </View>
              <View style={styles.pronunciationInfo}>
                <Text style={styles.pronunciationTitle}>Accent Shadowing</Text>
                <Text style={styles.pronunciationSubtitle}>
                  Listen and repeat native phrases
                </Text>
              </View>
            </View>
            
            <View style={styles.shadowingStats}>
              <View style={styles.shadowingStat}>
                <Text style={styles.shadowingNumber}>
                  {shadowingData?.data?.session?.phrases?.length || 10}
                </Text>
                <Text style={styles.shadowingLabel}>Phrases</Text>
              </View>
              <View style={styles.shadowingDivider} />
              <View style={styles.shadowingStat}>
                <Text style={styles.shadowingNumber}>~5</Text>
                <Text style={styles.shadowingLabel}>Minutes</Text>
              </View>
            </View>
            
            <Button
              title="Start Shadowing"
              onPress={() => router.push('/pronunciation')}
              variant="outline"
              fullWidth
            />
          </Card>
        </View>

        {/* Weekly Challenge */}
        <Card style={styles.challengeCard}>
          <View style={styles.challengeContent}>
            <Text style={styles.challengeEmoji}>🎯</Text>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>Weekly Speaking Goal</Text>
              <Text style={styles.challengeProgress}>3/5 conversations this week</Text>
            </View>
          </View>
          <View style={styles.challengeBar}>
            <View style={[styles.challengeFill, { width: '60%' }]} />
          </View>
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Speaking Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Don't worry about mistakes - they help you learn!</Text>
            <Text style={styles.tipItem}>• Speak slowly and clearly at first</Text>
            <Text style={styles.tipItem}>• Try to think in French, not translate</Text>
            <Text style={styles.tipItem}>• Record yourself and compare to natives</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function getScenarioEmoji(id: string): string {
  const emojis: Record<string, string> = {
    'cafe-ordering': '☕',
    'restaurant': '🍽️',
    'directions': '🗺️',
    'doctor': '🏥',
    'shopping': '🛍️',
    'hotel': '🏨',
  };
  return emojis[id] || '💬';
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },

  // Main Card
  mainCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  mainCardInfo: {},
  mainCardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mainCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  mainCardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },

  // Practice Modes
  practiceModesContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  practiceMode: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  practiceModeSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  practiceModeIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  practiceModeTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  practiceModeDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  // Scenarios
  scenarios: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  scenarioIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioEmoji: {
    fontSize: 22,
  },
  scenarioContent: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scenarioDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // Pronunciation
  pronunciationCard: {
    marginHorizontal: spacing.lg,
  },
  pronunciationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pronunciationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.speaking + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pronunciationInfo: {},
  pronunciationTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pronunciationSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  shadowingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  shadowingStat: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  shadowingNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  shadowingLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  shadowingDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },

  // Challenge Card
  challengeCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  challengeEmoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  challengeInfo: {},
  challengeTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  challengeProgress: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  challengeBar: {
    height: 6,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },

  // Tips
  tipsCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.infoLight,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tipsList: {
    gap: spacing.xs,
  },
  tipItem: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
