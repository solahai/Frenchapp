// Conversation and Chat Types

import { CEFRLevel } from './cefr';

export interface ConversationSession {
  id: string;
  userId: string;
  type: ConversationType;
  mode: ConversationMode;
  scenario?: ConversationScenario;
  level: CEFRLevel;
  status: 'active' | 'completed' | 'abandoned';
  startTime: Date;
  endTime?: Date;
  messages: ConversationMessage[];
  corrections: ConversationCorrection[];
  debrief?: ConversationDebrief;
  metrics: ConversationMetrics;
}

export type ConversationType = 'free_chat' | 'scenario_chat' | 'hard_mode';

export type ConversationMode = 'text' | 'voice' | 'mixed';

export interface ConversationScenario {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  context: string;
  location: ScenarioLocation;
  level: CEFRLevel;
  objectives: string[];
  requiredVocabulary: string[];
  requiredGrammar: string[];
  suggestedDuration: number; // minutes
  npcCharacter: NPCCharacter;
  openingPrompt: string;
  possiblePaths: ScenarioPath[];
  successCriteria: SuccessCriterion[];
  tags: string[];
}

export type ScenarioLocation = 
  | 'cafe'
  | 'restaurant'
  | 'bakery'
  | 'market'
  | 'pharmacy'
  | 'clinic'
  | 'train_station'
  | 'airport'
  | 'hotel'
  | 'bank'
  | 'post_office'
  | 'school'
  | 'office'
  | 'street'
  | 'home'
  | 'shop'
  | 'museum'
  | 'park';

export interface NPCCharacter {
  name: string;
  role: string;
  personality: string;
  speakingStyle: string;
  avatarUrl?: string;
  voiceId?: string; // ElevenLabs voice ID
}

export interface ScenarioPath {
  trigger: string;
  response: string;
  leads_to?: string;
}

export interface SuccessCriterion {
  type: 'vocabulary_use' | 'grammar_use' | 'task_completion' | 'fluency';
  description: string;
  weight: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  transcription?: string;
  translation?: string;
  analysis?: MessageAnalysis;
  corrections?: InlineCorrection[];
}

export interface MessageAnalysis {
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  appropriatenessScore: number;
  cerfAlignment: CEFRLevel;
  detectedErrors: DetectedError[];
  positiveAspects: string[];
}

export interface DetectedError {
  id: string;
  type: ErrorType;
  category: string;
  originalText: string;
  startIndex: number;
  endIndex: number;
  correction: string;
  explanation: string;
  severity: 'minor' | 'moderate' | 'major';
  isRecurring: boolean;
}

export type ErrorType = 
  | 'grammar'
  | 'vocabulary'
  | 'spelling'
  | 'gender_agreement'
  | 'verb_conjugation'
  | 'word_order'
  | 'article_usage'
  | 'preposition'
  | 'pronoun'
  | 'tense'
  | 'register'
  | 'idiom';

export interface InlineCorrection {
  original: string;
  corrected: string;
  explanation?: string;
  type: ErrorType;
}

export interface ConversationCorrection {
  messageId: string;
  original: string;
  corrected: string;
  explanation: string;
  category: string;
  appliedAt?: Date;
  userAcknowledged: boolean;
}

export interface ConversationDebrief {
  sessionId: string;
  generatedAt: Date;
  
  // Summary stats
  totalMessages: number;
  userMessageCount: number;
  totalDuration: number;
  
  // Error analysis
  topRecurringErrors: RecurringError[];
  totalErrorCount: number;
  errorsByCategory: Record<string, number>;
  
  // Improvements
  improvedSentences: ImprovedSentence[];
  
  // Positive feedback
  strengths: string[];
  vocabularyUsed: string[];
  grammarStructuresUsed: string[];
  
  // Recommendations
  areasToImprove: string[];
  suggestedPractice: string[];
  
