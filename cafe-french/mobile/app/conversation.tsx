// Conversation Screen

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../src/components/ui';
import api from '../src/services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  corrections?: any[];
}

export default function ConversationScreen() {
  const params = useLocalSearchParams<{ type?: string; scenarioId?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showDebrief, setShowDebrief] = useState(false);
  const [debrief, setDebrief] = useState<any>(null);
  
  const flatListRef = useRef<FlatList>(null);

  // Start conversation
  const startMutation = useMutation({
    mutationFn: () => api.startConversation({
      type: params.type || 'free_chat',
      scenarioId: params.scenarioId,
      mode: 'text',
      level: 'A1',
    }),
    onSuccess: (data) => {
      if (data.data) {
        setSessionId(data.data.session.id);
        setMessages([{
          id: data.data.openingMessage.id,
          role: 'assistant',
          content: data.data.openingMessage.content,
          timestamp: new Date(data.data.openingMessage.timestamp),
        }]);
      }
    },
  });

  // Send message
  const sendMutation = useMutation({
    mutationFn: (content: string) => api.sendMessage(sessionId!, content),
    onMutate: () => setIsTyping(true),
    onSuccess: (data) => {
      if (data.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.data.userMessage.id,
            role: 'user',
            content: data.data.userMessage.content,
            timestamp: new Date(),
            corrections: data.data.corrections,
          },
          {
            id: data.data.assistantMessage.id,
            role: 'assistant',
            content: data.data.assistantMessage.content,
            timestamp: new Date(),
          },
        ]);
      }
    },
    onSettled: () => setIsTyping(false),
  });

  // End conversation
  const endMutation = useMutation({
    mutationFn: () => api.endConversation(sessionId!),
    onSuccess: (data) => {
      if (data.data?.debrief) {
        setDebrief(data.data.debrief);
        setShowDebrief(true);
      }
    },
  });

  useEffect(() => {
    startMutation.mutate();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !sessionId) return;
    
    const text = inputText.trim();
    setInputText('');
    sendMutation.mutate(text);
  };

  const handleEndConversation = () => {
    Alert.alert(
      'End Conversation',
      'Would you like to end this conversation and see your feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End & Review', onPress: () => endMutation.mutate() },
      ]
    );
  };

  const handleClose = () => {
    if (messages.length > 2 && !showDebrief) {
      handleEndConversation();
    } else {
      router.back();
    }
  };

  // Debrief Screen
  if (showDebrief && debrief) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conversation Review</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={[{ key: 'debrief' }]}
          renderItem={() => (
            <View style={styles.debriefContent}>
              {/* Score */}
              <View style={styles.scoreCard}>
                <Text style={styles.scoreNumber}>{debrief.overallScore}</Text>
                <Text style={styles.scoreLabel}>Overall Score</Text>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{debrief.userMessageCount}</Text>
                  <Text style={styles.statLabel}>Messages</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{debrief.totalErrorCount}</Text>
                  <Text style={styles.statLabel}>Corrections</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{Math.floor(debrief.totalDuration / 60)}m</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
              </View>

              {/* Errors */}
              {debrief.topRecurringErrors?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Areas to Improve</Text>
                  {debrief.topRecurringErrors.map((error: any, i: number) => (
                    <View key={i} style={styles.errorItem}>
                      <View style={styles.errorBadge}>
                        <Text style={styles.errorCount}>{error.occurrences}x</Text>
                      </View>
                      <View style={styles.errorInfo}>
                        <Text style={styles.errorType}>{error.type}</Text>
                        {error.examples?.[0] && (
                          <View style={styles.errorExample}>
                            <Text style={styles.errorOriginal}>
                              {error.examples[0].original}
                            </Text>
                            <Feather name="arrow-right" size={12} color={colors.textSecondary} />
                            <Text style={styles.errorCorrected}>
                              {error.examples[0].corrected}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Strengths */}
              {debrief.strengths?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>What You Did Well</Text>
                  {debrief.strengths.map((strength: string, i: number) => (
                    <View key={i} style={styles.strengthItem}>
                      <Feather name="check-circle" size={18} color={colors.success} />
                      <Text style={styles.strengthText}>{strength}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Tips */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>For Next Time</Text>
                <View style={styles.tipsCard}>
                  {debrief.areasToImprove?.slice(0, 3).map((area: string, i: number) => (
                    <Text key={i} style={styles.tipText}>• Focus on {area}</Text>
                  ))}
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.debriefScroll}
        />

        <View style={styles.footer}>
          {debrief.suggestReplay && (
            <Button
              title="Try Again"
              onPress={() => {
                setShowDebrief(false);
                setDebrief(null);
                setMessages([]);
                startMutation.mutate();
              }}
              variant="outline"
              fullWidth
              style={{ marginBottom: spacing.sm }}
            />
          )}
          <Button
            title="Done"
            onPress={() => router.back()}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Marie</Text>
          <Text style={styles.headerSubtitle}>
            {params.type === 'hard_mode' ? '🔥 French Only' : 'Café Chat'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndConversation}
        >
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Marie is typing...</Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type in French..."
            placeholderTextColor={colors.textDisabled}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sendMutation.isPending}
          >
            <Feather
              name="send"
              size={20}
              color={inputText.trim() ? colors.white : colors.textDisabled}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[styles.messageBubbleContainer, isUser && styles.userMessage]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👩‍🏫</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message.content}
        </Text>
        
        {/* Show corrections */}
        {message.corrections && message.corrections.length > 0 && (
          <View style={styles.corrections}>
            {message.corrections.map((correction: any, i: number) => (
              <View key={i} style={styles.correction}>
                <Text style={styles.correctionText}>
                  💡 {correction.original} → {correction.correction}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  endButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  endButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  
  // Chat
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  
  // Message Bubble
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 18,
  },
  bubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.white,
  },
  
  // Corrections
  corrections: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  correction: {
    marginBottom: spacing.xs,
  },
  correctionText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
  },
  
  // Typing
  typingIndicator: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  typingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceVariant,
  },
  
  // Debrief
  debriefScroll: {
    padding: spacing.lg,
  },
  debriefContent: {
    gap: spacing.lg,
  },
  scoreCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  errorItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  errorBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  errorCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.error,
  },
  errorInfo: {
    flex: 1,
  },
  errorType: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  errorExample: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  errorOriginal: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    textDecorationLine: 'line-through',
  },
  errorCorrected: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: '500',
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  strengthText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  tipsCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
