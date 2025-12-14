// Grammar Rules and Structures Types

import { CEFRLevel } from './cefr';

export interface GrammarRule {
  id: string;
  title: string;
  titleFr: string;
  category: GrammarCategory;
  subcategory: string;
  level: CEFRLevel;
  difficulty: 1 | 2 | 3 | 4 | 5;
  
  // Kid-simple explanation
  explanation: GrammarExplanation;
  
  // Examples with context
  examples: GrammarExample[];
  
  // Common mistakes
  commonTraps: CommonTrap[];
  
  // Quick checks
  quickChecks: QuickCheck[];
  
  // Related rules
  relatedRules: string[];
  prerequisiteRules: string[];
  
  // Tags for searching
  tags: string[];
}

export interface GrammarExplanation {
  // Simple, one idea at a time
  whatItMeans: string;
  whenToUse: string;
  howToForm: FormationRule[];
  visualPattern?: string;
  memoryTrick?: string;
  analogyInEnglish?: string;
}

export interface FormationRule {
  step: number;
  instruction: string;
  example: {
    before: string;
    after: string;
  };
}

export interface GrammarExample {
  french: string;
  english: string;
  breakdown?: WordBreakdown[];
  audioUrl?: string;
  context?: string;
  highlight?: string[]; // words to highlight
  notes?: string;
}

export interface WordBreakdown {
  word: string;
  role: string;
  explanation: string;
}

export interface CommonTrap {
  title: string;
  description: string;
  wrongExample: {
    french: string;
    english: string;
    whyWrong: string;
  };
  correctExample: {
    french: string;
    english: string;
  };
  howToAvoid: string;
}