  // Scores
  overallScore: number;
  fluencyScore: number;
  accuracyScore: number;
  vocabularyRangeScore: number;
  taskCompletionScore: number;
  
  // Replay suggestion
  suggestReplay: boolean;
  replayFocus?: string;
}

export interface RecurringError {
  type: ErrorType;
  category: string;
  occurrences: number;
  examples: {
    original: string;
    corrected: string;
  }[];
  recommendation: string;
}

export interface ImprovedSentence {
  original: string;
  corrected: string;
  explanation: string;
  grammarPoint?: string;
}

export interface ConversationMetrics {
  totalTurns: number;
  averageResponseLength: number;
  vocabularyDiversity: number; // unique words / total words
  grammarAccuracy: number;
  taskCompletionRate: number;
  responseTimeAverage: number;
  selfCorrectionCount: number;
  clarificationRequests: number;
  codewitching: number; // times user used English
}

// Pre-defined conversation scenarios
export const CONVERSATION_SCENARIOS: ConversationScenario[] = [
  {
    id: 'cafe-ordering',
    title: 'Ordering at a Café',
    titleFr: 'Commander au café',
    description: 'Practice ordering drinks and snacks at a French café',
    context: 'You\'re at a cozy Parisian café. It\'s a sunny afternoon and you want to order a coffee and maybe a pastry.',
    location: 'cafe',
    level: 'A1',
    objectives: [
      'Greet the server appropriately',
      'Order a drink using proper French',
      'Ask for the bill',
      'Thank the server'
    ],
    requiredVocabulary: [
      'bonjour', 'un café', 'un croissant', 's\'il vous plaît',
      'l\'addition', 'merci', 'au revoir'
    ],
    requiredGrammar: [
      'je voudrais', 'est-ce que', 'combien'
    ],
    suggestedDuration: 3,
    npcCharacter: {
      name: 'Marie',
      role: 'Server at Café de Flore',
      personality: 'Friendly but professional, speaks clearly',
      speakingStyle: 'Standard French, moderate pace'
    },
    openingPrompt: 'Bonjour et bienvenue au Café de Flore ! Qu\'est-ce que je peux vous servir ?',
    possiblePaths: [
      {
        trigger: 'order_coffee',
        response: 'Très bien ! Un café, ça sera tout ?'
      },
      {
        trigger: 'ask_recommendation',
        response: 'Je vous recommande notre croissant aux amandes, il est délicieux !'
      }
    ],
    successCriteria: [
      { type: 'vocabulary_use', description: 'Uses polite expressions', weight: 0.3 },
      { type: 'task_completion', description: 'Successfully orders', weight: 0.5 },
      { type: 'grammar_use', description: 'Correct verb forms', weight: 0.2 }
    ],
    tags: ['cafe', 'ordering', 'food', 'polite', 'beginner']
  },
  {
    id: 'doctor-appointment',
    title: 'At the Doctor\'s Office',
    titleFr: 'Chez le médecin',
    description: 'Describe symptoms and understand medical advice',
    context: 'You\'re not feeling well and need to see a doctor. You need to describe your symptoms and understand the doctor\'s recommendations.',
    location: 'clinic',
    level: 'A2',
    objectives: [
      'Describe your symptoms',
      'Answer questions about your health',
      'Understand the doctor\'s diagnosis',
      'Ask about treatment'
    ],
    requiredVocabulary: [
      'j\'ai mal', 'la tête', 'la gorge', 'la fièvre',
      'depuis', 'médicament', 'ordonnance', 'pharmacie'
    ],
    requiredGrammar: [
      'avoir mal à', 'depuis + time', 'il faut', 'devoir'
    ],
    suggestedDuration: 5,
    npcCharacter: {
      name: 'Dr. Dupont',
      role: 'General Practitioner',
      personality: 'Calm, professional, patient with explanations',
      speakingStyle: 'Clear, slightly formal, uses some medical terms with explanations'
    },
    openingPrompt: 'Bonjour ! Asseyez-vous, je vous en prie. Alors, qu\'est-ce qui ne va pas aujourd\'hui ?',
    possiblePaths: [
      {
        trigger: 'headache',
        response: 'Vous avez mal à la tête. Depuis quand avez-vous ces maux de tête ?'
      },
      {
        trigger: 'fever',
        response: 'Vous avez de la fièvre. Je vais prendre votre température.'
      }
    ],
    successCriteria: [
      { type: 'vocabulary_use', description: 'Uses body parts and symptom vocabulary', weight: 0.3 },
      { type: 'task_completion', description: 'Communicates symptoms clearly', weight: 0.4 },
      { type: 'grammar_use', description: 'Uses "avoir mal à" correctly', weight: 0.3 }
    ],
    tags: ['health', 'doctor', 'symptoms', 'intermediate']
  },
  {
    id: 'train-ticket',
    title: 'Buying a Train Ticket',
    titleFr: 'Acheter un billet de train',
    description: 'Purchase a train ticket and understand travel information',
    context: 'You\'re at a French train station and need to buy a ticket to Lyon. You\'ll need to specify your travel preferences.',
    location: 'train_station',
    level: 'A2',
    objectives: [
      'Ask for a ticket to a specific destination',
      'Specify single or return',
      'Ask about departure times',
      'Understand platform information'
    ],
    requiredVocabulary: [
      'un billet', 'aller simple', 'aller-retour', 'le quai',
      'le train', 'première classe', 'deuxième classe', 'à quelle heure'
    ],
    requiredGrammar: [
      'je voudrais', 'futur proche', 'il y a', 'questions with est-ce que'
    ],
    suggestedDuration: 4,
    npcCharacter: {
      name: 'Agent SNCF',
      role: 'Ticket Agent',
      personality: 'Efficient, helpful, speaks at normal speed',
      speakingStyle: 'Professional, uses travel terminology'
    },
    openingPrompt: 'Bonjour ! Je peux vous aider ?',
    possiblePaths: [],
    successCriteria: [
      { type: 'vocabulary_use', description: 'Uses travel vocabulary', weight: 0.3 },
      { type: 'task_completion', description: 'Successfully purchases ticket', weight: 0.5 },
      { type: 'fluency', description: 'Responds appropriately to questions', weight: 0.2 }
    ],
    tags: ['travel', 'train', 'tickets', 'intermediate']
  }
];

