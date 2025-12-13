// Welcome Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/ui';
import { colors, spacing, typography, borderRadius } from '../../src/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>☕</Text>
            </View>
            <Text style={styles.title}>Café French</Text>
            <Text style={styles.subtitle}>
              Learn French like a local,{'\n'}one café at a time
            </Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <FeatureItem
              emoji="🎯"
              title="Evidence-Based Learning"
              description="Spaced repetition & retrieval practice"
            />
            <FeatureItem
              emoji="🗣️"
              title="AI Conversation Partner"
              description="Practice real-life scenarios"
            />
            <FeatureItem
              emoji="🎤"
              title="Pronunciation Coach"
              description="Phoneme-level feedback"
            />
            <FeatureItem
              emoji="📈"
              title="Track Your Progress"
              description="CEFR-aligned goals (A1→C2)"
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Get Started Free"
              onPress={() => router.push('/(auth)/register')}
              variant="secondary"
              size="large"
              fullWidth
            />
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" style={styles.loginLinkText}>
                Log In
              </Link>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

interface FeatureItemProps {
  emoji: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ emoji, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.fontSize.display,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
  },

  // Features
  features: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Actions
  actions: {
    gap: spacing.md,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSize.md,
  },
  loginLinkText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
});
