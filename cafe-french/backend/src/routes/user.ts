// User Routes

import { Router, Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

const router = Router();
const getDb = () => DatabaseService.getInstance().getDb();

// GET /user/profile
router.get('/profile', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const user = getDb().prepare(`
      SELECT id, email, display_name, avatar_url, preferences, profile, created_at
      FROM users WHERE id = ?
    `).get(userId) as any;

    if (!user) {
      throw new NotFoundError('User');
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
  } catch (error) {
    next(error);
  }
});

// PUT /user/profile
router.put('/profile', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { displayName, avatarUrl, learnerProfile } = req.body;

    const user = getDb().prepare('SELECT profile FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      throw new NotFoundError('User');
    }

    const currentProfile = JSON.parse(user.profile);
    const updatedProfile = learnerProfile 
      ? { ...currentProfile, ...learnerProfile }
      : currentProfile;

    getDb().prepare(`
      UPDATE users SET
        display_name = COALESCE(?, display_name),
        avatar_url = COALESCE(?, avatar_url),
        profile = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      displayName,
      avatarUrl,
      JSON.stringify(updatedProfile),
      new Date().toISOString(),
      userId
    );

    res.json({
      success: true,
      data: {
        displayName: displayName || user.display_name,
        avatarUrl: avatarUrl || user.avatar_url,
        profile: updatedProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /user/preferences
router.put('/preferences', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { preferences } = req.body;

    if (!preferences) {
      throw new ValidationError('Preferences object required');
    }

    const user = getDb().prepare('SELECT preferences FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      throw new NotFoundError('User');
    }

    const currentPrefs = JSON.parse(user.preferences);
    const updatedPrefs = { ...currentPrefs, ...preferences };

    getDb().prepare(`
      UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?
    `).run(JSON.stringify(updatedPrefs), new Date().toISOString(), userId);

    res.json({
      success: true,
      data: { preferences: updatedPrefs },
    });
  } catch (error) {
    next(error);
  }
});

// GET /user/stats
router.get('/stats', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    // Get lesson stats
    const lessonStats = getDb().prepare(`
      SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_lessons
      FROM lessons WHERE user_id = ?
    `).get(userId) as any;

    // Get conversation stats
    const conversationStats = getDb().prepare(`
      SELECT COUNT(*) as total_conversations
      FROM conversations WHERE user_id = ?
    `).get(userId) as any;

    // Get SRS stats
    const srsStats = getDb().prepare(`
      SELECT
        COUNT(*) as total_cards,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as mastered_cards,
        SUM(total_reviews) as total_reviews
      FROM srs_cards WHERE user_id = ?
    `).get(userId) as any;

    // Get vocabulary count
    const vocabCount = getDb().prepare(`
      SELECT COUNT(*) as count FROM vocabulary_progress 
      WHERE user_id = ? AND status != 'new'
    `).get(userId) as any;

    // Calculate streak
    const user = getDb().prepare('SELECT profile FROM users WHERE id = ?').get(userId) as any;
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
  } catch (error) {
    next(error);
  }
});

// GET /user/activity
router.get('/activity', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily activity
    const lessons = getDb().prepare(`
      SELECT date, status, metrics FROM lessons
      WHERE user_id = ? AND date >= ?
      ORDER BY date DESC
    `).all(userId, startDate.toISOString().split('T')[0]) as any[];

    const activity = lessons.map(l => ({
      date: l.date,
      completed: l.status === 'completed',
      metrics: JSON.parse(l.metrics || '{}'),
    }));

    res.json({
      success: true,
      data: { activity },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
