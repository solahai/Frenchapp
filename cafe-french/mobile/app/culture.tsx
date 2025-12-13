// Culture Content Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../src/components/ui';
import api from '../src/services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ContentType = 'all' | 'video' | 'audio' | 'article' | 'song';

export default function CultureScreen() {
  const [selectedType, setSelectedType] = useState<ContentType>('all');

  // Fetch cultural content
  const { data: contentData, isLoading } = useQuery({
    queryKey: ['culturalContent', selectedType],
    queryFn: () => api.getCulturalContent('A1'),
  });

  // Fetch daily nugget
  const { data: nuggetData } = useQuery({
    queryKey: ['culturalNugget'],
    queryFn: () => api.getCulturalNugget('A1'),
  });

  const content = contentData?.data || [];
  const nugget = nuggetData?.data?.nugget;

  const contentTypes: { key: ContentType; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'grid' },
    { key: 'video', label: 'Videos', icon: 'video' },
    { key: 'audio', label: 'Audio', icon: 'headphones' },
    { key: 'article', label: 'Articles', icon: 'file-text' },
    { key: 'song', label: 'Songs', icon: 'music' },
  ];

  const filteredContent = selectedType === 'all'
    ? content
    : content.filter((item: any) => item.type === selectedType);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading culture library...</Text>
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
        <Text style={styles.headerTitle}>Culture</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Daily Nugget */}
        {nugget && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Culture Nugget</Text>
            <Card style={styles.nuggetCard}>
              <View style={styles.nuggetHeader}>
                <Text style={styles.nuggetEmoji}>{nugget.emoji || '🇫🇷'}</Text>
                <View style={styles.nuggetTopic}>
                  <Text style={styles.nuggetTopicText}>{nugget.topic}</Text>
                </View>
              </View>
              <Text style={styles.nuggetTitle}>{nugget.title}</Text>
              <Text style={styles.nuggetContent}>{nugget.content}</Text>
              
              {nugget.usefulPhrase && (
                <View style={styles.phraseBox}>
                  <Text style={styles.phraseLabel}>Useful Phrase</Text>
                  <Text style={styles.phraseFrench}>{nugget.usefulPhrase.french}</Text>
                  <Text style={styles.phraseEnglish}>{nugget.usefulPhrase.english}</Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Type Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {contentTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterButton,
                selectedType === type.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(type.key)}
            >
              <Feather
                name={type.icon}
                size={16}
                color={selectedType === type.key ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedType === type.key && styles.filterTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Grid */}
        <View style={styles.contentGrid}>
          {filteredContent.map((item: any, i: number) => (
            <ContentCard
              key={i}
              item={item}
              onPress={() => router.push(`/culture/${item.id}`)}
            />
          ))}

          {filteredContent.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>No content yet</Text>
              <Text style={styles.emptySubtitle}>
                Check back soon for more cultural content
              </Text>
            </View>
          )}
        </View>

        {/* Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Topics</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topicsContent}
          >
            {CULTURE_TOPICS.map((topic, i) => (
              <TouchableOpacity key={i} style={styles.topicCard}>
                <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                <Text style={styles.topicName}>{topic.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Regions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover France</Text>
          <View style={styles.regionsGrid}>
            {FRENCH_REGIONS.slice(0, 4).map((region, i) => (
              <TouchableOpacity key={i} style={styles.regionCard}>
                <Text style={styles.regionEmoji}>{region.emoji}</Text>
                <Text style={styles.regionName}>{region.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Content Card Component
interface ContentCardProps {
  item: any;
  onPress: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onPress }) => {
  const getTypeIcon = (type: string): keyof typeof Feather.glyphMap => {
    const icons: Record<string, keyof typeof Feather.glyphMap> = {
      video: 'play-circle',
      audio: 'headphones',
      article: 'file-text',
      song: 'music',
    };
    return icons[type] || 'book';
  };

  return (
    <TouchableOpacity style={styles.contentCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.contentThumbnail}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnailImage} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Feather name={getTypeIcon(item.type)} size={32} color={colors.textDisabled} />
          </View>
        )}
        <View style={styles.contentTypeBadge}>
          <Feather name={getTypeIcon(item.type)} size={12} color={colors.white} />
        </View>
        {item.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.contentMeta}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
          {item.topic && (
            <Text style={styles.topicText} numberOfLines={1}>
              {item.topic}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Static data
const CULTURE_TOPICS = [
  { name: 'Food & Wine', emoji: '🍷' },
  { name: 'Art & Museums', emoji: '🎨' },
  { name: 'History', emoji: '🏛️' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Cinema', emoji: '🎬' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Festivals', emoji: '🎉' },
];

const FRENCH_REGIONS = [
  { name: 'Paris', emoji: '🗼' },
  { name: 'Provence', emoji: '💜' },
  { name: 'Normandy', emoji: '🏖️' },
  { name: 'Alps', emoji: '🏔️' },
  { name: 'Bordeaux', emoji: '🍇' },
  { name: 'Brittany', emoji: '⚓' },
];

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
  
  scrollView: {
    flex: 1,
  },
  
  // Section
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  // Nugget
  nuggetCard: {},
  nuggetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nuggetEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  nuggetTopic: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  nuggetTopicText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    color: colors.primary,
  },
  nuggetTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  nuggetContent: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  phraseBox: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  phraseLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  phraseFrench: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  phraseEnglish: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  
  // Filters
  filterScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filterContent: {
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  
  // Content Grid
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  contentCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  contentThumbnail: {
    width: '100%',
    height: 100,
    backgroundColor: colors.surfaceVariant,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentTypeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  durationText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
  },
  contentInfo: {
    padding: spacing.sm,
  },
  contentTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  levelBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  levelText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.success,
  },
  topicText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  
  // Empty State
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  
  // Topics
  topicsContent: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  topicCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  topicEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  topicName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  
  // Regions
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  regionCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  regionEmoji: {
    fontSize: 24,
  },
  regionName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  
  bottomPadding: {
    height: spacing.xl * 2,
  },
});
