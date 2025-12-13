// Pronunciation and Phonetics Types

import { CEFRLevel } from './cefr';

export interface PronunciationPattern {
  id: string;
  title: string;
  titleFr: string;
  category: PronunciationCategory;
  level: CEFRLevel;
  description: string;
  
  // IPA representation
  ipa: string;
  ipaExplanation: string;
  
  // Visual/physical guidance
  mouthPosition: MouthPosition;
  articulationTips: string[];
  
  // Audio examples
  examples: PronunciationExample[];
  
  // Minimal pairs for practice
  minimalPairs: MinimalPair[];
  
  // Common mistakes
  commonMistakes: PronunciationMistake[];
  
  // Related patterns
  relatedPatterns: string[];
}

export type PronunciationCategory =
  | 'vowels'
  | 'nasal_vowels'
  | 'consonants'
  | 'liaison'
  | 'enchainement'
  | 'elision'
  | 'rhythm'
  | 'intonation'
  | 'silent_letters';

export interface MouthPosition {
  description: string;
  lips: 'rounded' | 'spread' | 'neutral';
  tongue: 'front' | 'back' | 'high' | 'low' | 'central';
  jaw: 'open' | 'closed' | 'half-open';
  imageUrl?: string;
  videoUrl?: string;
}

export interface PronunciationExample {
  word: string;
  ipa: string;
  audioUrl: string;
  translation: string;
  context?: string;
  highlight?: string; // part of the word to highlight
}

export interface MinimalPair {
  word1: string;
  word2: string;
  ipa1: string;
  ipa2: string;
  meaning1: string;
  meaning2: string;
  audioUrl1: string;
  audioUrl2: string;
  differentiatingSound: string;
  tip: string;
}

export interface PronunciationMistake {
  description: string;
  wrongSound: string;
  correctSound: string;
  nativeLanguageInterference: string;
  howToFix: string;
  practiceWords: string[];
}

export interface PronunciationAssessment {
  id: string;
  userId: string;
  timestamp: Date;
  inputType: 'recording' | 'live';
  
  // What was spoken
  targetText: string;
  targetIpa: string;
  audioUrl: string;
  
  // Analysis results
  transcription: string;
  recognizedIpa: string;
  
  // Scores
  overallScore: number; // 0-100
  scores: PronunciationScores;
  
  // Detailed feedback
  phonemeAnalysis: PhonemeAnalysis[];
  actionableFixes: ActionableFix[];
  
  // Comparison data
  rhythmData: RhythmData;
  intonationData: IntonationData;
}

export interface PronunciationScores {
  phonemeAccuracy: number;
  linking: number; // liaison & enchaînement
  prosody: number; // rhythm & stress
  speedStability: number;
  intelligibility: number;
}

export interface PhonemeAnalysis {
  phoneme: string;
  expected: string;
  produced: string;
  score: number;
  position: number;
  feedback?: string;
}

export interface ActionableFix {
  priority: number;
  issue: string;
  description: string;
  howToFix: string;
  practicePhrase: string;
  audioUrl?: string;
}

export interface RhythmData {
  syllableDurations: number[];
  expectedDurations: number[];
  rhythmScore: number;
  feedback: string;
}

export interface IntonationData {
  pitchContour: number[];
  expectedContour: number[];
  intonationScore: number;
  feedback: string;
}

export interface ShadowingSession {
  id: string;
  userId: string;
  date: Date;
  
  // Target audio
  targetPhrases: ShadowingPhrase[];
  
  // Session progress
  completedPhrases: number;
  currentPhraseIndex: number;
  
  // Overall metrics
  averageScore: number;
  rhythmScore: number;
  pronunciationScore: number;
}

export interface ShadowingPhrase {
  id: string;
  text: string;
  ipa: string;
  translation: string;
  audioUrl: string;
  level: CEFRLevel;
  duration: number; // seconds
  
  // User attempts
  attempts: ShadowingAttempt[];
  bestScore: number;
}

export interface ShadowingAttempt {
  timestamp: Date;
  userAudioUrl: string;
  speed: 0.75 | 1.0 | 1.25;
  assessment: PronunciationAssessment;
  rhythmMatch: number;
  timingDeviation: TimingDeviation[];
}

export interface TimingDeviation {
  segment: string;
  expectedStart: number;
  actualStart: number;
  expectedDuration: number;
  actualDuration: number;
  feedback: string;
}

export interface PronunciationProgress {
  userId: string;
  
  // Overall stats
  totalPracticeMinutes: number;
  totalRecordings: number;
  averageScore: number;
  scoreTrend: number[]; // last 30 days
  
  // Phoneme mastery
  phonemeScores: Record<string, PhonemeProgress>;
  
  // Problem areas
  weakPhonemes: string[];
  strongPhonemes: string[];
  
