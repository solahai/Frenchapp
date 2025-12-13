"use strict";
// User Routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../services/database");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const db = database_1.DatabaseService.getInstance().getDb();
// GET /user/profile
router.get('/profile', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = db.prepare(`
      SELECT id, email, display_name, avatar_url, preferences, profile, created_at
      FROM users WHERE id = ?
    `).get(userId);
        if (!user) {
            throw new errorHandler_1.NotFoundError('User');
        }
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                avatarUrl: user.avatar_url,
                preferences: JSON.parse(user.preferences),
                profile: JSON.parse(user.profile),
                createdAt: user.created_at,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// PUT /user/profile
router.put('/profile', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { displayName, avatarUrl, learnerProfile } = req.body;
        const user = db.prepare('SELECT profile FROM users WHERE id = ?').get(userId);
        if (!user) {
            throw new errorHandler_1.NotFoundError('User');
        }
        const currentProfile = JSON.parse(user.profile);
        const updatedProfile = learnerProfile
            ? { ...currentProfile, ...learnerProfile }
            : currentProfile;
        db.prepare(`
      UPDATE users SET
        display_name = COALESCE(?, display_name),
        avatar_url = COALESCE(?, avatar_url),
        profile = ?,
        updated_at = ?
      WHERE id = ?
    `).run(displayName, avatarUrl, JSON.stringify(updatedProfile), new Date().toISOString(), userId);
        res.json({
            success: true,
            data: {
                displayName: displayName || user.display_name,
                avatarUrl: avatarUrl || user.avatar_url,
                profile: updatedProfile,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// PUT /user/preferences
router.put('/preferences', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { preferences } = req.body;
        if (!preferences) {
            throw new errorHandler_1.ValidationError('Preferences object required');
        }
        const user = db.prepare('SELECT preferences FROM users WHERE id = ?').get(userId);
        if (!user) {
            throw new errorHandler_1.NotFoundError('User');
        }
        const currentPrefs = JSON.parse(user.preferences);
        const updatedPrefs = { ...currentPrefs, ...preferences };
        db.prepare(`
      UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?
    `).run(JSON.stringify(updatedPrefs), new Date().toISOString(), userId);
        res.json({
            success: true,
            data: { preferences: updatedPrefs },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /user/stats
router.get('/stats', (req, res, next) => {
    try {
        const userId = req.user.userId;
        // Get lesson stats
        const lessonStats = db.prepare(`
      SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_lessons
      FROM lessons WHERE user_id = ?
    `).get(userId);
        // Get conversation stats
        const conversationStats = db.prepare(`
      SELECT COUNT(*) as total_conversations
      FROM conversations WHERE user_id = ?
    `).get(userId);
        // Get SRS stats
        const srsStats = db.prepare(`
      SELECT
        COUNT(*) as total_cards,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as mastered_cards,
        SUM(total_reviews) as total_reviews
      FROM srs_cards WHERE user_id = ?
    `).get(userId);
        // Get vocabulary count
        const vocabCount = db.prepare(`
      SELECT COUNT(*) as count FROM vocabulary_progress 
      WHERE user_id = ? AND status != 'new'
    `).get(userId);
        // Calculate streak
        const user = db.prepare('SELECT profile FROM users WHERE id = ?').get(userId);
        const profile = JSON.parse(user?.profile || '{}');
        res.json({
            success: true,
            data: {
                totalLessonsCompleted: lessonStats?.completed_lessons || 0,
                totalWordsLearned: vocabCount?.count || 0,
                totalConversations: conversationStats?.total_conversations || 0,
                totalCards: srsStats?.total_cards || 0,
                masteredCards: srsStats?.mastered_cards || 0,
                totalReviews: srsStats?.total_reviews || 0,
                currentStreak: profile.currentStreak || 0,
                longestStreak: profile.longestStreak || 0,
                totalStudyTimeMinutes: profile.totalStudyTimeMinutes || 0,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /user/activity
router.get('/activity', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        // Get daily activity
        const lessons = db.prepare(`
      SELECT date, status, metrics FROM lessons
      WHERE user_id = ? AND date >= ?
      ORDER BY date DESC
    `).all(userId, startDate.toISOString().split('T')[0]);
        const activity = lessons.map(l => ({
            date: l.date,
            completed: l.status === 'completed',
            metrics: JSON.parse(l.metrics || '{}'),
        }));
        res.json({
            success: true,
            data: { activity },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map