// Spaced Repetition System Engine
// Implements SM-2 algorithm with modifications for language learning

import { DatabaseService } from './database';
import { v4 as uuidv4 } from 'uuid';

interface SRSCard {
  id: string;
  user_id: string;
  type: string;
  front: string;
  back: string;
  source_type: string;
  source_id: string;
  level: string;
  tags: string;
  status: 'new' | 'learning' | 'review' | 'relearning' | 'suspended';
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  last_reviewed: string | null;
  total_reviews: number;
  correct_reviews: number;
  lapses: number;
}

interface ReviewResult {
  card: SRSCard;
  nextReview: Date;
  intervalDays: number;
}

type Quality = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = complete blackout
// 1 = wrong, but remembered after seeing answer
// 2 = wrong, seemed familiar
// 3 = correct with difficulty
// 4 = correct after hesitation
// 5 = perfect, instant recall

class SRSEngine {
  private db: ReturnType<DatabaseService['getDb']>;

  // Learning steps in minutes
  private learningSteps = [1, 10, 60, 1440]; // 1min, 10min, 1hr, 1day
  private graduatingInterval = 1; // days
  private easyInterval = 4; // days
  private startingEase = 2.5;
  private minimumEase = 1.3;
  private easyBonus = 1.3;
  private hardIntervalModifier = 1.2;
  private lapseNewInterval = 0.0; // Reset to 0 on lapse
  private leechThreshold = 8;

  constructor() {
    this.db = DatabaseService.getInstance().getDb();
  }

  /**
   * Get cards due for review
   */
  getDueCards(userId: string, limit: number = 50): SRSCard[] {
    const now = new Date().toISOString();
    
    const cards = this.db.prepare(`
      SELECT * FROM srs_cards 
      WHERE user_id = ? 
        AND status != 'suspended'
        AND (next_review IS NULL OR next_review <= ?)
      ORDER BY 
        CASE status 
          WHEN 'relearning' THEN 0
          WHEN 'learning' THEN 1
          WHEN 'review' THEN 2
          WHEN 'new' THEN 3
        END,
        next_review ASC
      LIMIT ?
    `).all(userId, now, limit) as SRSCard[];

    return cards;
  }

  /**
   * Get new cards for today
   */
  getNewCards(userId: string, limit: number = 20): SRSCard[] {
    const cards = this.db.prepare(`
      SELECT * FROM srs_cards 
      WHERE user_id = ? 
        AND status = 'new'
      ORDER BY created_at ASC
      LIMIT ?
    `).all(userId, limit) as SRSCard[];

    return cards;
  }

