"use strict";
// Pronunciation Routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const openai_1 = require("../services/openai");
const mistakeTracker_1 = require("../services/mistakeTracker");
const rateLimiter_1 = require("../middleware/rateLimiter");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Shadowing phrases by level
const SHADOWING_PHRASES = {
    'A1': [
        { text: 'Bonjour, comment allez-vous ?', ipa: 'bɔ̃.ʒuʁ, kɔ.mɑ̃ a.le vu', translation: 'Hello, how are you?' },
        { text: 'Je voudrais un café, s\'il vous plaît.', ipa: 'ʒə vu.dʁɛ œ̃ ka.fe, sil vu plɛ', translation: 'I would like a coffee, please.' },
        { text: 'Merci beaucoup, au revoir !', ipa: 'mɛʁ.si bo.ku, o ʁə.vwaʁ', translation: 'Thank you very much, goodbye!' },
        { text: 'Je m\'appelle Marie.', ipa: 'ʒə ma.pɛl ma.ʁi', translation: 'My name is Marie.' },
        { text: 'Où est la gare ?', ipa: 'u ɛ la ɡaʁ', translation: 'Where is the train station?' },
        { text: 'Je ne comprends pas.', ipa: 'ʒə nə kɔ̃.pʁɑ̃ pa', translation: 'I don\'t understand.' },
        { text: 'Parlez-vous anglais ?', ipa: 'paʁ.le vu ɑ̃.ɡlɛ', translation: 'Do you speak English?' },
        { text: 'L\'addition, s\'il vous plaît.', ipa: 'la.di.sjɔ̃, sil vu plɛ', translation: 'The bill, please.' },
        { text: 'C\'est très bon !', ipa: 'sɛ tʁɛ bɔ̃', translation: 'It\'s very good!' },
        { text: 'À quelle heure ?', ipa: 'a kɛ.l‿œʁ', translation: 'At what time?' },
    ],
    'A2': [
        { text: 'Je voudrais réserver une table pour deux personnes.', ipa: 'ʒə vu.dʁɛ ʁe.zɛʁ.ve yn tabl puʁ dø pɛʁ.sɔn', translation: 'I would like to reserve a table for two.' },
        { text: 'Pourriez-vous parler plus lentement ?', ipa: 'pu.ʁje vu paʁ.le ply lɑ̃t.mɑ̃', translation: 'Could you speak more slowly?' },
        { text: 'J\'ai besoin d\'aide, s\'il vous plaît.', ipa: 'ʒe bə.zwɛ̃ dɛd, sil vu plɛ', translation: 'I need help, please.' },
        { text: 'Qu\'est-ce que vous recommandez ?', ipa: 'kɛs kə vu ʁə.kɔ.mɑ̃.de', translation: 'What do you recommend?' },
        { text: 'Je cherche la pharmacie.', ipa: 'ʒə ʃɛʁʃ la faʁ.ma.si', translation: 'I\'m looking for the pharmacy.' },
    ],
    'B1': [
        { text: 'Je suis en train d\'apprendre le français depuis six mois.', ipa: 'ʒə sɥi ɑ̃ tʁɛ̃ da.pʁɑ̃dʁ lə fʁɑ̃.sɛ də.pɥi si mwa', translation: 'I have been learning French for six months.' },
        { text: 'Si j\'avais su, je serais venu plus tôt.', ipa: 'si ʒa.vɛ sy, ʒə sə.ʁɛ və.ny ply to', translation: 'If I had known, I would have come earlier.' },
        { text: 'Il faut que je finisse ce projet avant demain.', ipa: 'il fo kə ʒə fi.nis sə pʁɔ.ʒɛ a.vɑ̃ də.mɛ̃', translation: 'I have to finish this project before tomorrow.' },
    ],
};
// POST /pronunciation/assess
router.post('/assess', rateLimiter_1.speechRateLimiter, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { targetText, audioData, level } = req.body;
        if (!targetText || !audioData) {
            throw new errorHandler_1.ValidationError('Target text and audio data required');
        }
        // Transcribe audio using Whisper
        const audioBuffer = Buffer.from(audioData, 'base64');
        const transcription = await openai_1.openAIService.transcribeAudio(audioBuffer, 'fr');
        // Analyze pronunciation
        const analysis = await openai_1.openAIService.analyzePronunciation(targetText, transcription.text, level || 'A1');
        // Record pronunciation errors
        for (const issue of analysis.phonemeIssues) {
            mistakeTracker_1.mistakeTracker.recordPronunciationError(userId, issue.phoneme, issue.phoneme, // IPA would need lookup
            targetText, analysis.score);
        }
        const assessmentId = `pa_${(0, uuid_1.v4)()}`;
        res.json({
            success: true,
            data: {
                assessment: {
                    id: assessmentId,
                    targetText,
                    transcription: transcription.text,
                    overallScore: analysis.score,
                    scores: {
                        phonemeAccuracy: analysis.score,
                        linking: Math.max(0, analysis.score - 10),
                        prosody: Math.max(0, analysis.score - 5),
                        intelligibility: analysis.score,
                    },
                    phonemeAnalysis: analysis.phonemeIssues.map((issue, i) => ({
                        phoneme: issue.phoneme,
                        score: Math.max(0, analysis.score - i * 10),
                        feedback: issue.issue,
                    })),
                    actionableFixes: analysis.actionableFixes.map((fix, i) => ({
                        priority: i + 1,
                        issue: fix,
                        howToFix: analysis.phonemeIssues[i]?.tip || 'Practice slowly and clearly.',
                    })),
                },
                suggestions: analysis.actionableFixes,
                practiceRecommendations: analysis.phonemeIssues.map(i => i.tip),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /pronunciation/shadowing
router.get('/shadowing', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const level = req.query.level || 'A1';
        const count = parseInt(req.query.count) || 10;
        const phrases = SHADOWING_PHRASES[level] || SHADOWING_PHRASES['A1'];
        const selectedPhrases = phrases.slice(0, count);
        const sessionId = `shadow_${(0, uuid_1.v4)()}`;
        res.json({
            success: true,
            data: {
                session: {
                    id: sessionId,
                    userId,
                    level,
                    phrases: selectedPhrases.map((phrase, i) => ({
                        id: `phrase_${i}`,
                        ...phrase,
                        duration: Math.ceil(phrase.text.length / 10), // Rough estimate
                    })),
                    completedPhrases: 0,
                    currentPhraseIndex: 0,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /pronunciation/shadowing/:phraseId/attempt
router.post('/shadowing/:phraseId/attempt', rateLimiter_1.speechRateLimiter, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { phraseId } = req.params;
        const { audioData, targetText, speed } = req.body;
        if (!audioData || !targetText) {
            throw new errorHandler_1.ValidationError('Audio data and target text required');
        }
        // Transcribe
        const audioBuffer = Buffer.from(audioData, 'base64');
        const transcription = await openai_1.openAIService.transcribeAudio(audioBuffer, 'fr');
        // Simple comparison for rhythm match
        const targetWords = targetText.split(' ').length;
        const spokenWords = transcription.text.split(' ').length;
        const wordMatchRatio = Math.min(targetWords, spokenWords) / Math.max(targetWords, spokenWords);
        // Calculate scores
        const similarity = calculateTextSimilarity(targetText.toLowerCase(), transcription.text.toLowerCase());
        const rhythmScore = wordMatchRatio * 100;
        const overallScore = (similarity * 0.7 + rhythmScore * 0.3);
        res.json({
            success: true,
            data: {
                attempt: {
                    phraseId,
                    speed: speed || 1.0,
                    transcription: transcription.text,
                    scores: {
                        overall: Math.round(overallScore),
                        accuracy: Math.round(similarity),
                        rhythm: Math.round(rhythmScore),
                    },
                    feedback: overallScore >= 80
                        ? 'Excellent! Your pronunciation is very close to native.'
                        : overallScore >= 60
                            ? 'Good job! Focus on the rhythm and keep practicing.'
                            : 'Keep practicing! Listen carefully to the native audio and try again.',
                    suggestion: 'Try to match the rhythm more closely. Listen to each syllable.',
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /pronunciation/patterns/:level
router.get('/patterns/:level', (req, res) => {
    const { level } = req.params;
    const patterns = {
        'A1': [
            {
                id: 'french-r',
                title: 'French R Sound',
                ipa: 'ʁ',
                description: 'The French R is pronounced in the throat, not rolled like Spanish.',
                examples: ['rue', 'très', 'partir', 'merci'],
                tips: ['Think of clearing your throat gently', 'Keep your tongue down'],
            },
            {
                id: 'silent-letters',
                title: 'Silent Final Letters',
                ipa: '∅',
                description: 'Most final consonants in French are silent.',
                examples: ['petit', 'grand', 'temps', 'vous'],
                tips: ['Don\'t pronounce final s, t, d, x in most words', 'Exception: c, r, f, l (CaReFuL)'],
            },
        ],
        'A2': [
            {
                id: 'nasal-vowels',
                title: 'Nasal Vowels',
                ipa: 'ɑ̃, ɔ̃, ɛ̃',
                description: 'French has distinct nasal vowel sounds not found in English.',
                examples: ['vent (ɑ̃)', 'bon (ɔ̃)', 'vin (ɛ̃)', 'brun (œ̃)'],
                tips: ['Let air flow through your nose', 'Don\'t pronounce the n or m fully'],
            },
            {
                id: 'liaison',
                title: 'Liaison',
                ipa: '‿',
                description: 'Linking a normally silent consonant to the next word starting with a vowel.',
                examples: ['les‿amis', 'un‿homme', 'très‿important'],
                tips: ['Mandatory after articles, adjectives, pronouns', 'Forbidden after singular nouns, after "et"'],
            },
        ],
    };
    res.json({
        success: true,
        data: patterns[level] || patterns['A1'],
    });
});
// Helper function for text similarity
function calculateTextSimilarity(a, b) {
    const aWords = a.split(/\s+/);
    const bWords = b.split(/\s+/);
    let matches = 0;
    for (const word of aWords) {
        if (bWords.includes(word)) {
            matches++;
        }
    }
    return (matches / Math.max(aWords.length, bWords.length)) * 100;
}
exports.default = router;
//# sourceMappingURL=pronunciation.js.map