// Speech Services Routes (TTS/STT)

import { Router, Request, Response, NextFunction } from 'express';
import { openAIService } from '../services/openai';
import { elevenLabsService } from '../services/elevenlabs';
import { speechRateLimiter } from '../middleware/rateLimiter';
import { ValidationError } from '../middleware/errorHandler';

const router = Router();

// POST /speech/tts
router.post('/tts', speechRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, voice, speed } = req.body;

    if (!text) {
      throw new ValidationError('Text is required');
    }

    if (text.length > 500) {
      throw new ValidationError('Text too long (max 500 characters)');
    }

    const audioBuffer = await elevenLabsService.textToSpeech(text, {
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
  } catch (error) {
    next(error);
  }
});

// POST /speech/stt
router.post('/stt', speechRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { audioData, language } = req.body;

    if (!audioData) {
      throw new ValidationError('Audio data is required');
    }

    const audioBuffer = Buffer.from(audioData, 'base64');
    const transcription = await openAIService.transcribeAudio(
      audioBuffer,
      (language as 'fr' | 'en') || 'fr'
    );

    res.json({
      success: true,
      data: {
        transcription: transcription.text,
        confidence: transcription.confidence,
        words: transcription.words,
        language: language || 'fr',
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /speech/voices
router.get('/voices', (_req: Request, res: Response) => {
  const voices = elevenLabsService.getFrenchVoices();

  res.json({
    success: true,
    data: voices,
  });
});

// POST /speech/vocabulary
router.post('/vocabulary', speechRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { word } = req.body;

    if (!word) {
      throw new ValidationError('Word is required');
    }

    const audioBuffer = await elevenLabsService.generateVocabularyAudio(word);
    const audioBase64 = audioBuffer.toString('base64');

    res.json({
      success: true,
      data: {
        word,
        audioData: audioBase64,
        format: 'mp3',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /speech/conversation
router.post('/conversation', speechRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, gender } = req.body;

    if (!text) {
      throw new ValidationError('Text is required');
    }

    const audioBuffer = await elevenLabsService.generateConversationAudio(
      text,
      (gender as 'male' | 'female') || 'female'
    );
    const audioBase64 = audioBuffer.toString('base64');

    res.json({
      success: true,
      data: {
        text,
        audioData: audioBase64,
        format: 'mp3',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /speech/shadowing
router.post('/shadowing', speechRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, speed } = req.body;

    if (!text) {
      throw new ValidationError('Text is required');
    }

    const audioBuffer = await elevenLabsService.generateShadowingAudio(
      text,
      (speed as 0.75 | 1.0 | 1.25) || 1.0
    );
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
  } catch (error) {
    next(error);
  }
});

export default router;
