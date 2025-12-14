// Profile Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Card } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { colors, spacing, typography, borderRadius, shadows, getLevelColor } from '../../src/theme';

const MENU_ITEMS = [
  {
    section: 'Learning',
    items: [
      { id: 'preferences', icon: 'sliders', title: 'Learning Preferences', subtitle: 'Goals, daily time, topics' },
      { id: 'notifications', icon: 'bell', title: 'Notifications', subtitle: 'Reminders and alerts' },
      { id: 'offline', icon: 'download', title: 'Offline Content', subtitle: 'Download lessons for offline use' },
    ],
  },
  {
    section: 'Accessibility',
    items: [
      { id: 'accessibility', icon: 'eye', title: 'Accessibility', subtitle: 'Font size, dyslexia mode' },
      { id: 'audio', icon: 'volume-2', title: 'Audio Settings', subtitle: 'Speech rate, voice' },
    ],
  },
  {
    section: 'Account',
    items: [
      { id: 'subscription', icon: 'credit-card', title: 'Subscription', subtitle: 'Manage your plan' },
      { id: 'data', icon: 'database', title: 'Your Data', subtitle: 'Export or delete data' },
      { id: 'support', icon: 'help-circle', title: 'Help & Support', subtitle: 'FAQs, contact us' },
      { id: 'about', icon: 'info', title: 'About', subtitle: 'Version 2.0.0' },
    ],
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const level = user?.profile?.currentLevel || 'A1';

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const handleMenuItem = (id: string) => {
    // Navigate to settings screens
    console.log('Navigate to:', id);
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
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || 'Learner'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Feather name="edit-2" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(level) + '20' }]}>
                <Text style={[styles.levelText, { color: getLevelColor(level) }]}>{level}</Text>
              </View>
              <Text style={styles.profileStatLabel}>Level</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {user?.profile?.currentStreak || 0}
              </Text>
              <Text style={styles.profileStatLabel}>Day Streak</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {Math.floor((user?.profile?.totalStudyTimeMinutes || 0) / 60)}h
              </Text>
              <Text style={styles.profileStatLabel}>Study Time</Text>
            </View>
          </View>
        </Card>

        {/* Subscription Banner */}
        {user?.preferences?.tier === 'free' && (
          <TouchableOpacity style={styles.premiumBanner} activeOpacity={0.9}>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumEmoji}>✨</Text>
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumSubtitle}>
                  Unlock all features and accelerate your learning
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={24} color={colors.white} />
          </TouchableOpacity>
        )}

        {/* Menu Sections */}
        {MENU_ITEMS.map((section) => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <Card padding="none" style={styles.menuCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => handleMenuItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemIcon}>
                    <Feather name={item.icon as any} size={20} color={colors.textSecondary} />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Café French v2.0.0</Text>
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
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Profile Card
  profileCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  levelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  levelText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
  profileStatValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  profileStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // Premium Banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  premiumContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumEmoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  premiumInfo: {},
  premiumTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
  premiumSubtitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },

  // Menu Section
  menuSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  menuCard: {},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  menuItemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.error,
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.textDisabled,
    marginTop: spacing.lg,
  },
});
