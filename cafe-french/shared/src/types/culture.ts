// Cultural Immersion Content Types

import { CEFRLevel, SkillType } from './cefr';

export interface CulturalContent {
  id: string;
  type: CulturalContentType;
  title: string;
  titleFr: string;
  description: string;
  level: CEFRLevel;
  duration: number; // seconds for audio/video, estimated reading time for text
  
  // Content
  content: ContentBody;
  
  // Related vocabulary
  previewVocabulary: VocabularyPreview[];
  
  // Comprehension
  comprehensionQuiz: ComprehensionQuiz;
  
  // Reuse activity
  reuseActivity: ReuseActivity;
  
  // Metadata
  source: ContentSource;
  themes: string[];
  culturalTopics: CulturalTopic[];
  region?: FrenchRegion;
  
  // User interaction
  isLocked: boolean; // premium content
  isSaved: boolean;
  completedAt?: Date;
}

export type CulturalContentType = 
  | 'video'
  | 'audio'
  | 'article'
  | 'song'
  | 'poem'
  | 'story'
  | 'news'
  | 'dialogue';

export interface ContentBody {
  // For video/audio
  mediaUrl?: string;
  thumbnailUrl?: string;
  
  // For text
  textContent?: string;
  textContentFr?: string;
  
  // Transcript (for audio/video)
  transcript?: TranscriptSegment[];
  
  // Subtitles options
  hasSubtitlesFr: boolean;
  hasSubtitlesEn: boolean;
  
  // For songs
  lyrics?: LyricsSegment[];
}

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  textFr: string;
  textEn: string;
  speaker?: string;
}

export interface LyricsSegment {
  lineNumber: number;
  textFr: string;
  textEn: string;
  startTime?: number;
  endTime?: number;
}

export interface VocabularyPreview {
  word: string;
  definition: string;
  ipa: string;
  audioUrl: string;
  context: string; // how it's used in this content
}

export interface ComprehensionQuiz {
  id: string;
  questions: ComprehensionQuestion[];
  passingScore: number;
}

export interface ComprehensionQuestion {
  id: string;
  type: 'gist' | 'detail' | 'inference' | 'vocabulary' | 'cultural';
  questionFr?: string;
  questionEn: string;
  
  // For multiple choice
  options?: string[];
  correctOption?: number;
  
  // For open response
  sampleAnswer?: string;
  keyPoints?: string[];
  
  // Feedback
  explanation: string;
  relatedTimestamp?: number; // for audio/video
}

export interface ReuseActivity {
  id: string;
  type: 'cafe_chat' | 'writing' | 'speaking' | 'roleplay';
  description: string;
  
  // Vocabulary to use
  targetVocabulary: string[];
  
  // For conversation
  scenario?: ConversationSetup;
  
  // For writing
  writingPrompt?: string;
  wordLimit?: number;
  
  // For speaking
  speakingPrompt?: string;
}

export interface ConversationSetup {
  context: string;
  userRole: string;
  aiRole: string;
  objectives: string[];
}

export interface ContentSource {
  type: 'curated' | 'original' | 'licensed' | 'public_domain';
  attribution: string;
  sourceUrl?: string;
  license?: string;
}

export type CulturalTopic =
  | 'daily_life'
  | 'food_cuisine'
  | 'traditions'
  | 'history'
  | 'geography'
  | 'art_literature'
  | 'music'
  | 'cinema'
  | 'sports'
  | 'politics'
  | 'fashion'
  | 'education'
  | 'work_business'
  | 'family'
  | 'holidays'
  | 'humor'
  | 'etiquette'
  | 'language_expressions';

export type FrenchRegion =
  | 'paris'
  | 'provence'
  | 'normandy'
  | 'brittany'
  | 'alsace'
  | 'bordeaux'
  | 'lyon'
  | 'marseille'
  | 'nice'
  | 'quebec'
  | 'belgium'
  | 'switzerland'
  | 'africa';

export interface CultureProgress {
  userId: string;
  
  // Content consumed
  totalContentViewed: number;
  totalWatchTimeMinutes: number;
  totalReadingTimeMinutes: number;
  
  // By type
  contentByType: Record<CulturalContentType, number>;
  
  // By topic
  contentByTopic: Record<CulturalTopic, number>;
  
  // Quiz performance
  averageQuizScore: number;
  quizzesCompleted: number;
  
  // Reuse activities
  reuseActivitiesCompleted: number;
  
  // Vocabulary from culture
  vocabularyLearnedFromCulture: number;
  
