// Conversation Routes

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from '../services/openai';
import { mistakeTracker } from '../services/mistakeTracker';
import { DatabaseService } from '../services/database';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const db = DatabaseService.getInstance().getDb();

// Conversation scenarios
const SCENARIOS: Record<string, { title: string; context: string; openingPrompt: string }> = {
  'cafe-ordering': {
    title: 'Ordering at a Café',
    context: 'You are at a cozy Parisian café. Order a coffee and perhaps a pastry.',
    openingPrompt: 'Bonjour ! Bienvenue au café. Qu\'est-ce que je peux vous servir aujourd\'hui ?'
  },
  'restaurant': {
    title: 'At the Restaurant',
    context: 'You are dining at a French restaurant. Order a meal and handle the bill.',
    openingPrompt: 'Bonsoir, bienvenue ! Voici le menu. Avez-vous déjà choisi ?'
  },
  'directions': {
    title: 'Asking for Directions',
    context: 'You are lost in a French city and need to find the train station.',
    openingPrompt: 'Bonjour ! Vous avez l\'air perdu. Je peux vous aider ?'
  },
  'doctor': {
    title: 'At the Doctor\'s Office',
    context: 'You need to describe your symptoms to a French doctor.',
    openingPrompt: 'Bonjour ! Asseyez-vous. Qu\'est-ce qui ne va pas aujourd\'hui ?'
  },
  'shopping': {
    title: 'Shopping',
    context: 'You are shopping for clothes at a French boutique.',
    openingPrompt: 'Bonjour ! Bienvenue dans notre boutique. Je peux vous aider à trouver quelque chose ?'
  },
  'hotel': {
    title: 'Hotel Check-in',
    context: 'You are checking into a hotel in France.',
    openingPrompt: 'Bonsoir, bienvenue à l\'Hôtel Belle Vue ! Vous avez une réservation ?'
  },
};