  /**
   * Process a review and update the card
   */
  processReview(cardId: string, quality: Quality, timeSpent: number): ReviewResult {
    const card = this.db.prepare('SELECT * FROM srs_cards WHERE id = ?').get(cardId) as SRSCard;
    
    if (!card) {
      throw new Error(`Card not found: ${cardId}`);
    }

    let newStatus = card.status;
    let newEase = card.ease_factor;
    let newInterval = card.interval;
    let newRepetitions = card.repetitions;
    let newLapses = card.lapses;

    const now = new Date();

    if (quality < 3) {
      // Failed review
      newLapses++;
      newRepetitions = 0;
      
      if (card.status === 'review' || card.status === 'relearning') {
        newStatus = 'relearning';
        newInterval = 1; // Reset to 1 day
      } else {
        newStatus = 'learning';
      }

      // Decrease ease factor
      newEase = Math.max(this.minimumEase, card.ease_factor - 0.2);

    } else {
      // Successful review
      newRepetitions++;

      if (card.status === 'new' || card.status === 'learning') {
        // Progress through learning steps
        const currentStep = this.learningSteps.findIndex(s => s >= card.interval * 1440) || 0;
        
        if (quality === 5 || currentStep >= this.learningSteps.length - 1) {
          // Graduate to review
          newStatus = 'review';
          newInterval = quality === 5 ? this.easyInterval : this.graduatingInterval;
        } else {
          // Move to next learning step
          newStatus = 'learning';
          newInterval = this.learningSteps[currentStep + 1] / 1440; // Convert minutes to days
        }

      } else if (card.status === 'review' || card.status === 'relearning') {
        newStatus = 'review';
        
        // Calculate new interval based on quality
        if (quality === 3) {
          // Hard - multiply by hard modifier
          newInterval = Math.round(card.interval * this.hardIntervalModifier);
        } else if (quality === 4) {
          // Good - multiply by ease factor
          newInterval = Math.round(card.interval * card.ease_factor);
        } else if (quality === 5) {
          // Easy - multiply by ease factor and easy bonus
          newInterval = Math.round(card.interval * card.ease_factor * this.easyBonus);
        }

        // Update ease factor
        newEase = card.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        newEase = Math.max(this.minimumEase, newEase);
      }
    }

    // Ensure minimum interval of 1 day for reviews
    if (newStatus === 'review') {
      newInterval = Math.max(1, newInterval);
    }

    // Calculate next review date
    const nextReview = new Date(now);
    if (newStatus === 'learning' || newStatus === 'relearning') {
      // For learning cards, interval is in minutes
      const minutes = this.learningSteps[Math.min(newRepetitions, this.learningSteps.length - 1)] || 10;
      nextReview.setMinutes(nextReview.getMinutes() + minutes);
    } else {
      nextReview.setDate(nextReview.getDate() + newInterval);
    }

    // Update the card in database
    this.db.prepare(`
      UPDATE srs_cards SET
        status = ?,
        ease_factor = ?,
        interval = ?,
        repetitions = ?,
        lapses = ?,
        next_review = ?,
        last_reviewed = ?,
        total_reviews = total_reviews + 1,
        correct_reviews = correct_reviews + ?
      WHERE id = ?
    `).run(
      newStatus,
      newEase,
      newInterval,
      newRepetitions,
      newLapses,
      nextReview.toISOString(),
      now.toISOString(),
      quality >= 3 ? 1 : 0,
      cardId
    );

    // Check for leech
    if (newLapses >= this.leechThreshold) {
      this.markAsLeech(cardId);
    }

    return {
      card: {
        ...card,
        status: newStatus,
        ease_factor: newEase,
        interval: newInterval,
        repetitions: newRepetitions,
        lapses: newLapses,
        next_review: nextReview.toISOString(),
        last_reviewed: now.toISOString(),
      },
      nextReview,
      intervalDays: newInterval,
    };
  }

  /**
   * Create a new card
   */
  createCard(
    userId: string,
    type: string,
    front: string | object,
    back: string | object,
    sourceType: string,
    sourceId: string,
    level: string,
    tags: string[] = []
  ): SRSCard {
    const id = `card_${uuidv4()}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO srs_cards (id, user_id, type, front, back, source_type, source_id, level, tags, status, ease_factor, interval, next_review, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 0, ?, ?)
    `).run(
      id,
      userId,
      type,
      JSON.stringify(front),
      JSON.stringify(back),
      sourceType,
      sourceId,
      level,
      JSON.stringify(tags),
      this.startingEase,
      now,
      now
    );

