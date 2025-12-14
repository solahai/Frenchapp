// Lesson Builder Service
// Generates adaptive daily lessons based on user progress and learning science principles

import { DatabaseService } from './database';
import { openAIService } from './openai';
import { srsEngine } from './srsEngine';
import { v4 as uuidv4 } from 'uuid';

interface LessonSection {
  id: string;
  type: 'warm_start' | 'new_material' | 'practice_block' | 'cafe_chat' | 'wrap_up';
  title: string;
  durationMinutes: number;
  activities: Activity[];
  status: 'pending' | 'in_progress' | 'completed';
}

interface Activity {
  id: string;
  type: string;
  skill: 'listening' | 'speaking' | 'reading' | 'writing';
  content: any;
  instructions: string;
  timeLimit?: number;
  requiresProduction: boolean;
  completed: boolean;
}

interface DailyLesson {
  id: string;
  userId: string;
  date: string;
  level: string;
  targetDurationMinutes: number;
  status: string;
  sections: LessonSection[];
  vocabulary: any[];
  grammarRule: any;
  pronunciationTarget: any;
  culturalNugget: any;
  metrics: any;
}

class LessonBuilder {
  private _db: ReturnType<DatabaseService['getDb']> | null = null;

  // Cognitive load management
  private maxNewItems = 10;
  private optimalNewItems = 8;
  private reviewToNewRatio = 3; // 3 review items per new item

  private get db() {
    if (!this._db) {
      this._db = DatabaseService.getInstance().getDb();
    }
    return this._db;
  }

