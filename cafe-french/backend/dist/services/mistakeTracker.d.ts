interface MistakeProfile {
    userId: string;
    grammarErrors: GrammarErrorCluster[];
    vocabularyConfusions: VocabularyConfusion[];
    pronunciationErrors: PronunciationErrorCluster[];
    graduatedErrors: string[];
    totalErrorsTracked: number;
    lastUpdated: Date;
}
interface GrammarErrorCluster {
    id: string;
    category: string;
    subcategory?: string;
    level: string;
    instances: ErrorInstance[];
    totalOccurrences: number;
    occurrencesLast7Days: number;
    firstOccurrence: Date;
    lastOccurrence: Date;
    status: 'new' | 'recurring' | 'improving' | 'monitoring' | 'graduated';
    graduationProgress: number;
    weeksWithoutError: number;
}
interface ErrorInstance {
    id: string;
    timestamp: Date;
    userInput: string;
    expectedOutput: string;
    explanation: string;
    context: {
        activityType: string;
        topic: string;
        timeInSession: number;
    };
    wasAddressed: boolean;
}
interface VocabularyConfusion {
    id: string;
    word1: string;
    word2: string;
    confusionType: string;
    instances: {
        timestamp: Date;
        context: string;
    }[];
    totalConfusions: number;
    status: 'new' | 'recurring' | 'improving' | 'monitoring' | 'graduated';
    differentiationTip: string;
}
interface PronunciationErrorCluster {
    id: string;
    phoneme: string;
    ipa: string;
    instances: {
        timestamp: Date;
        word: string;
        score: number;
    }[];
    totalOccurrences: number;
    status: 'new' | 'recurring' | 'improving' | 'monitoring' | 'graduated';
    averageScore: number;
    targetSound: string;
    commonSubstitution: string;
}
interface RemediationWorkout {
    id: string;
    userId: string;
    targetErrors: string[];
    exercises: RemediationExercise[];
    estimatedMinutes: number;
}
interface RemediationExercise {
    id: string;
    type: string;
    targetErrorId: string;
    instructions: string;
    items: {
        prompt: string;
        answer: string;
        explanation: string;
    }[];
}
declare class MistakeTracker {
    private _db;
    private graduationWeeks;
    private minCorrectUsages;
    private minDifferentContexts;
    private get db();
    /**
     * Get or create mistake profile for a user
     */
    getProfile(userId: string): MistakeProfile;
    /**
     * Create a new mistake profile
     */
    private createProfile;
    /**
     * Record a grammar error
     */
    recordGrammarError(userId: string, category: string, userInput: string, expectedOutput: string, explanation: string, context: {
        activityType: string;
        topic: string;
        timeInSession: number;
    }, level: string): void;
    /**
     * Record a vocabulary confusion
     */
    recordVocabularyConfusion(userId: string, word1: string, word2: string, confusionType: string, context: string): void;
    /**
     * Record a pronunciation error
     */
    recordPronunciationError(userId: string, phoneme: string, ipa: string, word: string, score: number, substitution?: string): void;
    /**
     * Record a correct usage (for graduation tracking)
     */
    recordCorrectUsage(userId: string, errorId: string): void;
    /**
     * Generate weekly remediation workout
     */
    generateRemediationWorkout(userId: string, maxMinutes?: number): Promise<RemediationWorkout>;
    /**
     * Get top recurring errors for display
     */
    getTopRecurringErrors(userId: string, limit?: number): Array<{
        id: string;
        type: string;
        description: string;
        occurrences: number;
        trend: 'increasing' | 'stable' | 'decreasing';
    }>;
    /**
     * Weekly update to check graduation and update statistics
     */
    weeklyUpdate(userId: string): void;
    private saveProfile;
    private calculateTotalErrors;
    private determineErrorStatus;
    private graduateError;
    private generateDifferentiationTip;
    private prioritizeErrors;
    private calculateTrend;
}
export declare const mistakeTracker: MistakeTracker;
export { MistakeTracker };
//# sourceMappingURL=mistakeTracker.d.ts.map