"use strict";
// SRS (Spaced Repetition System) Routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const srsEngine_1 = require("../services/srsEngine");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// GET /srs/due
router.get('/due', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 50;
        const cardTypes = req.query.types ? req.query.types.split(',') : undefined;
        let cards = srsEngine_1.srsEngine.getDueCards(userId, limit);
        // Filter by types if specified
        if (cardTypes && cardTypes.length > 0) {
            cards = cards.filter(c => cardTypes.includes(c.type));
        }
        // Get counts
        const stats = srsEngine_1.srsEngine.getStats(userId);
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
    }
    catch (error) {
        next(error);
    }
});
// GET /srs/new
router.get('/new', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 20;
        const cards = srsEngine_1.srsEngine.getNewCards(userId, limit);
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
    }
    catch (error) {
        next(error);
    }
});
// POST /srs/review
router.post('/review', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { cardId, quality, timeSpent, audioUrl } = req.body;
        if (!cardId || quality === undefined) {
            throw new errorHandler_1.ValidationError('Card ID and quality required');
        }
        if (quality < 0 || quality > 5) {
            throw new errorHandler_1.ValidationError('Quality must be between 0 and 5');
        }
        const result = srsEngine_1.srsEngine.processReview(cardId, quality, timeSpent || 0);
        // Get remaining stats
        const stats = srsEngine_1.srsEngine.getStats(userId);
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
    }
    catch (error) {
        next(error);
    }
});
// GET /srs/stats
router.get('/stats', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const stats = srsEngine_1.srsEngine.getStats(userId);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /srs/forecast
router.get('/forecast', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const days = parseInt(req.query.days) || 7;
        const forecast = srsEngine_1.srsEngine.getForecast(userId, days);
        res.json({
            success: true,
            data: { forecast },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /srs/card
router.post('/card', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { type, front, back, sourceType, sourceId, level, tags } = req.body;
        if (!type || !front || !back) {
            throw new errorHandler_1.ValidationError('Type, front, and back are required');
        }
        const card = srsEngine_1.srsEngine.createCard(userId, type, front, back, sourceType || 'custom', sourceId || 'custom', level || 'A1', tags || []);
        res.status(201).json({
            success: true,
            data: {
                id: card.id,
                type: card.type,
                status: card.status,
                createdAt: card.created_at || new Date().toISOString(),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /srs/card/:id/suspend
router.post('/card/:id/suspend', (req, res, next) => {
    try {
        const { id } = req.params;
        srsEngine_1.srsEngine.suspendCard(id);
        res.json({
            success: true,
            data: { message: 'Card suspended' },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /srs/card/:id/unsuspend
router.post('/card/:id/unsuspend', (req, res, next) => {
    try {
        const { id } = req.params;
        srsEngine_1.srsEngine.unsuspendCard(id);
        res.json({
            success: true,
            data: { message: 'Card unsuspended' },
        });
    }
    catch (error) {
        next(error);
    }
});
// Helper function
function getDifficultyLabel(easeFactor, lapses) {
    if (lapses >= 5)
        return 'very_hard';
    if (easeFactor < 1.5 || lapses >= 3)
        return 'hard';
    if (easeFactor < 2.0)
        return 'medium';
    return 'easy';
}
exports.default = router;
//# sourceMappingURL=srs.js.map