    return this.db.prepare('SELECT * FROM srs_cards WHERE id = ?').get(id) as SRSCard;
  }

  /**
   * Create cards from vocabulary
   */
  createVocabularyCards(userId: string, vocabularyId: string, vocabulary: {
    french: string;
    english: string;
    ipa: string;
    example: string;
    level: string;
  }): SRSCard[] {
    const cards: SRSCard[] = [];

    // Card 1: English to French (production - harder)
    cards.push(this.createCard(
      userId,
      'l1_to_l2',
      { text: vocabulary.english, hint: vocabulary.ipa },
      { text: vocabulary.french, audio: true },
      'vocabulary',
      vocabularyId,
      vocabulary.level,
      ['vocabulary', 'production']
    ));

    // Card 2: French to English (recognition - easier)
    cards.push(this.createCard(
      userId,
      'l2_to_l1',
      { text: vocabulary.french, audio: true },
      { text: vocabulary.english },
      'vocabulary',
      vocabularyId,
      vocabulary.level,
      ['vocabulary', 'recognition']
    ));

    // Card 3: Audio recognition
    cards.push(this.createCard(
      userId,
      'audio_recognition',
      { audio: true, text: '🔊 Listen' },
      { text: `${vocabulary.french} - ${vocabulary.english}` },
      'vocabulary',
      vocabularyId,
      vocabulary.level,
      ['vocabulary', 'listening']
    ));

    // Card 4: Cloze deletion with example
    if (vocabulary.example) {
      const clozeText = vocabulary.example.replace(
        new RegExp(vocabulary.french, 'i'),
        '[...]'
      );
      cards.push(this.createCard(
        userId,
        'cloze',
        { text: clozeText },
        { text: vocabulary.french, context: vocabulary.example },
        'vocabulary',
        vocabularyId,
        vocabulary.level,
        ['vocabulary', 'context']
      ));
    }

    return cards;
  }

  /**
   * Get study statistics
   */
  getStats(userId: string): {
    newCount: number;
    learningCount: number;
    reviewCount: number;
    dueToday: number;
    retention7Days: number;
    averageEase: number;
  } {
    const now = new Date().toISOString();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const counts = this.db.prepare(`
      SELECT 
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning_count,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review_count,
        SUM(CASE WHEN next_review <= ? THEN 1 ELSE 0 END) as due_today,
        AVG(ease_factor) as avg_ease
      FROM srs_cards
      WHERE user_id = ? AND status != 'suspended'
    `).get(now, userId) as any;

    // Calculate 7-day retention
    const reviews = this.db.prepare(`
      SELECT correct_reviews, total_reviews
      FROM srs_cards
      WHERE user_id = ? 
        AND last_reviewed >= ?
        AND total_reviews > 0
    `).all(userId, sevenDaysAgo.toISOString()) as { correct_reviews: number; total_reviews: number }[];

    let retention = 0;
    if (reviews.length > 0) {
      const totalCorrect = reviews.reduce((sum, r) => sum + r.correct_reviews, 0);
      const totalReviews = reviews.reduce((sum, r) => sum + r.total_reviews, 0);
      retention = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
    }

    return {
      newCount: counts.new_count || 0,
      learningCount: counts.learning_count || 0,
      reviewCount: counts.review_count || 0,
      dueToday: counts.due_today || 0,
      retention7Days: Math.round(retention),
      averageEase: Math.round((counts.avg_ease || 2.5) * 100) / 100,
    };
  }

  /**
   * Suspend a card
   */
  suspendCard(cardId: string): void {
    this.db.prepare(`
      UPDATE srs_cards SET status = 'suspended' WHERE id = ?
    `).run(cardId);
  }

  /**
   * Unsuspend a card
   */
  unsuspendCard(cardId: string): void {
    this.db.prepare(`
      UPDATE srs_cards SET status = 'review', next_review = ? WHERE id = ?
    `).run(new Date().toISOString(), cardId);
  }

  /**
   * Mark a card as a leech (too many lapses)
   */
  private markAsLeech(cardId: string): void {
    const card = this.db.prepare('SELECT * FROM srs_cards WHERE id = ?').get(cardId) as SRSCard;
    
    if (card) {
      const tags = JSON.parse(card.tags || '[]');
      if (!tags.includes('leech')) {
        tags.push('leech');
        this.db.prepare(`
          UPDATE srs_cards SET tags = ? WHERE id = ?
        `).run(JSON.stringify(tags), cardId);
      }
    }
  }

  /**
   * Get forecast of upcoming reviews
   */
  getForecast(userId: string, days: number = 7): Array<{
    date: string;
    newCards: number;
    reviewCards: number;
  }> {
    const forecast: Array<{ date: string; newCards: number; reviewCards: number }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const counts = this.db.prepare(`
        SELECT 
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_cards,
          SUM(CASE WHEN status != 'new' THEN 1 ELSE 0 END) as review_cards
        FROM srs_cards
        WHERE user_id = ?
          AND status != 'suspended'
          AND next_review >= ?
          AND next_review < ?
      `).get(userId, date.toISOString(), nextDay.toISOString()) as any;

      forecast.push({
        date: dateStr,
        newCards: counts?.new_cards || 0,
        reviewCards: counts?.review_cards || 0,
      });
    }

    return forecast;
  }
}

export const srsEngine = new SRSEngine();
export { SRSEngine };
