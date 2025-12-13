// Register Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';
import { colors, spacing, typography, borderRadius } from '../../src/theme';

const LEARNING_GOALS = [
  { id: 'travel', label: '✈️ Travel', description: 'Order food, ask directions' },
  { id: 'daily_life', label: '🏠 Daily Life', description: 'Conversations, errands' },
  { id: 'work', label: '💼 Work', description: 'Professional French' },
  { id: 'test_prep', label: '📝 Test Prep', description: 'DELF/TEF/TCF exams' },
];

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('daily_life');
  const [loading, setLoading] = useState(false);

  const { setUser, setTokens } = useAuthStore();

  const handleNext = () => {
    if (step === 1) {
      if (!name || !email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      if (password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters');
        return;
      }
      setStep(2);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await api.register({
        email,
        password,
        displayName: name,
        learningGoal: selectedGoal,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        await setTokens(response.data.accessToken, response.data.refreshToken);
        router.replace('/(auth)/placement');
      } else {
        Alert.alert('Error', response.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (step === 1 ? router.back() : setStep(1))}
            >
              <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            
            {/* Progress indicator */}
            <View style={styles.progress}>
              <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
              <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
              <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
            </View>
            
            <Text style={styles.title}>
              {step === 1 ? 'Create Account' : 'Your Goal'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Start your French learning journey'
                : 'What brings you to Café French?'}
            </Text>
          </View>

          {/* Step 1: Account Info */}
          {step === 1 && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={colors.textDisabled}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 8 characters"
                    placeholderTextColor={colors.textDisabled}
                    secureTextEntry
                  />
                </View>
              </View>

              <Button
                title="Continue"
                onPress={handleNext}
                size="large"
                fullWidth
              />
            </View>
          )}

          {/* Step 2: Learning Goal */}
          {step === 2 && (
            <View style={styles.form}>
              <View style={styles.goalsContainer}>
                {LEARNING_GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalOption,
                      selectedGoal === goal.id && styles.goalOptionSelected,
                    ]}
                    onPress={() => setSelectedGoal(goal.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.goalContent}>
                      <Text style={styles.goalLabel}>{goal.label}</Text>
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    </View>
                    <View
                      style={[
                        styles.goalRadio,
                        selectedGoal === goal.id && styles.goalRadioSelected,
                      ]}
                    >
                      {selectedGoal === goal.id && (
                        <Feather name="check" size={14} color={colors.white} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                size="large"
                fullWidth
              />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.footerLink}>
              Log In
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },

  // Header
  header: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
    marginBottom: spacing.md,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },

  // Form
  form: {
    flex: 1,
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },

  // Goals
  goalsContainer: {
    gap: spacing.md,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  goalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  goalDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  goalRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRadioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  footerLink: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
});
