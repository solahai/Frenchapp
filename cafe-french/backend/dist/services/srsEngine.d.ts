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
declare class SRSEngine {
    private _db;
    private learningSteps;
    private graduatingInterval;
    private easyInterval;
    private startingEase;
    private minimumEase;
    private easyBonus;
    private hardIntervalModifier;
    private lapseNewInterval;
    private leechThreshold;
    private get db();
    /**
     * Get cards due for review
     */
    getDueCards(userId: string, limit?: number): SRSCard[];
    /**
     * Get new cards for today
     */
    getNewCards(userId: string, limit?: number): SRSCard[];
    /**
     * Process a review and update the card
     */
    processReview(cardId: string, quality: Quality, timeSpent: number): ReviewResult;
    /**
     * Create a new card
     */
    createCard(userId: string, type: string, front: string | object, back: string | object, sourceType: string, sourceId: string, level: string, tags?: string[]): SRSCard;
    /**
     * Create cards from vocabulary
     */
    createVocabularyCards(userId: string, vocabularyId: string, vocabulary: {
        french: string;
        english: string;
        ipa: string;
        example: string;
        level: string;
    }): SRSCard[];
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
    };
    /**
     * Suspend a card
     */
    suspendCard(cardId: string): void;
    /**
     * Unsuspend a card
     */
    unsuspendCard(cardId: string): void;
    /**
     * Mark a card as a leech (too many lapses)
     */
    private markAsLeech;
    /**
     * Get forecast of upcoming reviews
     */
    getForecast(userId: string, days?: number): Array<{
        date: string;
        newCards: number;
        reviewCards: number;
    }>;
}
export declare const srsEngine: SRSEngine;
export { SRSEngine };
//# sourceMappingURL=srsEngine.d.ts.map