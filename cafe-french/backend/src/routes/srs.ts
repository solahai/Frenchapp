// SRS (Spaced Repetition System) Routes

import { Router, Request, Response, NextFunction } from 'express';
import { srsEngine } from '../services/srsEngine';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

const router = Router();

// GET /srs/due
router.get('/due', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const cardTypes = req.query.types ? (req.query.types as string).split(',') : undefined;

    let cards = srsEngine.getDueCards(userId, limit);

    // Filter by types if specified
    if (cardTypes && cardTypes.length > 0) {
      cards = cards.filter(c => cardTypes.includes(c.type));
    }

    // Get counts
    const stats = srsEngine.getStats(userId);

    // Estimate review time (avg 10 seconds per card)
    const estimatedMinutes = Math.ceil(cards.length * 10 / 60);

    res.json({
      success: true,
      data: {
        cards: cards.map(c => ({
          id: c.id,
          type: c.type,
          front: JSON.parse(c.front),
          back: JSON.parse(c.back),
          level: c.level,
          status: c.status,
          difficulty: getDifficultyLabel(c.ease_factor, c.lapses),
        })),
        newCount: stats.newCount,
        reviewCount: stats.reviewCount,
        learningCount: stats.learningCount,
        estimatedMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /srs/new
router.get('/new', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const cards = srsEngine.getNewCards(userId, limit);

    res.json({
      success: true,
      data: {
        cards: cards.map(c => ({
          id: c.id,
          type: c.type,
          front: JSON.parse(c.front),
          back: JSON.parse(c.back),
          level: c.level,
        })),
        total: cards.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /srs/review
router.post('/review', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { cardId, quality, timeSpent, audioUrl } = req.body;

    if (!cardId || quality === undefined) {
      throw new ValidationError('Card ID and quality required');
    }

    if (quality < 0 || quality > 5) {
      throw new ValidationError('Quality must be between 0 and 5');
    }

    const result = srsEngine.processReview(cardId, quality, timeSpent || 0);

    // Get remaining stats
    const stats = srsEngine.getStats(userId);

    res.json({
      success: true,
      data: {
        card: {
          id: result.card.id,
          status: result.card.status,
          easeFactor: result.card.ease_factor,
          interval: result.intervalDays,
        },
        nextReviewAt: result.nextReview,
        stats: {
          cardsReviewed: result.card.total_reviews,
          cardsRemaining: stats.dueToday,
          correctRate: stats.retention7Days,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /srs/stats
router.get('/stats', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const stats = srsEngine.getStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /srs/forecast
router.get('/forecast', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const days = parseInt(req.query.days as string) || 7;

    const forecast = srsEngine.getForecast(userId, days);

    res.json({
      success: true,
      data: { forecast },
    });
  } catch (error) {
    next(error);
  }
});

// POST /srs/card
router.post('/card', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { type, front, back, sourceType, sourceId, level, tags } = req.body;

    if (!type || !front || !back) {
      throw new ValidationError('Type, front, and back are required');
    }

    const card = srsEngine.createCard(
      userId,
      type,
      front,
      back,
      sourceType || 'custom',
      sourceId || 'custom',
      level || 'A1',
      tags || []
    );

    res.status(201).json({
      success: true,
      data: {
        id: card.id,
        type: card.type,
        status: card.status,
        createdAt: (card as any).created_at || new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /srs/card/:id/suspend
router.post('/card/:id/suspend', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    srsEngine.suspendCard(id);

    res.json({
      success: true,
      data: { message: 'Card suspended' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /srs/card/:id/unsuspend
router.post('/card/:id/unsuspend', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    srsEngine.unsuspendCard(id);

    res.json({
      success: true,
      data: { message: 'Card unsuspended' },
    });
  } catch (error) {
    next(error);
  }
});

// Helper function
function getDifficultyLabel(easeFactor: number, lapses: number): string {
  if (lapses >= 5) return 'very_hard';
  if (easeFactor < 1.5 || lapses >= 3) return 'hard';
  if (easeFactor < 2.0) return 'medium';
  return 'easy';
}

export default router;
