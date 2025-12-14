// Settings Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';
import { Card } from '../src/components/ui';
import { colors, spacing, typography, borderRadius } from '../src/theme';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Notifications
    dailyReminder: true,
    reminderTime: '09:00',
    streakReminder: true,
    weeklyReport: true,
    
    // Learning
    autoPlayAudio: true,
    speechSpeed: 1.0,
    strictMode: false,
    showTranslations: true,
    
    // Accessibility
    largeText: false,
    highContrast: false,
    dyslexiaMode: false,
    reduceMotion: false,
    
    // Audio
    soundEffects: true,
    vibration: true,
    
    // Privacy
    analyticsEnabled: true,
    crashReporting: true,
    saveRecordings: false,
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingRow
            icon="bell"
            title="Daily Reminder"
            subtitle="Get reminded to practice"
          >
            <Switch
              value={settings.dailyReminder}
              onValueChange={(v) => updateSetting('dailyReminder', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          {settings.dailyReminder && (
            <SettingRow
              icon="clock"
              title="Reminder Time"
              subtitle={settings.reminderTime}
              onPress={() => {}}
            />
          )}
          
          <SettingRow
            icon="award"
            title="Streak Alerts"
            subtitle="Don't lose your streak"
          >
            <Switch
              value={settings.streakReminder}
              onValueChange={(v) => updateSetting('streakReminder', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="bar-chart-2"
            title="Weekly Report"
            subtitle="Get your progress summary"
          >
            <Switch
              value={settings.weeklyReport}
              onValueChange={(v) => updateSetting('weeklyReport', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
        </SettingsSection>

        {/* Learning */}
        <SettingsSection title="Learning">
          <SettingRow
            icon="volume-2"
            title="Auto-play Audio"
            subtitle="Play audio automatically"
          >
            <Switch
              value={settings.autoPlayAudio}
              onValueChange={(v) => updateSetting('autoPlayAudio', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="zap"
            title="Strict Mode"
            subtitle="Require exact answers"
          >
            <Switch
              value={settings.strictMode}
              onValueChange={(v) => updateSetting('strictMode', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="globe"
            title="Show Translations"
            subtitle="Display English translations"
          >
            <Switch
              value={settings.showTranslations}
              onValueChange={(v) => updateSetting('showTranslations', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
        </SettingsSection>

        {/* Accessibility */}
        <SettingsSection title="Accessibility">
          <SettingRow
            icon="type"
            title="Large Text"
            subtitle="Increase text size"
          >
            <Switch
              value={settings.largeText}
              onValueChange={(v) => updateSetting('largeText', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="sun"
            title="High Contrast"
            subtitle="Enhanced visual contrast"
          >
            <Switch
              value={settings.highContrast}
              onValueChange={(v) => updateSetting('highContrast', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="book-open"
            title="Dyslexia Mode"
            subtitle="Dyslexia-friendly font & spacing"
          >
            <Switch
              value={settings.dyslexiaMode}
              onValueChange={(v) => updateSetting('dyslexiaMode', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="minimize-2"
            title="Reduce Motion"
            subtitle="Minimize animations"
          >
            <Switch
              value={settings.reduceMotion}
              onValueChange={(v) => updateSetting('reduceMotion', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
        </SettingsSection>

        {/* Audio & Haptics */}
        <SettingsSection title="Audio & Haptics">
          <SettingRow
            icon="music"
            title="Sound Effects"
            subtitle="Play sounds for actions"
          >
            <Switch
              value={settings.soundEffects}
              onValueChange={(v) => updateSetting('soundEffects', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="smartphone"
            title="Vibration"
            subtitle="Haptic feedback"
          >
            <Switch
              value={settings.vibration}
              onValueChange={(v) => updateSetting('vibration', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy & Data">
          <SettingRow
            icon="activity"
            title="Analytics"
            subtitle="Help improve the app"
          >
            <Switch
              value={settings.analyticsEnabled}
              onValueChange={(v) => updateSetting('analyticsEnabled', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="alert-triangle"
            title="Crash Reporting"
            subtitle="Send crash reports"
          >
            <Switch
              value={settings.crashReporting}
              onValueChange={(v) => updateSetting('crashReporting', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="mic"
            title="Save Recordings"
            subtitle="Keep voice recordings for review"
          >
            <Switch
              value={settings.saveRecordings}
              onValueChange={(v) => updateSetting('saveRecordings', v)}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
          
          <SettingRow
            icon="download"
            title="Download My Data"
            subtitle="Export all your learning data"
            onPress={() => Alert.alert('Export', 'Your data will be prepared for download.')}
          />
          
          <SettingRow
            icon="trash-2"
            title="Clear Learning History"
            subtitle="Reset all progress"
            onPress={() => {
              Alert.alert(
                'Clear History',
                'This will reset all your learning progress. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive' },
                ]
              );
            }}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingRow
            icon="mail"
            title="Email"
            subtitle={user?.email || 'Not set'}
            onPress={() => {}}
          />
          
          <SettingRow
            icon="lock"
            title="Change Password"
            onPress={() => {}}
          />
          
          <SettingRow
            icon="log-out"
            title="Log Out"
            onPress={handleLogout}
            danger
          />
          
          <SettingRow
            icon="user-x"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            danger
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingRow
            icon="info"
            title="Version"
            subtitle="1.0.0 (Build 1)"
          />
          
          <SettingRow
            icon="file-text"
            title="Terms of Service"
            onPress={() => {}}
          />
          
          <SettingRow
            icon="shield"
            title="Privacy Policy"
            onPress={() => {}}
          />
          
          <SettingRow
            icon="heart"
            title="Rate the App"
            onPress={() => {}}
          />
          
          <SettingRow
            icon="message-circle"
            title="Send Feedback"
            onPress={() => {}}
          />
        </SettingsSection>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Settings Section Component
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Card style={styles.sectionCard}>{children}</Card>
  </View>
);

// Setting Row Component
interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  children?: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  danger,
  children,
}) => {
  const content = (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Feather
          name={icon}
          size={18}
          color={danger ? colors.error : colors.textSecondary}
        />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {children}
      {onPress && !children && (
        <Feather name="chevron-right" size={18} color={colors.textDisabled} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  
  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingIconDanger: {
    backgroundColor: colors.errorLight,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  settingTitleDanger: {
    color: colors.error,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  bottomPadding: {
    height: spacing.xl * 2,
  },
});