  // Favorites
  savedContent: string[];
  
  // Recent activity
  recentContent: RecentContentView[];
}

export interface RecentContentView {
  contentId: string;
  viewedAt: Date;
  completedQuiz: boolean;
  quizScore?: number;
  completedReuse: boolean;
}

export interface CultureLibrary {
  featured: CulturalContent[];
  byLevel: Record<CEFRLevel, CulturalContent[]>;
  byType: Record<CulturalContentType, CulturalContent[]>;
  byTopic: Record<CulturalTopic, CulturalContent[]>;
  newThisWeek: CulturalContent[];
  popular: CulturalContent[];
}

// Sample cultural content
export const SAMPLE_CULTURAL_CONTENT: Partial<CulturalContent>[] = [
  {
    id: 'culture-cafe-etiquette',
    type: 'article',
    title: 'French Café Etiquette',
    titleFr: 'L\'étiquette au café français',
    description: 'Learn the unwritten rules of French café culture',
    level: 'A2',
    duration: 180,
    themes: ['daily_life', 'etiquette'],
    culturalTopics: ['etiquette', 'food_cuisine', 'daily_life']
  },
  {
    id: 'culture-bistro-dialogue',
    type: 'dialogue',
    title: 'At the Bistro',
    titleFr: 'Au bistro',
    description: 'A natural conversation between friends meeting at a bistro',
    level: 'A2',
    duration: 120,
    themes: ['food', 'friends', 'conversation'],
    culturalTopics: ['food_cuisine', 'daily_life']
  },
  {
    id: 'culture-edith-piaf',
    type: 'song',
    title: 'La Vie en Rose - Édith Piaf',
    titleFr: 'La Vie en Rose',
    description: 'The iconic French chanson with vocabulary and cultural context',
    level: 'B1',
    duration: 195,
    themes: ['music', 'love', 'classic'],
    culturalTopics: ['music', 'history']
  },
  {
    id: 'culture-revolution',
    type: 'video',
    title: 'The French Revolution in 5 Minutes',
    titleFr: 'La Révolution française en 5 minutes',
    description: 'A brief, accessible overview of French revolutionary history',
    level: 'B1',
    duration: 300,
    themes: ['history', 'politics'],
    culturalTopics: ['history', 'politics']
  },
  {
    id: 'culture-petit-prince',
    type: 'story',
    title: 'The Little Prince - Chapter 1',
    titleFr: 'Le Petit Prince - Chapitre 1',
    description: 'Read the beloved classic with vocabulary support',
    level: 'A2',
    duration: 240,
    themes: ['literature', 'classic', 'children'],
    culturalTopics: ['art_literature']
  }
];

// Cultural facts for daily nuggets
export const CULTURAL_NUGGETS = [
  {
    level: 'A1',
    topic: 'etiquette',
    title: 'The Bise',
    content: 'In France, friends greet each other with "la bise" - light kisses on the cheeks. The number varies by region: 2 in Paris, up to 4 in some areas!',
    relatedVocabulary: ['la bise', 'embrasser', 'saluer']
  },
  {
    level: 'A1',
    topic: 'food_cuisine',
    title: 'Le Pain',
    content: 'The French take bread seriously! A traditional baguette must be made with only flour, water, salt, and yeast. French people buy fresh bread daily.',
    relatedVocabulary: ['le pain', 'la baguette', 'la boulangerie', 'frais']
  },
  {
    level: 'A2',
    topic: 'daily_life',
    title: 'Lunch Break',
    content: 'French lunch breaks can last 1-2 hours. Many shops close between 12-2pm. Eating at your desk is considered unusual and unhealthy.',
    relatedVocabulary: ['le déjeuner', 'la pause', 'fermer', 'manger']
  },
  {
    level: 'A2',
    topic: 'etiquette',
    title: 'Vous vs Tu',
    content: 'Using "vous" vs "tu" is complex. Use "vous" with strangers, elders, and in professional settings. Switch to "tu" only when invited.',
    relatedVocabulary: ['vouvoyer', 'tutoyer', 'formel', 'informel']
  },
  {
    level: 'B1',
    topic: 'traditions',
    title: 'Les Grandes Vacances',
    content: 'August is sacred vacation time in France. Many Parisians leave the city, businesses close, and beaches fill up. It\'s a national tradition.',
    relatedVocabulary: ['les vacances', 'le mois d\'août', 'partir en vacances', 'la rentrée']
  }
];