  /**
   * Generate a complete daily lesson
   */
  async generateDailyLesson(
    userId: string,
    date: string,
    level: string,
    durationMinutes: number = 20,
    focusAreas?: string[],
    preferredTopics?: string[]
  ): Promise<DailyLesson> {
    // Check if lesson already exists for this date
    const existing = this.db.prepare(`
      SELECT * FROM lessons WHERE user_id = ? AND date = ?
    `).get(userId, date) as any;

    if (existing) {
      return this.parseLessonFromDb(existing);
    }

    // Get user's learned vocabulary to avoid repetition in new material
    const learnedVocab = this.getLearnedVocabulary(userId);
    
    // Get items due for recall (spacing)
    const recallItems = this.getRecallItems(userId);
    
    // Determine theme based on progression and preferences
    const theme = this.selectTheme(level, preferredTopics);
    
    // Generate new content using AI
    const content = await openAIService.generateLessonContent(
      level,
      theme,
      learnedVocab.map(v => v.french),
      this.selectGrammarFocus(userId, level)
    );

    // Build lesson structure
    const lessonId = `lesson_${uuidv4()}`;
    const sections = this.buildSections(
      durationMinutes,
      recallItems,
      content,
      level
    );

    const lesson: DailyLesson = {
      id: lessonId,
      userId,
      date,
      level,
      targetDurationMinutes: durationMinutes,
      status: 'scheduled',
      sections,
      vocabulary: content.vocabulary,
      grammarRule: content.grammarRule,
      pronunciationTarget: this.selectPronunciationTarget(level),
      culturalNugget: content.culturalNugget,
      metrics: {
        totalTimeSpent: 0,
        activitiesCompleted: 0,
        activitiesTotal: sections.reduce((sum, s) => sum + s.activities.length, 0),
        averageScore: 0,
        newWordsLearned: 0,
        wordsReviewed: 0,
        speakingTime: 0,
        listeningTime: 0,
        errorsCommitted: [],
        improvementsShown: [],
      },
    };

    // Save to database
    this.db.prepare(`
      INSERT INTO lessons (id, user_id, date, level, status, content, metrics, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      lessonId,
      userId,
      date,
      level,
      'scheduled',
      JSON.stringify({
        sections,
        vocabulary: content.vocabulary,
        grammarRule: content.grammarRule,
        pronunciationTarget: lesson.pronunciationTarget,
        culturalNugget: content.culturalNugget,
      }),
      JSON.stringify(lesson.metrics),
      new Date().toISOString()
    );

    // Create SRS cards for new vocabulary
    for (const vocab of content.vocabulary) {
      srsEngine.createVocabularyCards(userId, `vocab_${vocab.french}`, {
        french: vocab.french,
        english: vocab.english,
        ipa: vocab.ipa,
        example: vocab.example,
        level,
      });
    }

    return lesson;
  }

  /**
   * Build lesson sections based on the 20-minute structure
   */
  private buildSections(
    durationMinutes: number,
    recallItems: any[],
    content: any,
    level: string
  ): LessonSection[] {
    const sections: LessonSection[] = [];

    // 1. Warm Start (60-90s) - Recall Sprint
    sections.push({
      id: `section_${uuidv4()}`,
      type: 'warm_start',
      title: 'Recall Sprint',
      durationMinutes: 1.5,
      activities: this.buildRecallActivities(recallItems.slice(0, 3)),
      status: 'pending',
    });

    // 2. New Material (6-7 min)
    sections.push({
      id: `section_${uuidv4()}`,
      type: 'new_material',
      title: 'New Learning',
      durationMinutes: 7,
      activities: [
        ...this.buildVocabularyActivities(content.vocabulary),
        this.buildGrammarActivity(content.grammarRule),
        this.buildPronunciationActivity(level),
      ],
      status: 'pending',
    });

    // 3. Practice Block (8-9 min) - Interleaved practice
    sections.push({
      id: `section_${uuidv4()}`,
      type: 'practice_block',
      title: 'Practice',
      durationMinutes: 9,
      activities: this.buildInterleavedPractice(content, level),
      status: 'pending',
    });

    // 4. Café Chat (2-3 min)
    sections.push({
      id: `section_${uuidv4()}`,
      type: 'cafe_chat',
      title: 'Café Conversation',
      durationMinutes: 3,
      activities: [this.buildCafeActivity(content, level)],
      status: 'pending',
    });

    // 5. Wrap Up (60s)
    sections.push({
      id: `section_${uuidv4()}`,
      type: 'wrap_up',
      title: 'Summary',
      durationMinutes: 1,
      activities: [this.buildWrapUpActivity()],
      status: 'pending',
    });

    return sections;
  }

  /**
   * Build recall activities from due SRS items
   */
  private buildRecallActivities(items: any[]): Activity[] {
    return items.map(item => ({
      id: `activity_${uuidv4()}`,
      type: 'recall_sprint',
      skill: 'speaking' as const,
      content: {
        prompt: item.prompt || item.front,
        expectedResponse: item.answer || item.back,
        lastReviewed: item.lastReviewed,
        daysAgo: item.daysAgo,
      },
      instructions: 'Say this word/phrase in French',
      timeLimit: 10,
      requiresProduction: true,
      completed: false,
    }));
  }

  /**
   * Build vocabulary introduction activities
   */
  private buildVocabularyActivities(vocabulary: any[]): Activity[] {
    const activities: Activity[] = [];

    // Introduction with audio
    activities.push({
      id: `activity_${uuidv4()}`,
      type: 'vocabulary_intro',
      skill: 'listening' as const,
      content: {
        vocabularyItems: vocabulary,
        mode: 'listen_and_repeat',
      },
      instructions: 'Listen to each word and repeat it aloud',
      timeLimit: 120,
      requiresProduction: true,
      completed: false,
    });

    return activities;
  }

  /**
   * Build grammar explanation activity
   */
  private buildGrammarActivity(grammarRule: any): Activity {
    return {
      id: `activity_${uuidv4()}`,
      type: 'grammar_explanation',
      skill: 'reading' as const,
      content: {
        rule: grammarRule,
        includesQuickCheck: true,
      },
      instructions: 'Learn this grammar pattern, then try the quick check',
      requiresProduction: true,
      completed: false,
    };
  }

  /**
   * Build pronunciation activity
   */
  private buildPronunciationActivity(level: string): Activity {
    const targets = {
      'A1': { pattern: 'French R sound', ipa: 'ʁ', examples: ['rue', 'très', 'partir'] },
      'A2': { pattern: 'Nasal vowels', ipa: 'ɑ̃, ɔ̃, ɛ̃', examples: ['vent', 'bon', 'vin'] },
      'B1': { pattern: 'Liaison', ipa: 'linking', examples: ['les amis', 'un homme'] },
      'B2': { pattern: 'Intonation patterns', ipa: 'prosody', examples: ['Tu viens ?', 'C\'est vrai !'] },
    };

    const target = targets[level as keyof typeof targets] || targets['A1'];

    return {
      id: `activity_${uuidv4()}`,
      type: 'pronunciation_drill',
      skill: 'speaking' as const,
      content: {
        pattern: target.pattern,
        ipa: target.ipa,
        examples: target.examples,
      },
      instructions: `Practice this pronunciation pattern: ${target.pattern}`,
      timeLimit: 60,
      requiresProduction: true,
      completed: false,
    };
  }

  /**
   * Build interleaved practice block
   */
  private buildInterleavedPractice(content: any, level: string): Activity[] {
    const activities: Activity[] = [];
    const vocab = content.vocabulary;
    const grammar = content.grammarRule;

    // 1. Translation to French
    activities.push({
      id: `activity_${uuidv4()}`,
      type: 'translation_to_french',
      skill: 'writing' as const,
      content: {
        sentences: vocab.slice(0, 3).map((v: any) => ({
          english: v.english,
          french: v.french,
        })),
      },
      instructions: 'Translate these words to French',
      requiresProduction: true,
      completed: false,
    });

    // 2. Listening comprehension
    activities.push({
      id: `activity_${uuidv4()}`,
      type: 'listening_comprehension',
      skill: 'listening' as const,
      content: {
        sentences: vocab.slice(0, 4).map((v: any) => v.french),
        task: 'identify',
      },
      instructions: 'Listen and identify the correct word',
      requiresProduction: false,
      completed: false,
    });

    // 3. Speaking response
    activities.push({
      id: `activity_${uuidv4()}`,
      type: 'speaking_response',
      skill: 'speaking' as const,
      content: {
        prompts: [
          { question: 'Comment dit-on "hello" en français ?', answer: 'bonjour' },
          { question: `Use "${vocab[0]?.french}" in a sentence`, answer: vocab[0]?.example },
        ],
      },
      instructions: 'Answer these questions out loud in French',
      requiresProduction: true,
      completed: false,
    });

    // 4. Grammar application (cloze)
    activities.push({
      id: `activity_${uuidv4()}`,
      type: 'cloze_exercise',
      skill: 'writing' as const,
      content: {
        grammarRuleId: grammar.title,
        sentences: grammar.examples?.map((e: any) => ({
          withBlank: e.french.replace(/\b\w+\b/, '___'),
          answer: e.french,
        })) || [],
      },
      instructions: 'Fill in the blanks using the grammar rule you learned',
      requiresProduction: true,
      completed: false,
    });

    // 5. Sentence construction
    activities.push({
      id: `activity_${uuidv4()}`,
      type: 'sentence_construction',
      skill: 'writing' as const,
      content: {
        words: vocab.slice(0, 3).map((v: any) => v.french),
        task: 'Make a sentence using at least one of these words',
      },
      instructions: 'Create your own sentence using the new vocabulary',
      requiresProduction: true,
      completed: false,
    });

    return activities;
  }

  /**
   * Build café conversation activity
   */
  private buildCafeActivity(content: any, level: string): Activity {
    const scenarios = [
      { context: 'Order a coffee at a café', location: 'cafe' },
      { context: 'Ask for directions on the street', location: 'street' },
      { context: 'Buy bread at the bakery', location: 'bakery' },
      { context: 'Check in at a hotel', location: 'hotel' },
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    return {
      id: `activity_${uuidv4()}`,
      type: 'conversation',
      skill: 'speaking' as const,
      content: {
        scenario: scenario.context,
        location: scenario.location,
        targetVocabulary: content.vocabulary.slice(0, 3).map((v: any) => v.french),
        level,
        strictMode: true,
      },
      instructions: `Practice this real-life scenario. Try to use today's vocabulary!`,
      timeLimit: 180,
      requiresProduction: true,
      completed: false,
    };
  }

