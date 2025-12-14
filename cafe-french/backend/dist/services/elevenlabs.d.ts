interface TTSOptions {
    voiceId?: string;
    speed?: number;
    stability?: number;
    similarity?: number;
}
declare class ElevenLabsService {
    private apiKey;
    private baseUrl;
    private defaultVoiceId;
    constructor();
    /**
     * Generate speech from text
     */
    textToSpeech(text: string, options?: TTSOptions): Promise<Buffer>;
    /**
     * Generate speech with streaming (for real-time playback)
     */
    textToSpeechStream(text: string, options?: TTSOptions): Promise<NodeJS.ReadableStream>;
    /**
     * Get available voices
     */
    getVoices(): Promise<Array<{
        id: string;
        name: string;
        language: string;
    }>>;
    /**
     * Generate speech for vocabulary with slower speed
     */
    generateVocabularyAudio(word: string): Promise<Buffer>;
    /**
     * Generate speech for conversation (natural speed)
     */
    generateConversationAudio(text: string, voiceGender?: 'male' | 'female'): Promise<Buffer>;
    /**
     * Generate slow speech for shadowing exercises
     */
    generateShadowingAudio(text: string, speed?: 0.75 | 1.0 | 1.25): Promise<Buffer>;
    /**
     * Get available French voices for user selection
     */
    getFrenchVoices(): Array<{
        id: string;
        name: string;
        gender: string;
    }>;
}
export declare const elevenLabsService: ElevenLabsService;
export { ElevenLabsService };
//# sourceMappingURL=elevenlabs.d.ts.map