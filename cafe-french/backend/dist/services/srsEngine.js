"use strict";
// Spaced Repetition System Engine
// Implements SM-2 algorithm with modifications for language learning
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRSEngine = exports.srsEngine = void 0;
const database_1 = require("./database");
const uuid_1 = require("uuid");
// 0 = complete blackout
// 1 = wrong, but remembered after seeing answer
// 2 = wrong, seemed familiar
// 3 = correct with difficulty
// 4 = correct after hesitation
// 5 = perfect, instant recall
class SRSEngine {
    constructor() {
        // Learning steps in minutes
        this.learningSteps = [1, 10, 60, 1440]; // 1min, 10min, 1hr, 1day
        this.graduatingInterval = 1; // days
        this.easyInterval = 4; // days
        this.startingEase = 2.5;
        this.minimumEase = 1.3;
        this.easyBonus = 1.3;
        this.hardIntervalModifier = 1.2;
        this.lapseNewInterval = 0.0; // Reset to 0 on lapse
        this.leechThreshold = 8;
        this.db = database_1.DatabaseService.getInstance().getDb();
    }
    /**
     * Get cards due for review
     */
    getDueCards(userId, limit = 50) {
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
    `).all(userId, now, limit);
        return cards;
    }
    /**
     * Get new cards for today
     */
    getNewCards(userId, limit = 20) {
        const cards = this.db.prepare(`
      SELECT * FROM srs_cards 
      WHERE user_id = ? 
        AND status = 'new'
      ORDER BY created_at ASC
      LIMIT ?
    `).all(userId, limit);
        return cards;
    }
    /**
     * Process a review and update the card
     */
    processReview(cardId, quality, timeSpent) {
        const card = this.db.prepare('SELECT * FROM srs_cards WHERE id = ?').get(cardId);
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
            }
            else {
                newStatus = 'learning';
            }
            // Decrease ease factor
            newEase = Math.max(this.minimumEase, card.ease_factor - 0.2);
        }
        else {
            // Successful review
            newRepetitions++;
            if (card.status === 'new' || card.status === 'learning') {
                // Progress through learning steps
                const currentStep = this.learningSteps.findIndex(s => s >= card.interval * 1440) || 0;
                if (quality === 5 || currentStep >= this.learningSteps.length - 1) {
                    // Graduate to review
                    newStatus = 'review';
                    newInterval = quality === 5 ? this.easyInterval : this.graduatingInterval;
                }
                else {
                    // Move to next learning step
                    newStatus = 'learning';
                    newInterval = this.learningSteps[currentStep + 1] / 1440; // Convert minutes to days
                }
            }
            else if (card.status === 'review' || card.status === 'relearning') {
                newStatus = 'review';
                // Calculate new interval based on quality
                if (quality === 3) {
                    // Hard - multiply by hard modifier
                    newInterval = Math.round(card.interval * this.hardIntervalModifier);
                }
                else if (quality === 4) {
                    // Good - multiply by ease factor
                    newInterval = Math.round(card.interval * card.ease_factor);
                }
                else if (quality === 5) {
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
        }
        else {
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
    `).run(newStatus, newEase, newInterval, newRepetitions, newLapses, nextReview.toISOString(), now.toISOString(), quality >= 3 ? 1 : 0, cardId);
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
    createCard(userId, type, front, back, sourceType, sourceId, level, tags = []) {
        const id = `card_${(0, uuid_1.v4)()}`;
        const now = new Date().toISOString();
        this.db.prepare(`
      INSERT INTO srs_cards (id, user_id, type, front, back, source_type, source_id, level, tags, status, ease_factor, interval, next_review, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 0, ?, ?)
    `).run(id, userId, type, JSON.stringify(front), JSON.stringify(back), sourceType, sourceId, level, JSON.stringify(tags), this.startingEase, now, now);
        return this.db.prepare('SELECT * FROM srs_cards WHERE id = ?').get(id);
    }
    /**
     * Create cards from vocabulary
     */
    createVocabularyCards(userId, vocabularyId, vocabulary) {
        const cards = [];
        // Card 1: English to French (production - harder)
        cards.push(this.createCard(userId, 'l1_to_l2', { text: vocabulary.english, hint: vocabulary.ipa }, { text: vocabulary.french, audio: true }, 'vocabulary', vocabularyId, vocabulary.level, ['vocabulary', 'production']));
        // Card 2: French to English (recognition - easier)
        cards.push(this.createCard(userId, 'l2_to_l1', { text: vocabulary.french, audio: true }, { text: vocabulary.english }, 'vocabulary', vocabularyId, vocabulary.level, ['vocabulary', 'recognition']));
        // Card 3: Audio recognition
        cards.push(this.createCard(userId, 'audio_recognition', { audio: true, text: '🔊 Listen' }, { text: `${vocabulary.french} - ${vocabulary.english}` }, 'vocabulary', vocabularyId, vocabulary.level, ['vocabulary', 'listening']));
        // Card 4: Cloze deletion with example
        if (vocabulary.example) {
            const clozeText = vocabulary.example.replace(new RegExp(vocabulary.french, 'i'), '[...]');
            cards.push(this.createCard(userId, 'cloze', { text: clozeText }, { text: vocabulary.french, context: vocabulary.example }, 'vocabulary', vocabularyId, vocabulary.level, ['vocabulary', 'context']));
        }
        return cards;
    }
    /**
     * Get study statistics
     */
    getStats(userId) {
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
    `).get(now, userId);
        // Calculate 7-day retention
        const reviews = this.db.prepare(`
      SELECT correct_reviews, total_reviews
      FROM srs_cards
      WHERE user_id = ? 
        AND last_reviewed >= ?
        AND total_reviews > 0
    `).all(userId, sevenDaysAgo.toISOString());
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
    suspendCard(cardId) {
        this.db.prepare(`
      UPDATE srs_cards SET status = 'suspended' WHERE id = ?
    `).run(cardId);
    }
    /**
     * Unsuspend a card
     */
    unsuspendCard(cardId) {
        this.db.prepare(`
      UPDATE srs_cards SET status = 'review', next_review = ? WHERE id = ?
    `).run(new Date().toISOString(), cardId);
    }
    /**
     * Mark a card as a leech (too many lapses)
     */
    markAsLeech(cardId) {
        const card = this.db.prepare('SELECT * FROM srs_cards WHERE id = ?').get(cardId);
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
    getForecast(userId, days = 7) {
        const forecast = [];
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
      `).get(userId, date.toISOString(), nextDay.toISOString());
            forecast.push({
                date: dateStr,
                newCards: counts?.new_cards || 0,
                reviewCards: counts?.review_cards || 0,
            });
        }
        return forecast;
    }
}
exports.SRSEngine = SRSEngine;
exports.srsEngine = new SRSEngine();
//# sourceMappingURL=srsEngine.js.map