// Correction policy configuration
export interface CorrectionPolicy {
  // How strict the AI should be
  strictness: 'lenient' | 'balanced' | 'strict';
  
  // Which errors to correct inline
  inlineCorrectSeverity: ('minor' | 'moderate' | 'major')[];
  
  // Whether to force repair loops for major errors
  forceRepairLoop: boolean;
  
  // Maximum errors before intervention
  maxErrorsBeforeIntervention: number;
  
  // Whether to allow English fallback
  allowEnglishFallback: boolean;
  
  // Error categories to always correct
  alwaysCorrect: ErrorType[];
  
  // Error categories to ignore
  ignoreCategories: ErrorType[];
}

export const DEFAULT_CORRECTION_POLICY: CorrectionPolicy = {
  strictness: 'balanced',
  inlineCorrectSeverity: ['moderate', 'major'],
  forceRepairLoop: true,
  maxErrorsBeforeIntervention: 3,
  allowEnglishFallback: false,
  alwaysCorrect: ['verb_conjugation', 'gender_agreement', 'tense'],
  ignoreCategories: []
};

export const STRICT_CORRECTION_POLICY: CorrectionPolicy = {
  strictness: 'strict',
  inlineCorrectSeverity: ['minor', 'moderate', 'major'],
  forceRepairLoop: true,
  maxErrorsBeforeIntervention: 2,
  allowEnglishFallback: false,
  alwaysCorrect: ['grammar', 'vocabulary', 'verb_conjugation', 'gender_agreement', 'tense', 'article_usage'],
  ignoreCategories: []
};
