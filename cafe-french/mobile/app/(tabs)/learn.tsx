// Learn Screen - Access all learning content

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';
import { colors, spacing, typography, borderRadius, shadows, getLevelColor } from '../../src/theme';

const LEARNING_MODULES = [
  {
    id: 'lesson',
    title: 'Daily Lesson',
    description: 'Your personalized 20-min lesson',
    icon: '📚',
    color: colors.primary,
    route: '/lesson',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Spaced repetition practice',
    icon: '🗃️',
    color: colors.accent,
    route: '/flashcards',
  },
  {
    id: 'conversation',
    title: 'Café Chat',
    description: 'AI conversation partner',
    icon: '💬',
    color: colors.secondary,
    route: '/conversation',
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation Lab',
    description: 'Perfect your accent',
    icon: '🎤',
    color: colors.speaking,
    route: '/pronunciation',
  },
  {
    id: 'grammar',
    title: 'Grammar Simplifier',
    description: 'Kid-simple explanations',
    icon: '📝',
    color: colors.writing,
    route: '/grammar',
  },
  {
    id: 'culture',
    title: 'Culture Corner',
    description: 'Authentic French content',
    icon: '🇫🇷',
    color: colors.listening,
    route: '/culture',
  },
];

const VOCABULARY_THEMES = [
  { id: 'cafe', name: 'Café & Restaurant', emoji: '☕', count: 80 },
  { id: 'travel', name: 'Travel', emoji: '✈️', count: 100 },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', count: 70 },
  { id: 'health', name: 'Health', emoji: '🏥', count: 85 },
  { id: 'work', name: 'Work', emoji: '💼', count: 95 },
  { id: 'family', name: 'Family', emoji: '👨‍👩‍👧', count: 60 },
];

export default function LearnScreen() {
  const user = useAuthStore((state) => state.user);
  const level = user?.profile?.currentLevel || 'A1';

  // Fetch SRS stats
  const { data: srsData } = useQuery({
    queryKey: ['srsStats'],
    queryFn: () => api.getSRSStats(),
  });

  // Fetch grammar rules
  const { data: grammarData } = useQuery({
    queryKey: ['grammarRules', level],
    queryFn: () => api.getGrammarRules(level),
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Learn</Text>
          <View style={styles.levelBadge}>
            <Text style={[styles.levelText, { color: getLevelColor(level) }]}>
              {level}
            </Text>
          </View>
        </View>

        {/* Learning Modules */}
        <View style={styles.modules}>
          {LEARNING_MODULES.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => router.push(module.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.moduleIcon, { backgroundColor: module.color + '20' }]}>
                <Text style={styles.moduleEmoji}>{module.icon}</Text>
              </View>
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Vocabulary Themes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vocabulary Themes</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesScroll}
          >
            {VOCABULARY_THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={styles.themeCard}
                activeOpacity={0.8}
              >
                <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                <Text style={styles.themeName}>{theme.name}</Text>
                <Text style={styles.themeCount}>{theme.count} words</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SRS Stats */}
        {srsData?.data && (
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Flashcard Stats</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{srsData.data.newCount}</Text>
                <Text style={styles.statLabel}>New</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{srsData.data.learningCount}</Text>
                <Text style={styles.statLabel}>Learning</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{srsData.data.reviewCount}</Text>
                <Text style={styles.statLabel}>Reviewing</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {srsData.data.retention7Days}%
                </Text>
                <Text style={styles.statLabel}>Retention</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Grammar Rules Preview */}
        {grammarData?.data && grammarData.data.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Grammar for {level}</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.grammarList}>
              {grammarData.data.slice(0, 3).map((rule: any) => (
                <TouchableOpacity
                  key={rule.id}
                  style={styles.grammarItem}
                  activeOpacity={0.8}
                >
                  <View style={styles.grammarIcon}>
                    <Feather name="book" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.grammarContent}>
                    <Text style={styles.grammarTitle}>{rule.title}</Text>
                    <Text style={styles.grammarCategory}>{rule.category}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  levelBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  levelText: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
  },

  // Modules
  modules: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleEmoji: {
    fontSize: 24,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  moduleDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },

  // Themes
  themesScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  themeCard: {
    width: 120,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  themeEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  themeName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  themeCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // Stats Card
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // Grammar
  grammarList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  grammarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  grammarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grammarContent: {
    flex: 1,
  },
  grammarTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  grammarCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});
