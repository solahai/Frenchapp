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
declare class LessonBuilder {
    private db;
    private maxNewItems;
    private optimalNewItems;
    private reviewToNewRatio;
    constructor();
    /**
     * Generate a complete daily lesson
     */
    generateDailyLesson(userId: string, date: string, level: string, durationMinutes?: number, focusAreas?: string[], preferredTopics?: string[]): Promise<DailyLesson>;
    /**
     * Build lesson sections based on the 20-minute structure
     */
    private buildSections;
    /**
     * Build recall activities from due SRS items
     */
    private buildRecallActivities;
    /**
     * Build vocabulary introduction activities
     */
    private buildVocabularyActivities;
    /**
     * Build grammar explanation activity
     */
    private buildGrammarActivity;
    /**
     * Build pronunciation activity
     */
    private buildPronunciationActivity;
    /**
     * Build interleaved practice block
     */
    private buildInterleavedPractice;
    /**
     * Build café conversation activity
     */
    private buildCafeActivity;
    /**
     * Build wrap-up activity
     */
    private buildWrapUpActivity;
    private getLearnedVocabulary;
    private getRecallItems;
    private selectTheme;
    private selectGrammarFocus;
    private selectPronunciationTarget;
    private parseLessonFromDb;
    private getCurrentUserId;
    /**
     * Complete a lesson
     */
    completeLesson(lessonId: string, metrics: any): void;
}
export declare const lessonBuilder: LessonBuilder;
export { LessonBuilder };
//# sourceMappingURL=lessonBuilder.d.ts.map