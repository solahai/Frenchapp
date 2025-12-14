"use strict";
// Speech Services Routes (TTS/STT)
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openai_1 = require("../services/openai");
const elevenlabs_1 = require("../services/elevenlabs");
const rateLimiter_1 = require("../middleware/rateLimiter");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// POST /speech/tts
router.post('/tts', rateLimiter_1.speechRateLimiter, async (req, res, next) => {
    try {
        const { text, voice, speed } = req.body;
        if (!text) {
            throw new errorHandler_1.ValidationError('Text is required');
        }
        if (text.length > 500) {
            throw new errorHandler_1.ValidationError('Text too long (max 500 characters)');
        }
        const audioBuffer = await elevenlabs_1.elevenLabsService.textToSpeech(text, {
            voiceId: voice,
            speed: speed || 1.0,
        });
        // Convert to base64 for JSON response
        const audioBase64 = audioBuffer.toString('base64');
        res.json({
            success: true,
            data: {
                audioData: audioBase64,
                format: 'mp3',
                text,
                duration: Math.ceil(text.length / 15), // Rough estimate
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /speech/stt
router.post('/stt', rateLimiter_1.speechRateLimiter, async (req, res, next) => {
    try {
        const { audioData, language } = req.body;
        if (!audioData) {
            throw new errorHandler_1.ValidationError('Audio data is required');
        }
        const audioBuffer = Buffer.from(audioData, 'base64');
        const transcription = await openai_1.openAIService.transcribeAudio(audioBuffer, language || 'fr');
        res.json({
            success: true,
            data: {
                transcription: transcription.text,
                confidence: transcription.confidence,
                words: transcription.words,
                language: language || 'fr',
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /speech/voices
router.get('/voices', (_req, res) => {
    const voices = elevenlabs_1.elevenLabsService.getFrenchVoices();
    res.json({
        success: true,
        data: voices,
    });
});
// POST /speech/vocabulary
router.post('/vocabulary', rateLimiter_1.speechRateLimiter, async (req, res, next) => {
    try {
        const { word } = req.body;
        if (!word) {
            throw new errorHandler_1.ValidationError('Word is required');
        }
        const audioBuffer = await elevenlabs_1.elevenLabsService.generateVocabularyAudio(word);
        const audioBase64 = audioBuffer.toString('base64');
        res.json({
            success: true,
            data: {
                word,
                audioData: audioBase64,
                format: 'mp3',
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /speech/conversation
router.post('/conversation', rateLimiter_1.speechRateLimiter, async (req, res, next) => {
    try {
        const { text, gender } = req.body;
        if (!text) {
            throw new errorHandler_1.ValidationError('Text is required');
        }
        const audioBuffer = await elevenlabs_1.elevenLabsService.generateConversationAudio(text, gender || 'female');
        const audioBase64 = audioBuffer.toString('base64');
        res.json({
            success: true,
            data: {
                text,
                audioData: audioBase64,
                format: 'mp3',
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /speech/shadowing
router.post('/shadowing', rateLimiter_1.speechRateLimiter, async (req, res, next) => {
    try {
        const { text, speed } = req.body;
        if (!text) {
            throw new errorHandler_1.ValidationError('Text is required');
        }
        const audioBuffer = await elevenlabs_1.elevenLabsService.generateShadowingAudio(text, speed || 1.0);
        const audioBase64 = audioBuffer.toString('base64');
        res.json({
            success: true,
            data: {
                text,
                speed: speed || 1.0,
                audioData: audioBase64,
                format: 'mp3',
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=speech.js.map