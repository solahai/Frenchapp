"use strict";
// Progress and Challenge Routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const database_1 = require("../services/database");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const db = database_1.DatabaseService.getInstance().getDb();
// 30-day themes
const THIRTY_DAY_THEMES = [
    { day: 1, theme: 'Greetings & Introductions', themeFr: 'Salutations et présentations' },
    { day: 2, theme: 'At the Café', themeFr: 'Au café' },
    { day: 3, theme: 'Numbers & Prices', themeFr: 'Nombres et prix' },
    { day: 4, theme: 'Daily Routine', themeFr: 'La routine quotidienne' },
    { day: 5, theme: 'Review Day', themeFr: 'Jour de révision' },
    { day: 6, theme: 'Family & Friends', themeFr: 'Famille et amis' },
    { day: 7, theme: 'At the Market', themeFr: 'Au marché' },
    { day: 8, theme: 'Describing People', themeFr: 'Décrire les gens' },
    { day: 9, theme: 'Weather & Seasons', themeFr: 'Le temps et les saisons' },
    { day: 10, theme: 'Week 1 Milestone', themeFr: 'Bilan semaine 1' },
    { day: 11, theme: 'Getting Around', themeFr: 'Se déplacer' },
    { day: 12, theme: 'At the Restaurant', themeFr: 'Au restaurant' },
    { day: 13, theme: 'Shopping', themeFr: 'Faire du shopping' },
    { day: 14, theme: 'Telling Time', themeFr: "Dire l'heure" },
    { day: 15, theme: 'Review Day', themeFr: 'Jour de révision' },
    { day: 16, theme: 'At the Doctor', themeFr: 'Chez le médecin' },
    { day: 17, theme: 'Past Events', themeFr: 'Événements passés' },
    { day: 18, theme: 'At the Hotel', themeFr: "À l'hôtel" },
    { day: 19, theme: 'Directions', themeFr: 'Les directions' },
    { day: 20, theme: 'Week 2 Milestone', themeFr: 'Bilan semaine 2' },
    { day: 21, theme: 'Hobbies & Interests', themeFr: 'Loisirs et intérêts' },
    { day: 22, theme: 'Making Plans', themeFr: 'Faire des projets' },
    { day: 23, theme: 'Phone Calls', themeFr: 'Au téléphone' },
    { day: 24, theme: 'At the Bank/Post Office', themeFr: 'À la banque/poste' },
    { day: 25, theme: 'Review Day', themeFr: 'Jour de révision' },
    { day: 26, theme: 'Expressing Opinions', themeFr: 'Exprimer ses opinions' },
    { day: 27, theme: 'Problem Solving', themeFr: 'Résoudre des problèmes' },
    { day: 28, theme: 'Social Situations', themeFr: 'Situations sociales' },
    { day: 29, theme: 'French Culture', themeFr: 'La culture française' },
    { day: 30, theme: 'Final Assessment', themeFr: 'Évaluation finale' },
];
// GET /progress
router.get('/', (req, res, next) => {
    try {
        const userId = req.user.userId;
        // Get user profile
        const user = db.prepare('SELECT profile FROM users WHERE id = ?').get(userId);
        if (!user) {
            throw new errorHandler_1.NotFoundError('User');
        }
        const profile = JSON.parse(user.profile);
        // Get SRS stats
        const srsStats = db.prepare(`
      SELECT
        COUNT(*) as total_cards,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as mastered_cards,
        AVG(ease_factor) as avg_ease
      FROM srs_cards WHERE user_id = ?
    `).get(userId);
        // Get lesson completion rate
        const lessonStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM lessons WHERE user_id = ?
    `).get(userId);
        // Get vocabulary count
        const vocabCount = db.prepare(`
      SELECT COUNT(*) as count FROM vocabulary_progress 
      WHERE user_id = ? AND status != 'new'
    `).get(userId);
        res.json({
            success: true,
            data: {
                wrrs: profile.weeklyRealWorldReadinessScore || {
                    overall: 0,
                    comprehension: 0,
                    spokenIntelligibility: 0,
                    errorRecurrenceReduction: 0,
                    vocabularyRecallSpeed: 0,
                },
                levelProgress: profile.levelProgress || {
                    level: 'A1',
                    overallProgress: 0,
                },
                skillProgress: profile.skillLevels || {
                    listening: 'A1',
                    speaking: 'A1',
                    reading: 'A1',
                    writing: 'A1',
                },
                streak: profile.currentStreak || 0,
                longestStreak: profile.longestStreak || 0,
                totalStudyMinutes: profile.totalStudyTimeMinutes || 0,
                totalWordsLearned: vocabCount?.count || 0,
                masteredCards: srsStats?.mastered_cards || 0,
                lessonsCompleted: lessonStats?.completed || 0,
                completionRate: lessonStats?.total > 0
                    ? Math.round((lessonStats.completed / lessonStats.total) * 100)
                    : 0,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /progress/weekly-report
router.get('/weekly-report', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const weekNumber = parseInt(req.query.week) || getCurrentWeekNumber();
        // Get this week's lessons
        const weekStart = getWeekStart(weekNumber);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const lessons = db.prepare(`
      SELECT * FROM lessons
      WHERE user_id = ? AND date >= ? AND date < ?
    `).all(userId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]);
        // Calculate stats
        let totalMinutes = 0;
        let lessonsCompleted = 0;
        let newWords = 0;
        for (const lesson of lessons) {
            const metrics = JSON.parse(lesson.metrics || '{}');
            totalMinutes += metrics.totalTimeSpent || 0;
            if (lesson.status === 'completed') {
                lessonsCompleted++;
                newWords += metrics.newWordsLearned || 0;
            }
        }
        const daysActive = new Set(lessons.filter(l => l.status === 'completed').map(l => l.date)).size;
        // Get user profile for WRRS
        const user = db.prepare('SELECT profile FROM users WHERE id = ?').get(userId);
        const profile = JSON.parse(user?.profile || '{}');
        res.json({
            success: true,
            data: {
                report: {
                    weekNumber,
                    weekStart: weekStart.toISOString().split('T')[0],
                    weekEnd: weekEnd.toISOString().split('T')[0],
                    totalMinutes: Math.round(totalMinutes / 60), // Convert seconds to minutes
                    lessonsCompleted,
                    daysActive,
                    newWords,
                    wordsReviewed: 0, // Would need SRS data
                    wrrsScore: profile.weeklyRealWorldReadinessScore?.overall || 0,
                    wrrsChange: 0, // Would need previous week data
                    highlights: [
                        lessonsCompleted >= 5 ? '🎉 Completed 5+ lessons!' : null,
                        daysActive >= 5 ? '🔥 Active 5+ days!' : null,
                        newWords >= 30 ? '📚 Learned 30+ new words!' : null,
                    ].filter(Boolean),
                    focusForNextWeek: [
                        'Continue building your vocabulary',
                        'Practice conversation daily',
                        'Review your mistake patterns',
                    ],
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /progress/challenge/start
router.post('/challenge/start', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { startLevel, targetLevel, startDate } = req.body;
        if (!startLevel || !targetLevel) {
            throw new errorHandler_1.ValidationError('Start and target levels required');
        }
        const challengeId = `challenge_${(0, uuid_1.v4)()}`;
        const start = startDate ? new Date(startDate) : new Date();
        const end = new Date(start);
        end.setDate(end.getDate() + 30);
        // Generate daily plan
        const dailyPlan = THIRTY_DAY_THEMES.map((theme, i) => {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            return {
                day: i + 1,
                date: date.toISOString().split('T')[0],
                theme: theme.theme,
                themeFr: theme.themeFr,
                targetMinutes: 20,
                completed: false,
            };
        });
        // Generate weekly milestones
        const weeklyMilestones = [
            {
                week: 1,
                title: 'Foundation Week',
                speakingMilestone: 'Introduce yourself and order at a café',
                listeningMilestone: 'Understand basic greetings and numbers',
                writingTask: 'Write a short self-introduction (50 words)',
                targetWRRS: 15,
            },
            {
                week: 2,
                title: 'Everyday Life Week',
                speakingMilestone: 'Navigate shopping and restaurant situations',
                listeningMilestone: 'Follow simple directions and instructions',
                writingTask: 'Describe your daily routine (75 words)',
                targetWRRS: 30,
            },
            {
                week: 3,
                title: 'Practical Skills Week',
                speakingMilestone: 'Handle appointments and phone calls',
                listeningMilestone: 'Understand announcements and simple news',
                writingTask: 'Write an email making plans (100 words)',
                targetWRRS: 50,
            },
            {
                week: 4,
                title: 'Confidence Week',
                speakingMilestone: 'Express opinions and handle problems',
                listeningMilestone: 'Follow conversations between native speakers',
                writingTask: 'Write about a memorable experience (125 words)',
                targetWRRS: 70,
            },
        ];
        db.prepare(`
      INSERT INTO challenges (id, user_id, start_level, target_level, start_date, end_date, daily_plan, weekly_milestones, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(challengeId, userId, startLevel, targetLevel, start.toISOString().split('T')[0], end.toISOString().split('T')[0], JSON.stringify(dailyPlan), JSON.stringify(weeklyMilestones), new Date().toISOString());
        res.status(201).json({
            success: true,
            data: {
                challenge: {
                    id: challengeId,
                    startLevel,
                    targetLevel,
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                    durationDays: 30,
                    status: 'active',
                    currentDay: 1,
                    dailyPlan,
                    weeklyMilestones,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /progress/challenge
router.get('/challenge', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const challenge = db.prepare(`
      SELECT * FROM challenges WHERE user_id = ? AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `).get(userId);
        if (!challenge) {
            res.json({
                success: true,
                data: { challenge: null },
            });
            return;
        }
        // Calculate current day
        const start = new Date(challenge.start_date);
        const today = new Date();
        const currentDay = Math.min(30, Math.max(1, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1));
        res.json({
            success: true,
            data: {
                challenge: {
                    id: challenge.id,
                    startLevel: challenge.start_level,
                    targetLevel: challenge.target_level,
                    startDate: challenge.start_date,
                    endDate: challenge.end_date,
                    status: challenge.status,
                    currentDay,
                    completedDays: JSON.parse(challenge.daily_plan).filter((d) => d.completed).length,
                    dailyPlan: JSON.parse(challenge.daily_plan),
                    weeklyMilestones: JSON.parse(challenge.weekly_milestones),
                    progressMetrics: JSON.parse(challenge.progress_metrics || '{}'),
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /progress/challenge/:id/day/:day/complete
router.post('/challenge/:id/day/:day/complete', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id, day } = req.params;
        const { metrics } = req.body;
        const challenge = db.prepare(`
      SELECT * FROM challenges WHERE id = ? AND user_id = ?
    `).get(id, userId);
        if (!challenge) {
            throw new errorHandler_1.NotFoundError('Challenge');
        }
        const dailyPlan = JSON.parse(challenge.daily_plan);
        const dayIndex = parseInt(day) - 1;
        if (dayIndex >= 0 && dayIndex < dailyPlan.length) {
            dailyPlan[dayIndex].completed = true;
            dailyPlan[dayIndex].completedAt = new Date().toISOString();
            dailyPlan[dayIndex].metrics = metrics;
        }
        // Update progress metrics
        const progressMetrics = JSON.parse(challenge.progress_metrics || '{}');
        progressMetrics.lessonsCompleted = dailyPlan.filter((d) => d.completed).length;
        progressMetrics.totalMinutesStudied = (progressMetrics.totalMinutesStudied || 0) + (metrics?.timeSpent || 20);
        db.prepare(`
      UPDATE challenges SET daily_plan = ?, progress_metrics = ?, current_day = ? WHERE id = ?
    `).run(JSON.stringify(dailyPlan), JSON.stringify(progressMetrics), parseInt(day), id);
        res.json({
            success: true,
            data: {
                day: parseInt(day),
                completed: true,
                progressMetrics,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// Helper functions
function getCurrentWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.ceil(diff / oneWeek);
}
function getWeekStart(weekNumber) {
    const year = new Date().getFullYear();
    const firstDay = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7;
    firstDay.setDate(firstDay.getDate() + daysToAdd);
    // Adjust to Monday
    const dayOfWeek = firstDay.getDay();
    firstDay.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return firstDay;
}
exports.default = router;
//# sourceMappingURL=progress.js.map