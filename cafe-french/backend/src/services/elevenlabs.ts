// ElevenLabs Text-to-Speech Service

import axios from 'axios';
import { AIServiceError } from '../middleware/errorHandler';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

interface TTSOptions {
  voiceId?: string;
  speed?: number;
  stability?: number;
  similarity?: number;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true,
};

// French voice options (these are example IDs - use real ElevenLabs voice IDs)
const FRENCH_VOICES = {
  female_standard: 'EXAVITQu4vr4xnSDxMaL', // Example: French female voice
  male_standard: 'VR6AewLTigWG4xSOukaG', // Example: French male voice
  female_native: 'pNInz6obpgDQGcFmaJgB', // Example: Native French accent
  male_native: 'yoZ06aMxZJJ28mfd3POQ', // Example: Native French accent
};

class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  private defaultVoiceId: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || FRENCH_VOICES.female_native;
    
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not configured. TTS features will be limited.');
    }
  }

  /**
   * Generate speech from text
   */
  async textToSpeech(text: string, options: TTSOptions = {}): Promise<Buffer> {
    const voiceId = options.voiceId || this.defaultVoiceId;
    
    const voiceSettings: VoiceSettings = {
      ...DEFAULT_VOICE_SETTINGS,
      stability: options.stability ?? DEFAULT_VOICE_SETTINGS.stability,
      similarity_boost: options.similarity ?? DEFAULT_VOICE_SETTINGS.similarity_boost,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('ElevenLabs TTS error:', error.response?.data || error.message);
      throw new AIServiceError('Failed to generate speech');
    }
  }

  /**
   * Generate speech with streaming (for real-time playback)
   */
  async textToSpeechStream(text: string, options: TTSOptions = {}): Promise<NodeJS.ReadableStream> {
    const voiceId = options.voiceId || this.defaultVoiceId;
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}/stream`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: DEFAULT_VOICE_SETTINGS,
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          responseType: 'stream',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('ElevenLabs TTS stream error:', error.response?.data || error.message);
      throw new AIServiceError('Failed to stream speech');
    }
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<Array<{ id: string; name: string; language: string }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return response.data.voices
        .filter((v: any) => v.labels?.language === 'French' || v.labels?.accent === 'French')
        .map((v: any) => ({
          id: v.voice_id,
          name: v.name,
          language: v.labels?.language || 'French',
        }));
    } catch (error: any) {
      console.error('ElevenLabs voices error:', error.response?.data || error.message);
      throw new AIServiceError('Failed to get voices');
    }
  }

  /**
   * Generate speech for vocabulary with slower speed
   */
  async generateVocabularyAudio(word: string): Promise<Buffer> {
    // Use slower settings for vocabulary pronunciation
    return this.textToSpeech(word, {
      stability: 0.7,
      similarity: 0.8,
    });
  }

  /**
   * Generate speech for conversation (natural speed)
   */
  async generateConversationAudio(text: string, voiceGender: 'male' | 'female' = 'female'): Promise<Buffer> {
    const voiceId = voiceGender === 'male' 
      ? FRENCH_VOICES.male_native 
      : FRENCH_VOICES.female_native;
    
    return this.textToSpeech(text, {
      voiceId,
      stability: 0.5,
      similarity: 0.75,
    });
  }

  /**
   * Generate slow speech for shadowing exercises
   */
  async generateShadowingAudio(text: string, speed: 0.75 | 1.0 | 1.25 = 1.0): Promise<Buffer> {
    // ElevenLabs doesn't have direct speed control,
    // but we can adjust stability for clearer pronunciation
    const stability = speed < 1.0 ? 0.8 : 0.5;
    
    return this.textToSpeech(text, {
      stability,
      similarity: 0.9,
    });
  }

  /**
   * Get available French voices for user selection
   */
  getFrenchVoices(): Array<{ id: string; name: string; gender: string }> {
    return [
      { id: FRENCH_VOICES.female_standard, name: 'Sophie', gender: 'female' },
      { id: FRENCH_VOICES.male_standard, name: 'Pierre', gender: 'male' },
      { id: FRENCH_VOICES.female_native, name: 'Marie (Native)', gender: 'female' },
      { id: FRENCH_VOICES.male_native, name: 'Jean (Native)', gender: 'male' },
    ];
  }
}

// Singleton instance
export const elevenLabsService = new ElevenLabsService();
export { ElevenLabsService };