  // Improvement tracking
  improvementAreas: ImprovementArea[];
  
  // Recent sessions
  recentAssessments: PronunciationAssessment[];
}

export interface PhonemeProgress {
  phoneme: string;
  averageScore: number;
  practiceCount: number;
  lastPracticed: Date;
  trend: 'improving' | 'stable' | 'declining';
  suggestedPractice?: string[];
}

export interface ImprovementArea {
  category: PronunciationCategory;
  description: string;
  currentScore: number;
  targetScore: number;
  suggestedExercises: string[];
}

// French phonemes reference
export const FRENCH_VOWELS = [
  { ipa: 'i', example: 'lit', description: 'high front unrounded' },
  { ipa: 'e', example: 'été', description: 'mid front unrounded' },
  { ipa: 'ɛ', example: 'lait', description: 'low-mid front unrounded' },
  { ipa: 'a', example: 'patte', description: 'low front unrounded' },
  { ipa: 'ɑ', example: 'pâte', description: 'low back unrounded' },
  { ipa: 'ɔ', example: 'bol', description: 'low-mid back rounded' },
  { ipa: 'o', example: 'eau', description: 'mid back rounded' },
  { ipa: 'u', example: 'loup', description: 'high back rounded' },
  { ipa: 'y', example: 'lu', description: 'high front rounded' },
  { ipa: 'ø', example: 'peu', description: 'mid front rounded' },
  { ipa: 'œ', example: 'peur', description: 'low-mid front rounded' },
  { ipa: 'ə', example: 'le', description: 'mid central' },
];

export const FRENCH_NASAL_VOWELS = [
  { ipa: 'ɛ̃', example: 'vin', description: 'nasal mid front' },
  { ipa: 'ɑ̃', example: 'vent', description: 'nasal low back' },
  { ipa: 'ɔ̃', example: 'bon', description: 'nasal mid back rounded' },
  { ipa: 'œ̃', example: 'brun', description: 'nasal mid front rounded' },
];

export const FRENCH_CONSONANTS = [
  { ipa: 'p', example: 'pomme', description: 'voiceless bilabial plosive' },
  { ipa: 'b', example: 'bon', description: 'voiced bilabial plosive' },
  { ipa: 't', example: 'table', description: 'voiceless alveolar plosive' },
  { ipa: 'd', example: 'dent', description: 'voiced alveolar plosive' },
  { ipa: 'k', example: 'café', description: 'voiceless velar plosive' },
  { ipa: 'g', example: 'gare', description: 'voiced velar plosive' },
  { ipa: 'f', example: 'femme', description: 'voiceless labiodental fricative' },
  { ipa: 'v', example: 'vent', description: 'voiced labiodental fricative' },
  { ipa: 's', example: 'sol', description: 'voiceless alveolar fricative' },
  { ipa: 'z', example: 'zoo', description: 'voiced alveolar fricative' },
  { ipa: 'ʃ', example: 'chat', description: 'voiceless postalveolar fricative' },
  { ipa: 'ʒ', example: 'je', description: 'voiced postalveolar fricative' },
  { ipa: 'ʁ', example: 'rue', description: 'voiced uvular fricative' },
  { ipa: 'm', example: 'mère', description: 'bilabial nasal' },
  { ipa: 'n', example: 'non', description: 'alveolar nasal' },
  { ipa: 'ɲ', example: 'montagne', description: 'palatal nasal' },
  { ipa: 'l', example: 'lune', description: 'alveolar lateral' },
  { ipa: 'j', example: 'yeux', description: 'palatal approximant' },
  { ipa: 'w', example: 'oui', description: 'labio-velar approximant' },
  { ipa: 'ɥ', example: 'huit', description: 'labio-palatal approximant' },
];

// Liaison rules
export const LIAISON_RULES = {
  obligatory: [
    { context: 'determiner + noun', example: 'les‿amis', rule: 'Always link articles and determiners to following vowels' },
    { context: 'adjective + noun', example: 'petit‿ami', rule: 'Always link adjectives before nouns' },
    { context: 'pronoun + verb', example: 'ils‿ont', rule: 'Always link subject pronouns to verbs' },
    { context: 'après', example: 'après‿avoir', rule: 'Some prepositions always link' },
  ],
  forbidden: [
    { context: 'singular noun + adjective', example: 'enfant intelligent', rule: 'Never link singular nouns to following adjectives' },
    { context: 'et', example: 'toi et elle', rule: 'Never link after "et"' },
    { context: 'before h aspiré', example: 'les héros', rule: 'Never link before aspirated h' },
  ],
  optional: [
    { context: 'verb + complement', example: 'il est (‿)arrivé', rule: 'Optional in formal speech' },
    { context: 'pas + adjective', example: 'pas (‿)aimable', rule: 'Optional, more common in formal speech' },
  ]
};
