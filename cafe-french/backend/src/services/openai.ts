// OpenAI Service - Core AI Integration

import OpenAI from 'openai';
import { AIServiceError } from '../middleware/errorHandler';

// Types
interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrammarExplanation {
  whatItMeans: string;
  whenToUse: string;
  howToForm: string;
  examples: Array<{ french: string; english: string }>;
  commonMistakes: string[];
  quickCheck: { question: string; answer: string };
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
    examples: Array<{ french: string; english: string }>;
    practice: string;
  };
  culturalNugget: {
    title: string;
    content: string;
    funFact: string;
  };
}

class OpenAIService {
  private client: OpenAI;
  private model: string = 'gpt-4-turbo-preview';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key not configured. AI features will be limited.');
    }
    this.client = new OpenAI({ apiKey: apiKey || 'dummy-key' });
  }

  /**
   * Generate a French conversation response
   */
  async generateConversationResponse(
    messages: ConversationMessage[],
    scenario: string,
    level: string,
    strictMode: boolean = true
  ): Promise<{ response: string; corrections: CorrectionResult | null }> {
    const systemPrompt = this.buildConversationSystemPrompt(scenario, level, strictMode);
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || '';
      
      // Parse response - it should include corrections if there were errors
      const parsed = this.parseConversationResponse(content);
      
      return parsed;
    } catch (error) {
      console.error('OpenAI conversation error:', error);
      throw new AIServiceError('Failed to generate conversation response');
    }
  }

  /**
   * Analyze and correct French text
   */
  async analyzeAndCorrect(
    text: string,
    level: string,
    context: string = 'general'
  ): Promise<CorrectionResult> {
    const prompt = `Analyze this French text from a ${level} learner. Provide corrections and feedback.

Context: ${context}
Text: "${text}"

Respond in JSON format:
{
  "hasErrors": boolean,
  "correctedText": "the corrected version",
  "errors": [
    {
      "type": "grammar|vocabulary|spelling|gender|verb|article",
      "original": "the error",
      "correction": "the fix",
      "explanation": "why this is wrong and how to remember",
      "severity": "minor|moderate|major"
    }
  ],
  "overallFeedback": "encouraging feedback about what was good and what to work on",
  "shouldRepair": boolean (true if major errors need immediate correction)
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are a strict but encouraging French tutor. Be thorough in finding errors but always provide constructive feedback. Focus on high-impact errors first.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI correction error:', error);
      throw new AIServiceError('Failed to analyze text');
    }
  }

  /**
   * Generate kid-simple grammar explanation
   */
  async explainGrammar(
    topic: string,
    level: string,
    userQuestion?: string
  ): Promise<GrammarExplanation> {
    const prompt = `Explain this French grammar topic in a kid-simple way for a ${level} learner:

Topic: ${topic}
${userQuestion ? `User question: ${userQuestion}` : ''}

Rules:
- Use tiny sentences, one idea at a time
- No jargon - explain like teaching a 10-year-old
- Always give relatable examples
- Include a memory trick if possible

Respond in JSON format:
{
  "whatItMeans": "simple explanation of what this grammar does",
  "whenToUse": "when and why you use this",
  "howToForm": "step-by-step how to create it",
  "examples": [
    {"french": "example in French", "english": "translation"}
  ],
  "commonMistakes": ["mistake 1 and how to avoid"],
  "quickCheck": {"question": "a simple test question", "answer": "the answer"}
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are the world\'s best French teacher who explains things so simply that anyone can understand. You use analogies, humor, and memorable tricks.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI grammar error:', error);
      throw new AIServiceError('Failed to generate grammar explanation');
    }
  }

  /**
   * Generate daily lesson content
   */
  async generateLessonContent(
    level: string,
    theme: string,
    previousVocabulary: string[],
    focusGrammar?: string
  ): Promise<LessonContent> {
    const prompt = `Generate a French lesson for ${level} level on the theme: "${theme}"

Avoid these words (already learned): ${previousVocabulary.slice(0, 20).join(', ')}
${focusGrammar ? `Focus grammar: ${focusGrammar}` : ''}

Generate:
1. 8 new vocabulary words (high-frequency, useful)
2. One grammar micro-rule that fits the theme
3. One cultural nugget related to the theme

Respond in JSON format:
{
  "vocabulary": [
    {
      "french": "word",
      "english": "translation",
      "ipa": "pronunciation",
      "example": "example sentence",
      "gender": "masculine or feminine (for nouns)"
    }
  ],
  "grammarRule": {
    "title": "rule name",
    "explanation": "kid-simple explanation",
    "examples": [{"french": "...", "english": "..."}],
    "practice": "a fill-in-the-blank exercise"
  },
  "culturalNugget": {
    "title": "nugget title",
    "content": "interesting cultural info",
    "funFact": "a surprising fun fact"
  }
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert French curriculum designer who creates engaging, practical lessons. Focus on high-frequency vocabulary that learners can use immediately in real life.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI lesson error:', error);
      throw new AIServiceError('Failed to generate lesson content');
    }
  }

  /**
   * Generate pronunciation feedback
   */
  async analyzePronunciation(
    targetText: string,
    transcription: string,
    level: string
  ): Promise<{
    score: number;
    phonemeIssues: Array<{ phoneme: string; issue: string; tip: string }>;
    rhythmFeedback: string;
    actionableFixes: string[];
  }> {
    const prompt = `Analyze this French pronunciation attempt:

Target: "${targetText}"
What was said: "${transcription}"
Learner level: ${level}

Provide feedback on:
1. Overall accuracy score (0-100)
2. Specific phoneme issues
3. Rhythm and flow feedback
4. 3 actionable tips to improve

Respond in JSON format:
{
  "score": number,
  "phonemeIssues": [
    {"phoneme": "the sound", "issue": "what went wrong", "tip": "how to fix it"}
  ],
  "rhythmFeedback": "feedback on rhythm, liaisons, flow",
  "actionableFixes": ["specific tip 1", "specific tip 2", "specific tip 3"]
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are a French phonetics expert who provides precise, actionable pronunciation feedback. Focus on the most impactful improvements first.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI pronunciation error:', error);
      throw new AIServiceError('Failed to analyze pronunciation');
    }
  }

  /**
   * Generate remediation exercises for specific errors
   */
  async generateRemediationExercises(
    errorType: string,
    errorExamples: string[],
    level: string
  ): Promise<Array<{
    type: string;
    instruction: string;
    items: Array<{ prompt: string; answer: string; explanation: string }>;
  }>> {
    const prompt = `Create remediation exercises for this French error pattern:

Error type: ${errorType}
Examples of the error: ${errorExamples.join(', ')}
Learner level: ${level}

Generate 3 exercise types with 3 items each:
1. Recognition exercise (identify correct vs incorrect)
2. Production exercise (create the correct form)
3. Contextualized exercise (use correctly in a sentence)

Respond in JSON format:
{
  "exercises": [
    {
      "type": "recognition|production|contextualized",
      "instruction": "what to do",
      "items": [
        {"prompt": "the question", "answer": "correct answer", "explanation": "why"}
      ]
    }
  ]
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert in error remediation and spaced learning. Create exercises that progressively build mastery through varied practice.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{"exercises":[]}';
      const parsed = JSON.parse(content);
      return parsed.exercises || [];
    } catch (error) {
      console.error('OpenAI remediation error:', error);
      throw new AIServiceError('Failed to generate remediation exercises');
    }
  }

  /**
   * Transcribe audio using Whisper
   */
  async transcribeAudio(audioBuffer: Buffer, language: 'fr' | 'en' = 'fr'): Promise<{
    text: string;
    confidence: number;
    words?: Array<{ word: string; start: number; end: number }>;
  }> {
    try {
      // Create a file-like object from the buffer
      const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });
      
      const response = await this.client.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: language,
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
      });

      return {
        text: response.text,
        confidence: 0.95, // Whisper doesn't provide confidence, estimate high
        words: (response as any).words?.map((w: any) => ({
          word: w.word,
          start: w.start,
          end: w.end,
        })),
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw new AIServiceError('Failed to transcribe audio');
    }
  }

  // Private helper methods

  private buildConversationSystemPrompt(scenario: string, level: string, strictMode: boolean): string {
    const strictInstructions = strictMode ? `
CORRECTION POLICY (STRICT MODE):
- If the user makes a major grammatical error, you MUST point it out gently inline and ask them to try again
- For gender agreement errors, verb conjugation errors, or tense errors: stop and help them correct
- Do NOT be overly forgiving - real learning requires real feedback
- Use this format for corrections: "Ah, petite correction: [error] → [correction]. On dit... Pouvez-vous réessayer?"
- Track if the same error repeats - mention it's a pattern they should focus on` : '';

    return `You are Marie, a friendly French conversation partner at Café de Flore in Paris. 

SCENARIO: ${scenario}
LEARNER LEVEL: ${level}

YOUR PERSONALITY:
- Warm and encouraging, but academically rigorous
- You speak naturally but adjust complexity to the learner's level
- You occasionally use colloquial expressions appropriate for the level
- You're patient but you DO correct errors - that's how learners improve

CONVERSATION RULES:
- Respond primarily in French, keeping language appropriate for ${level}
- If the learner seems stuck, offer a gentle hint in English
- Keep responses conversational length (2-4 sentences usually)
- Stay in character for the scenario
- Ask follow-up questions to keep the conversation flowing

${strictInstructions}

RESPONSE FORMAT:
If the user makes errors, structure your response as:
1. (Optional) Gentle correction with explanation
2. Your in-character response
3. A follow-up question or prompt

Always be encouraging about what they did well, but never skip important corrections.`;
  }

  private parseConversationResponse(content: string): { response: string; corrections: CorrectionResult | null } {
    // Try to parse if it contains JSON correction data
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    
    if (jsonMatch) {
      try {
        const corrections = JSON.parse(jsonMatch[1]);
        const response = content.replace(/```json\n[\s\S]*?\n```/, '').trim();
        return { response, corrections };
      } catch {
        // JSON parse failed, return as plain response
      }
    }
    
    return { response: content, corrections: null };
  }
}

// Singleton instance
export const openAIService = new OpenAIService();
export { OpenAIService };