  /**
   * Build wrap-up activity
   */
  private buildWrapUpActivity(): Activity {
    return {
      id: `activity_${uuidv4()}`,
      type: 'wrap_up',
      skill: 'reading' as const,
      content: {
        showWins: true,
        showRecurringError: true,
        scheduleReviews: true,
      },
      instructions: 'Review your progress and schedule tomorrow\'s reviews',
      requiresProduction: false,
      completed: false,
    };
  }

  // Helper methods

  private getLearnedVocabulary(userId: string): any[] {
    return this.db.prepare(`
      SELECT v.* FROM vocabulary v
      JOIN vocabulary_progress vp ON v.id = vp.vocabulary_id
      WHERE vp.user_id = ? AND vp.status != 'new'
      ORDER BY vp.last_reviewed DESC
      LIMIT 100
    `).all(userId) as any[];
  }

  private getRecallItems(userId: string): any[] {
    // Get items from different time intervals for spacing
    const intervals = [
      { label: 'yesterday', days: 1 },
      { label: 'week_ago', days: 7 },
      { label: 'month_ago', days: 30 },
    ];

    const items: any[] = [];

    for (const interval of intervals) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - interval.days);
      const startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 1);

      const item = this.db.prepare(`
        SELECT c.*, '${interval.label}' as source, ${interval.days} as daysAgo
        FROM srs_cards c
        WHERE c.user_id = ?
          AND c.last_reviewed BETWEEN ? AND ?
          AND c.status = 'review'
        ORDER BY RANDOM()
        LIMIT 1
      `).get(this.getCurrentUserId(), startDate.toISOString(), targetDate.toISOString()) as any;

      if (item) {
        items.push(item);
      }
    }

    return items;
  }

  private selectTheme(level: string, preferences?: string[]): string {
    const themes: Record<string, string[]> = {
      'A1': ['greetings', 'cafe_restaurant', 'numbers', 'family', 'daily_routine'],
      'A2': ['shopping', 'travel', 'health', 'home', 'weather'],
      'B1': ['work', 'culture', 'opinions', 'media', 'education'],
      'B2': ['society', 'environment', 'business', 'arts', 'science'],
    };

    const levelThemes = themes[level] || themes['A1'];
    const available = preferences?.length 
      ? levelThemes.filter(t => preferences.includes(t))
      : levelThemes;

    return available[Math.floor(Math.random() * available.length)] || levelThemes[0];
  }

  private selectGrammarFocus(userId: string, level: string): string | undefined {
    // Get grammar rules not yet mastered
    const unmastered = this.db.prepare(`
      SELECT gr.* FROM grammar_rules gr
      LEFT JOIN (
        SELECT DISTINCT source_id FROM srs_cards 
        WHERE user_id = ? AND source_type = 'grammar' AND correct_reviews > 5
      ) mastered ON gr.id = mastered.source_id
      WHERE gr.level = ? AND mastered.source_id IS NULL
      LIMIT 1
    `).get(userId, level) as any;

    return unmastered?.title;
  }

  private selectPronunciationTarget(level: string): any {
    const targets = {
      'A1': { focus: 'Basic vowels', patterns: ['a', 'e', 'i', 'o', 'u'] },
      'A2': { focus: 'Nasal vowels', patterns: ['an/en', 'on', 'in', 'un'] },
      'B1': { focus: 'Liaison', patterns: ['obligatory liaison', 'forbidden liaison'] },
      'B2': { focus: 'Rhythm and intonation', patterns: ['sentence stress', 'question intonation'] },
    };

    return targets[level as keyof typeof targets] || targets['A1'];
  }

  private parseLessonFromDb(row: any): DailyLesson {
    const content = JSON.parse(row.content);
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      level: row.level,
      targetDurationMinutes: 20,
      status: row.status,
      sections: content.sections,
      vocabulary: content.vocabulary,
      grammarRule: content.grammarRule,
      pronunciationTarget: content.pronunciationTarget,
      culturalNugget: content.culturalNugget,
      metrics: JSON.parse(row.metrics),
    };
  }

  private getCurrentUserId(): string {
    // This would normally come from the request context
    return '';
  }

  /**
   * Complete a lesson
   */
  completeLesson(lessonId: string, metrics: any): void {
    this.db.prepare(`
      UPDATE lessons 
      SET status = 'completed', 
          metrics = ?, 
          completed_at = ?
      WHERE id = ?
    `).run(JSON.stringify(metrics), new Date().toISOString(), lessonId);
  }
}

export const lessonBuilder = new LessonBuilder();
export { LessonBuilder };
