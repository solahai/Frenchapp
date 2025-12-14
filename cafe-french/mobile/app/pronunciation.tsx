// Pronunciation Practice Screen

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Card, ProgressBar } from '../src/components/ui';
import api from '../src/services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme';

interface Phrase {
  text: string;
  ipa: string;
  translation: string;
}

export default function PronunciationScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fetch shadowing session
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['shadowingSession'],
    queryFn: () => api.getShadowingSession('A1', 10),
  });

  // Assess pronunciation
  const assessMutation = useMutation({
    mutationFn: ({ targetText, audioData }: { targetText: string; audioData: string }) =>
      api.assessPronunciation(targetText, audioData, 'A1'),
    onSuccess: (data) => {
      if (data.data?.assessment) {
        setAssessment(data.data.assessment);
        setShowResult(true);
      }
    },
  });

  const phrases: Phrase[] = sessionData?.data?.session?.phrases || [];
  const currentPhrase = phrases[currentIndex];
  const progress = ((currentIndex + 1) / phrases.length) * 100;

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();

    try {
      const uri = recording.getURI();
      if (uri && currentPhrase) {
        // In a real app, you'd read the file and convert to base64
        // For now, we'll simulate with a placeholder
        const audioData = 'placeholder_audio_data';
        assessMutation.mutate({
          targetText: currentPhrase.text,
          audioData,
        });
      }
    } catch (error) {
      console.error('Failed to process recording:', error);
    }

    setRecording(null);
  };

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAssessment(null);
      setShowResult(false);
    } else {
      router.back();
    }
  };

  const handlePlayPhrase = async () => {
    try {
      const response = await api.textToSpeech(currentPhrase?.text || '');
      if (response.data?.audioData) {
        const sound = new Audio.Sound();
        await sound.loadAsync({
          uri: `data:audio/mp3;base64,${response.data.audioData}`,
        });
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparing phrases...</Text>
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
          {currentIndex + 1}/{phrases.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Phrase Card */}
        <Card style={styles.phraseCard}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPhrase}>
            <Feather name="volume-2" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.phraseText}>{currentPhrase?.text}</Text>
          <Text style={styles.phraseIpa}>{currentPhrase?.ipa}</Text>
          <Text style={styles.phraseTranslation}>{currentPhrase?.translation}</Text>
        </Card>

        {/* Recording Section */}
        {!showResult && (
          <View style={styles.recordingSection}>
            <Text style={styles.instructionText}>
              Listen, then record yourself saying the phrase
            </Text>
            
            <TouchableOpacity
              style={styles.recordButtonContainer}
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Feather
                  name={isRecording ? 'square' : 'mic'}
                  size={32}
                  color={colors.white}
                />
              </Animated.View>
            </TouchableOpacity>
            
            <Text style={styles.recordingHint}>
              {isRecording ? 'Recording... Tap to stop' : 'Tap to record'}
            </Text>
          </View>
        )}

        {/* Results */}
        {showResult && assessment && (
          <View style={styles.resultsSection}>
            {/* Score Circle */}
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{assessment.overallScore}</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>

            {/* Score Breakdown */}
            <View style={styles.scoresGrid}>
              <ScoreItem
                label="Accuracy"
                score={assessment.scores?.phonemeAccuracy}
              />
              <ScoreItem
                label="Linking"
                score={assessment.scores?.linking}
              />
              <ScoreItem
                label="Rhythm"
                score={assessment.scores?.prosody}
              />
              <ScoreItem
                label="Clarity"
                score={assessment.scores?.intelligibility}
              />
            </View>

            {/* Feedback */}
            {assessment.actionableFixes?.length > 0 && (
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackTitle}>Tips to Improve</Text>
                {assessment.actionableFixes.map((fix: any, i: number) => (
                  <View key={i} style={styles.feedbackItem}>
                    <View style={styles.feedbackNumber}>
                      <Text style={styles.feedbackNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.feedbackText}>{fix.issue}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.resultActions}>
              <Button
                title="Try Again"
                variant="outline"
                onPress={() => {
                  setShowResult(false);
                  setAssessment(null);
                }}
              />
              <Button
                title={currentIndex < phrases.length - 1 ? 'Next Phrase' : 'Done'}
                onPress={handleNext}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Score Item Component
interface ScoreItemProps {
  label: string;
  score: number;
}

const ScoreItem: React.FC<ScoreItemProps> = ({ label, score = 0 }) => {
  const scoreColor = score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;
  
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreItemLabel}>{label}</Text>
      <Text style={[styles.scoreItemValue, { color: scoreColor }]}>{score}</Text>
    </View>
  );
};

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
  
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  
  // Phrase Card
  phraseCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  phraseText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  phraseIpa: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: spacing.sm,
  },
  phraseTranslation: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    textAlign: 'center',
  },
  
  // Recording
  recordingSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  instructionText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  recordButtonContainer: {
    marginBottom: spacing.md,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.speaking,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  recordButtonActive: {
    backgroundColor: colors.error,
  },
  recordingHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  // Results
  resultsSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
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
  
  // Scores Grid
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  scoreItem: {
    width: '45%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  scoreItemLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  scoreItemValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
  },
  
  // Feedback
  feedbackSection: {
    width: '100%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  feedbackTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  feedbackNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackNumberText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
  feedbackText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  
  // Result Actions
  resultActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
