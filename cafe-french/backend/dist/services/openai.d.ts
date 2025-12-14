interface ConversationMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
interface GrammarExplanation {
    whatItMeans: string;
    whenToUse: string;
    howToForm: string;
    examples: Array<{
        french: string;
        english: string;
    }>;
    commonMistakes: string[];
    quickCheck: {
        question: string;
        answer: string;
    };
}
interface CorrectionResult {
    hasErrors: boolean;
    correctedText: string;
    errors: Array<{
        type: string;
        original: string;
        correction: string;
        explanation: string;
        severity: 'minor' | 'moderate' | 'major';
    }>;
    overallFeedback: string;
    shouldRepair: boolean;
}
interface LessonContent {
    vocabulary: Array<{
        french: string;
        english: string;
        ipa: string;
        example: string;
        gender?: 'masculine' | 'feminine';
    }>;
    grammarRule: {
        title: string;
        explanation: string;
        examples: Array<{
            french: string;
            english: string;
        }>;
        practice: string;
    };
    culturalNugget: {
        title: string;
        content: string;
        funFact: string;
    };
}
declare class OpenAIService {
    private client;
    private model;
    constructor();
    /**
     * Generate a French conversation response
     */
    generateConversationResponse(messages: ConversationMessage[], scenario: string, level: string, strictMode?: boolean): Promise<{
        response: string;
        corrections: CorrectionResult | null;
    }>;
    /**
     * Analyze and correct French text
     */
    analyzeAndCorrect(text: string, level: string, context?: string): Promise<CorrectionResult>;
    /**
     * Generate kid-simple grammar explanation
     */
    explainGrammar(topic: string, level: string, userQuestion?: string): Promise<GrammarExplanation>;
    /**
     * Generate daily lesson content
     */
    generateLessonContent(level: string, theme: string, previousVocabulary: string[], focusGrammar?: string): Promise<LessonContent>;
    /**
     * Generate pronunciation feedback
     */
    analyzePronunciation(targetText: string, transcription: string, level: string): Promise<{
        score: number;
        phonemeIssues: Array<{
            phoneme: string;
            issue: string;
            tip: string;
        }>;
        rhythmFeedback: string;
        actionableFixes: string[];
    }>;
    /**
     * Generate remediation exercises for specific errors
     */
    generateRemediationExercises(errorType: string, errorExamples: string[], level: string): Promise<Array<{
        type: string;
        instruction: string;
        items: Array<{
            prompt: string;
            answer: string;
            explanation: string;
        }>;
    }>>;
    /**
     * Transcribe audio using Whisper
     */
    transcribeAudio(audioBuffer: Buffer, language?: 'fr' | 'en'): Promise<{
        text: string;
        confidence: number;
        words?: Array<{
            word: string;
            start: number;
            end: number;
        }>;
    }>;
    private buildConversationSystemPrompt;
    private parseConversationResponse;
}
export declare const openAIService: OpenAIService;
export { OpenAIService };
//# sourceMappingURL=openai.d.ts.map