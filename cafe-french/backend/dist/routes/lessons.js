"use strict";
// Lesson Routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lessonBuilder_1 = require("../services/lessonBuilder");
const database_1 = require("../services/database");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const db = database_1.DatabaseService.getInstance().getDb();
// GET /lessons/daily
router.get('/daily', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const date = req.query.date || new Date().toISOString().split('T')[0];
        // Get user profile for level
        const user = db.prepare('SELECT profile FROM users WHERE id = ?').get(userId);
        if (!user) {
            throw new errorHandler_1.NotFoundError('User');
        }
        const profile = JSON.parse(user.profile);
        const level = profile.currentLevel || 'A1';
        const lesson = await lessonBuilder_1.lessonBuilder.generateDailyLesson(userId, date, level, profile.preferences?.dailyGoalMinutes || 20);
        res.json({
            success: true,
            data: {
                lesson,
                estimatedDuration: lesson.targetDurationMinutes,
                learningObjectives: [
                    `Learn ${lesson.vocabulary.length} new words`,
                    `Practice ${lesson.grammarRule.title}`,
                    `Have a conversation in French`,
                ],
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /lessons/generate
router.post('/generate', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { date, level, durationMinutes, focusAreas, preferredTopics } = req.body;
        if (!date) {
            throw new errorHandler_1.ValidationError('Date is required');
        }
        const lesson = await lessonBuilder_1.lessonBuilder.generateDailyLesson(userId, date, level || 'A1', durationMinutes || 20, focusAreas, preferredTopics);
        res.json({
            success: true,
            data: {
                lesson,
                estimatedDuration: lesson.targetDurationMinutes,
                learningObjectives: [
                    `Learn ${lesson.vocabulary.length} new words`,
                    `Practice ${lesson.grammarRule.title}`,
                    `Have a conversation in French`,
                ],
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /lessons/:id
router.get('/:id', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const lessonId = req.params.id;
        const lesson = db.prepare(`
      SELECT * FROM lessons WHERE id = ? AND user_id = ?
    `).get(lessonId, userId);
        if (!lesson) {
            throw new errorHandler_1.NotFoundError('Lesson');
        }
        const content = JSON.parse(lesson.content);
        res.json({
            success: true,
            data: {
                id: lesson.id,
                date: lesson.date,
                level: lesson.level,
                status: lesson.status,
                ...content,
                metrics: JSON.parse(lesson.metrics),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /lessons/:id/start
router.post('/:id/start', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const lessonId = req.params.id;
        const lesson = db.prepare(`
      SELECT * FROM lessons WHERE id = ? AND user_id = ?
    `).get(lessonId, userId);
        if (!lesson) {
            throw new errorHandler_1.NotFoundError('Lesson');
        }
        db.prepare(`
      UPDATE lessons SET status = 'in_progress' WHERE id = ?
    `).run(lessonId);
        res.json({
            success: true,
            data: { message: 'Lesson started' },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /lessons/:id/complete
router.post('/:id/complete', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const lessonId = req.params.id;
        const { metrics } = req.body;
        const lesson = db.prepare(`
      SELECT * FROM lessons WHERE id = ? AND user_id = ?
    `).get(lessonId, userId);
        if (!lesson) {
            throw new errorHandler_1.NotFoundError('Lesson');
        }
        const currentMetrics = JSON.parse(lesson.metrics);
        const updatedMetrics = { ...currentMetrics, ...metrics };
        db.prepare(`
      UPDATE lessons SET 
        status = 'completed',
        metrics = ?,
        completed_at = ?
      WHERE id = ?
    `).run(JSON.stringify(updatedMetrics), new Date().toISOString(), lessonId);
        // Update user profile (streak, study time, etc.)
        const user = db.prepare('SELECT profile FROM users WHERE id = ?').get(userId);
        const profile = JSON.parse(user.profile);
        const today = new Date().toISOString().split('T')[0];
        const lastActive = profile.lastActiveDate?.split('T')[0];
        if (lastActive === today) {
            // Already active today, just add time
            profile.totalStudyTimeMinutes += metrics.totalTimeSpent || 0;
        }
        else {
            // Check if streak continues
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            if (lastActive === yesterdayStr) {
                profile.currentStreak++;
            }
            else {
                profile.currentStreak = 1;
            }
            profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak);
            profile.totalStudyTimeMinutes += metrics.totalTimeSpent || 0;
            profile.lastActiveDate = new Date().toISOString();
        }
        db.prepare(`UPDATE users SET profile = ? WHERE id = ?`).run(JSON.stringify(profile), userId);
        res.json({
            success: true,
            data: {
                message: 'Lesson completed',
                metrics: updatedMetrics,
                streak: profile.currentStreak,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /lessons/:id/activity/:activityId/complete
router.post('/:id/activity/:activityId/complete', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id: lessonId, activityId } = req.params;
        const { score, response, timeSpent, audioUrl } = req.body;
        const lesson = db.prepare(`
      SELECT * FROM lessons WHERE id = ? AND user_id = ?
    `).get(lessonId, userId);
        if (!lesson) {
            throw new errorHandler_1.NotFoundError('Lesson');
        }
        const content = JSON.parse(lesson.content);
        const metrics = JSON.parse(lesson.metrics);
        // Find and update the activity
        let activityFound = false;
        for (const section of content.sections) {
            for (const activity of section.activities) {
                if (activity.id === activityId) {
                    activity.completed = true;
                    activity.score = score;
                    activity.attempts = activity.attempts || [];
                    activity.attempts.push({
                        timestamp: new Date().toISOString(),
                        response,
                        score,
                        timeSpent,
                        audioUrl,
                    });
                    activityFound = true;
                    break;
                }
            }
            if (activityFound)
                break;
        }
        if (!activityFound) {
            throw new errorHandler_1.NotFoundError('Activity');
        }
        // Update metrics
        metrics.activitiesCompleted++;
        metrics.totalTimeSpent += timeSpent || 0;
        // Save updates
        db.prepare(`
      UPDATE lessons SET content = ?, metrics = ? WHERE id = ?
    `).run(JSON.stringify(content), JSON.stringify(metrics), lessonId);
        res.json({
            success: true,
            data: {
                activityId,
                score,
                completed: true,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /lessons/history
router.get('/history', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 30;
        const offset = parseInt(req.query.offset) || 0;
        const lessons = db.prepare(`
      SELECT id, date, level, status, metrics, completed_at
      FROM lessons 
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);
        const total = db.prepare(`
      SELECT COUNT(*) as count FROM lessons WHERE user_id = ?
    `).get(userId);
        res.json({
            success: true,
            data: {
                lessons: lessons.map(l => ({
                    id: l.id,
                    date: l.date,
                    level: l.level,
                    status: l.status,
                    metrics: JSON.parse(l.metrics),
                    completedAt: l.completed_at,
                })),
            },
            meta: {
                pagination: {
                    total: total.count,
                    limit,
                    offset,
                    hasMore: offset + lessons.length < total.count,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=lessons.js.map