export interface QuickCheck {
  id: string;
  type: 'fill_blank' | 'multiple_choice' | 'error_correction' | 'translation';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

export type GrammarCategory =
  | 'articles'
  | 'nouns'
  | 'adjectives'
  | 'pronouns'
  | 'verbs'
  | 'tenses'
  | 'moods'
  | 'adverbs'
  | 'prepositions'
  | 'conjunctions'
  | 'negation'
  | 'questions'
  | 'relative_clauses'
  | 'conditionals'
  | 'reported_speech'
  | 'passive_voice'
  | 'word_order';

export interface GrammarProgress {
  ruleId: string;
  userId: string;
  status: GrammarLearningStatus;
  firstSeen: Date;
  lastPracticed: Date;
  practiceCount: number;
  correctApplications: number;
  incorrectApplications: number;
  commonMistakes: GrammarMistake[];
  mastery: number; // 0-100
  needsRemediation: boolean;
}

export type GrammarLearningStatus = 'not_seen' | 'introduced' | 'practicing' | 'consolidating' | 'mastered';

export interface GrammarMistake {
  date: Date;
  context: string;
  userResponse: string;
  expectedResponse: string;
  mistakeType: string;
  wasAddressed: boolean;
}

// Pre-defined grammar rules for French
export const FRENCH_GRAMMAR_CATEGORIES: Record<GrammarCategory, { name: string; description: string; levels: CEFRLevel[] }> = {
  articles: {
    name: 'Articles',
    description: 'Definite, indefinite, and partitive articles',
    levels: ['A1', 'A2']
  },
  nouns: {
    name: 'Nouns',
    description: 'Gender, number, and noun formation',
    levels: ['A1', 'A2']
  },
  adjectives: {
    name: 'Adjectives',
    description: 'Agreement, position, and comparison',
    levels: ['A1', 'A2', 'B1']
  },
  pronouns: {
    name: 'Pronouns',
    description: 'Subject, object, relative, and demonstrative pronouns',
    levels: ['A1', 'A2', 'B1', 'B2']
  },
  verbs: {
    name: 'Verbs',
    description: 'Conjugation patterns and irregular verbs',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1']
  },
  tenses: {
    name: 'Verb Tenses',
    description: 'Present, past, future, and compound tenses',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1']
  },
  moods: {
    name: 'Moods',
    description: 'Indicative, subjunctive, conditional, imperative',
    levels: ['A2', 'B1', 'B2', 'C1']
  },
  adverbs: {
    name: 'Adverbs',
    description: 'Formation, placement, and comparison',
    levels: ['A2', 'B1']
  },
  prepositions: {
    name: 'Prepositions',
    description: 'Usage with places, time, and verbs',
    levels: ['A1', 'A2', 'B1', 'B2']
  },
  conjunctions: {
    name: 'Conjunctions',
    description: 'Coordinating and subordinating conjunctions',
    levels: ['A2', 'B1', 'B2']
  },
  negation: {
    name: 'Negation',
    description: 'Negative structures and expressions',
    levels: ['A1', 'A2', 'B1']
  },
  questions: {
    name: 'Questions',
    description: 'Question formation and interrogative words',
    levels: ['A1', 'A2', 'B1']
  },
  relative_clauses: {
    name: 'Relative Clauses',
    description: 'Qui, que, dont, où, and complex relatives',
    levels: ['A2', 'B1', 'B2']
  },
  conditionals: {
    name: 'Conditionals',
    description: 'If-clauses and hypothetical situations',
    levels: ['A2', 'B1', 'B2', 'C1']
  },
  reported_speech: {
    name: 'Reported Speech',
    description: 'Indirect speech and sequence of tenses',
    levels: ['B1', 'B2']
  },
  passive_voice: {
    name: 'Passive Voice',
    description: 'Passive constructions and alternatives',
    levels: ['B1', 'B2']
  },
  word_order: {
    name: 'Word Order',
    description: 'Sentence structure and emphasis',
    levels: ['A1', 'A2', 'B1', 'B2']
  }
};

// Sample grammar rules
export const SAMPLE_GRAMMAR_RULES: GrammarRule[] = [
  {
    id: 'articles-definite-basic',
    title: 'Definite Articles (The)',
    titleFr: 'Les articles définis',
    category: 'articles',
    subcategory: 'definite',
    level: 'A1',
    difficulty: 1,
    explanation: {
      whatItMeans: 'French has 4 words for "the" based on the noun\'s gender and number.',
      whenToUse: 'Use when talking about specific things everyone knows about.',
      howToForm: [
        {
          step: 1,
          instruction: 'For masculine singular nouns, use "le"',
          example: { before: 'chat (cat)', after: 'le chat (the cat)' }
        },
        {
          step: 2,
          instruction: 'For feminine singular nouns, use "la"',
          example: { before: 'maison (house)', after: 'la maison (the house)' }
        },
        {
          step: 3,
          instruction: 'For any plural noun, use "les"',
          example: { before: 'chats (cats)', after: 'les chats (the cats)' }
        },
        {
          step: 4,
          instruction: 'Before a vowel or silent h, use "l\'"',
          example: { before: 'école (school)', after: 'l\'école (the school)' }
        }
      ],
      visualPattern: 'le (♂) | la (♀) | l\' (vowel) | les (plural)',
      memoryTrick: 'LE = mascuLine, LA = féminine (both have the letter they use!)',
      analogyInEnglish: 'Like choosing a/an in English, but based on gender instead of sound.'
    },
    examples: [
      {
        french: 'Le garçon mange la pomme.',
        english: 'The boy eats the apple.',
        breakdown: [
          { word: 'Le', role: 'article', explanation: 'masculine singular article' },
          { word: 'garçon', role: 'noun', explanation: 'masculine noun' },
          { word: 'la', role: 'article', explanation: 'feminine singular article' },
          { word: 'pomme', role: 'noun', explanation: 'feminine noun' }
        ],
        highlight: ['Le', 'la']
      },
      {
        french: 'L\'enfant aime les animaux.',
        english: 'The child loves animals.',
        highlight: ['L\'', 'les'],
        notes: 'l\' before vowel, les for plural'
      }
    ],
    commonTraps: [
      {
        title: 'Forgetting to contract before vowels',
        description: 'Before vowels or silent h, you must use l\' instead of le/la',
        wrongExample: {
          french: 'La école',
          english: 'The school',
          whyWrong: 'école starts with a vowel, so we cannot use "la"'
        },
        correctExample: {
          french: 'L\'école',
          english: 'The school'
        },
        howToAvoid: 'Always check if the next word starts with a vowel sound.'
      }
    ],
    quickChecks: [
      {
        id: 'qc1',
        type: 'fill_blank',
        question: '___ livre est sur ___ table.',
        correctAnswer: 'Le, la',
        explanation: 'livre is masculine, table is feminine',
        difficulty: 1
      },
      {
        id: 'qc2',
        type: 'multiple_choice',
        question: 'Which article goes with "hôtel"?',
        options: ['le', 'la', 'l\'', 'les'],
        correctAnswer: 'l\'',
        explanation: 'hôtel starts with a vowel sound (silent h)',
        difficulty: 2
      }
    ],
    relatedRules: ['articles-indefinite-basic', 'articles-partitive'],
    prerequisiteRules: [],
    tags: ['article', 'definite', 'gender', 'basic']
  },
  {
    id: 'passe-compose-avoir',
    title: 'Passé Composé with Avoir',
    titleFr: 'Le passé composé avec avoir',
    category: 'tenses',
    subcategory: 'past',
    level: 'A2',
    difficulty: 2,
    explanation: {
      whatItMeans: 'The passé composé describes completed actions in the past. Most verbs use "avoir" as a helper.',
      whenToUse: 'Use for actions that happened and finished in the past. "I ate", "She spoke", "They watched".',
      howToForm: [
        {
          step: 1,
          instruction: 'Conjugate "avoir" to match the subject',
          example: { before: 'je', after: 'j\'ai' }
        },
        {
          step: 2,
          instruction: 'Add the past participle of the main verb',
          example: { before: 'manger → mangé', after: 'j\'ai mangé (I ate)' }
        }
      ],
      visualPattern: 'Subject + avoir (conjugated) + past participle',
      memoryTrick: 'Think: "I HAVE eaten" → "J\'AI mangé" - avoir = have!',
      analogyInEnglish: 'Similar to "I have eaten" but used like "I ate" in meaning.'
    },
    examples: [
      {
        french: 'J\'ai mangé une pizza.',
        english: 'I ate a pizza.',
        breakdown: [
          { word: 'J\'ai', role: 'auxiliary', explanation: 'avoir conjugated for je' },
          { word: 'mangé', role: 'past participle', explanation: 'from manger' }
        ],
        highlight: ['ai', 'mangé']
      },
      {
        french: 'Elle a fini ses devoirs.',
        english: 'She finished her homework.',
        highlight: ['a', 'fini']
      },
      {
        french: 'Nous avons regardé un film.',
        english: 'We watched a movie.',
        highlight: ['avons', 'regardé']
      }
    ],
    commonTraps: [
      {
        title: 'Using être instead of avoir',
        description: 'Most verbs use avoir, but some verbs of movement/state use être',
        wrongExample: {
          french: 'J\'ai allé au cinéma.',
          english: 'I went to the cinema.',
          whyWrong: 'aller uses être, not avoir'
        },
        correctExample: {
          french: 'Je suis allé au cinéma.',
          english: 'I went to the cinema.'
        },
        howToAvoid: 'Memorize the "Dr. Mrs. Vandertramp" verbs that use être.'
      },
      {
        title: 'Wrong past participle ending',
        description: 'Each verb group has different past participle endings',
        wrongExample: {
          french: 'J\'ai mangé → J\'ai manger',
          english: 'I ate',
          whyWrong: 'The infinitive (manger) is not the past participle'
        },
        correctExample: {
          french: 'J\'ai mangé',
          english: 'I ate'
        },
        howToAvoid: '-er verbs → -é, -ir verbs → -i, -re verbs → -u (usually)'
      }
    ],
    quickChecks: [
      {
        id: 'qc1',
        type: 'fill_blank',
        question: 'Hier, nous ___ (regarder) la télé.',
        correctAnswer: 'avons regardé',
        explanation: 'nous + avoir = avons, regarder → regardé',
        difficulty: 1
      },
      {
        id: 'qc2',
        type: 'translation',
        question: 'Translate: They ate breakfast.',
        correctAnswer: 'Ils ont mangé le petit déjeuner.',
        explanation: 'ils + avoir = ont, manger → mangé',
        difficulty: 2
      }
    ],
    relatedRules: ['passe-compose-etre', 'imparfait-vs-passe-compose', 'past-participle-agreement'],
    prerequisiteRules: ['avoir-present', 'past-participle-formation'],
    tags: ['tense', 'past', 'passé composé', 'avoir', 'compound']
  }
];