// POST /conversation/start
router.post('/start', aiRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { type, scenarioId, mode, level } = req.body;

    if (!type || !['free_chat', 'scenario_chat', 'hard_mode'].includes(type)) {
      throw new ValidationError('Invalid conversation type');
    }

    const sessionId = `conv_${uuidv4()}`;
    const now = new Date().toISOString();

    let scenario = null;
    let openingMessage = '';

    if (type === 'scenario_chat' && scenarioId) {
      scenario = SCENARIOS[scenarioId];
      if (!scenario) {
        throw new ValidationError('Invalid scenario');
      }
      openingMessage = scenario.openingPrompt;
    } else if (type === 'free_chat') {
      openingMessage = 'Bonjour ! Je suis Marie, votre partenaire de conversation. De quoi voulez-vous parler aujourd\'hui ?';
    } else if (type === 'hard_mode') {
      openingMessage = 'Bonjour ! Aujourd\'hui, on parle uniquement en français. Pas d\'anglais ! Prêt(e) ?';
    }

    const messages = [
      {
        id: `msg_${uuidv4()}`,
        role: 'assistant',
        content: openingMessage,
        timestamp: now,
      }
    ];

    // Save to database
    db.prepare(`
      INSERT INTO conversations (id, user_id, type, mode, scenario_id, level, status, messages, start_time)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(
      sessionId,
      userId,
      type,
      mode || 'text',
      scenarioId,
      level || 'A1',
      JSON.stringify(messages),
      now
    );

    res.json({
      success: true,
      data: {
        session: {
          id: sessionId,
          type,
          mode: mode || 'text',
          scenario: scenario ? { id: scenarioId, ...scenario } : null,
          level: level || 'A1',
          status: 'active',
        },
        openingMessage: messages[0],
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /conversation/:id/message
router.post('/:id/message', aiRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.id;
    const { content, audioUrl, language } = req.body;

    if (!content) {
      throw new ValidationError('Message content required');
    }

    // Get conversation
    const conv = db.prepare(`
      SELECT * FROM conversations WHERE id = ? AND user_id = ?
    `).get(sessionId, userId) as any;

    if (!conv) {
      throw new NotFoundError('Conversation');
    }

    if (conv.status !== 'active') {
      throw new ValidationError('Conversation is not active');
    }

    const messages = JSON.parse(conv.messages);
    const now = new Date().toISOString();

    // Add user message
    const userMessage = {
      id: `msg_${uuidv4()}`,
      role: 'user',
      content,
      timestamp: now,
      audioUrl,
    };
    messages.push(userMessage);

    // Get scenario context
    const scenario = conv.scenario_id ? SCENARIOS[conv.scenario_id] : null;
    const context = scenario?.context || 'Free conversation practice';

    // Build conversation history for AI
    const aiMessages = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Get AI response with corrections
    const strictMode = conv.type === 'hard_mode' || conv.type === 'scenario_chat';
    const { response, corrections } = await openAIService.generateConversationResponse(
      aiMessages,
      context,
      conv.level,
      strictMode
    );

    // Analyze user's French for errors
    const analysis = await openAIService.analyzeAndCorrect(
      content,
      conv.level,
      context
    );

    // Record errors if any
    if (analysis.hasErrors) {
      for (const error of analysis.errors) {
        mistakeTracker.recordGrammarError(
          userId,
          error.type,
          error.original,
          error.correction,
          error.explanation,
          {
            activityType: 'conversation',
            topic: scenario?.title || 'free_chat',
            timeInSession: messages.length * 30, // estimate
          },
          conv.level
        );
      }
    }

    // Add assistant message
    const assistantMessage = {
      id: `msg_${uuidv4()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      analysis: analysis.hasErrors ? {
        errors: analysis.errors,
        overallFeedback: analysis.overallFeedback,
      } : null,
    };
    messages.push(assistantMessage);

    // Store corrections
    const allCorrections = JSON.parse(conv.corrections || '[]');
    if (analysis.hasErrors) {
      allCorrections.push(...analysis.errors.map((e: any) => ({
        messageId: userMessage.id,
        ...e,
        appliedAt: now,
      })));
    }

    // Update conversation
    db.prepare(`
      UPDATE conversations SET messages = ?, corrections = ? WHERE id = ?
    `).run(JSON.stringify(messages), JSON.stringify(allCorrections), sessionId);

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        corrections: analysis.hasErrors ? analysis.errors : [],
        shouldRepair: analysis.shouldRepair,
        repairPrompt: analysis.shouldRepair 
          ? `Essayons encore ! Pouvez-vous corriger: "${analysis.errors[0]?.original}" → "${analysis.errors[0]?.correction}" ?`
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /conversation/:id/end
router.post('/:id/end', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.id;

    const conv = db.prepare(`
      SELECT * FROM conversations WHERE id = ? AND user_id = ?
    `).get(sessionId, userId) as any;

    if (!conv) {
      throw new NotFoundError('Conversation');
    }

    const messages = JSON.parse(conv.messages);
    const corrections = JSON.parse(conv.corrections || '[]');
    const now = new Date().toISOString();

    // Generate debrief
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const totalMessages = messages.length;
    const totalDuration = Math.round((new Date(now).getTime() - new Date(conv.start_time).getTime()) / 1000);

    // Group errors by type
    const errorsByCategory: Record<string, number> = {};
    for (const correction of corrections) {
      errorsByCategory[correction.type] = (errorsByCategory[correction.type] || 0) + 1;
    }

    // Find recurring errors (appeared 2+ times)
    const recurringErrors = Object.entries(errorsByCategory)
      .filter(([_, count]) => count >= 2)
      .map(([type, count]) => ({
        type,
        occurrences: count,
        examples: corrections
          .filter((c: any) => c.type === type)
          .slice(0, 2)
          .map((c: any) => ({ original: c.original, corrected: c.correction })),
      }));

    // Calculate scores
    const totalErrors = corrections.length;
    const accuracyScore = userMessages.length > 0 
      ? Math.max(0, 100 - (totalErrors / userMessages.length) * 20)
      : 100;

    const debrief = {
      sessionId,
      generatedAt: now,
      totalMessages,
      userMessageCount: userMessages.length,
      totalDuration,
      topRecurringErrors: recurringErrors.slice(0, 3),
      totalErrorCount: totalErrors,
      errorsByCategory,
      strengths: [
        userMessages.length > 3 ? 'Good conversation flow!' : null,
        totalErrors < userMessages.length ? 'Generally accurate French!' : null,
      ].filter(Boolean),
      areasToImprove: Object.keys(errorsByCategory).slice(0, 3),
      overallScore: Math.round(accuracyScore),
      fluencyScore: Math.min(100, userMessages.length * 15),
      accuracyScore: Math.round(accuracyScore),
      suggestReplay: totalErrors > 5,
    };

    // Calculate metrics
    const metrics = {
      totalTurns: totalMessages,
      averageResponseLength: userMessages.reduce((sum: number, m: any) => sum + m.content.length, 0) / (userMessages.length || 1),
      grammarAccuracy: accuracyScore,
      responseTimeAverage: totalDuration / (userMessages.length || 1),
    };

    // Update conversation
    db.prepare(`
      UPDATE conversations SET 
        status = 'completed',
        debrief = ?,
        metrics = ?,
        end_time = ?
      WHERE id = ?
    `).run(JSON.stringify(debrief), JSON.stringify(metrics), now, sessionId);

    res.json({
      success: true,
      data: {
        session: {
          id: conv.id,
          status: 'completed',
          duration: totalDuration,
        },
        debrief,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /conversation/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.id;

    const conv = db.prepare(`
      SELECT * FROM conversations WHERE id = ? AND user_id = ?
    `).get(sessionId, userId) as any;

    if (!conv) {
      throw new NotFoundError('Conversation');
    }

    res.json({
      success: true,
      data: {
        id: conv.id,
        type: conv.type,
        mode: conv.mode,
        scenarioId: conv.scenario_id,
        level: conv.level,
        status: conv.status,
        messages: JSON.parse(conv.messages),
        corrections: JSON.parse(conv.corrections || '[]'),
        debrief: conv.debrief ? JSON.parse(conv.debrief) : null,
        metrics: conv.metrics ? JSON.parse(conv.metrics) : null,
        startTime: conv.start_time,
        endTime: conv.end_time,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /conversation/scenarios
router.get('/scenarios', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.entries(SCENARIOS).map(([id, scenario]) => ({
      id,
      ...scenario,
    })),
  });
});

// GET /conversation/history
router.get('/history', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const conversations = db.prepare(`
      SELECT id, type, scenario_id, level, status, metrics, start_time, end_time
      FROM conversations
      WHERE user_id = ?
      ORDER BY start_time DESC
      LIMIT ?
    `).all(userId, limit) as any[];

    res.json({
      success: true,
      data: conversations.map(c => ({
        id: c.id,
        type: c.type,
        scenarioId: c.scenario_id,
        level: c.level,
        status: c.status,
        metrics: c.metrics ? JSON.parse(c.metrics) : null,
        startTime: c.start_time,
        endTime: c.end_time,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
