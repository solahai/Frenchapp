"use strict";
// Authentication Routes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const database_1 = require("../services/database");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const db = database_1.DatabaseService.getInstance().getDb();
// Validation schemas
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    displayName: zod_1.z.string().min(2).max(50),
    nativeLanguage: zod_1.z.string().default('en'),
    learningGoal: zod_1.z.string().default('daily_life'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
// POST /auth/register
router.post('/register', async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);
        // Check if email exists
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
        if (existing) {
            throw new errorHandler_1.ValidationError('Email already registered');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        // Create user
        const userId = `user_${(0, uuid_1.v4)()}`;
        const now = new Date().toISOString();
        const defaultPreferences = {
            dailyGoalMinutes: 20,
            preferredTopics: [],
            notificationSettings: {
                dailyReminder: true,
                reminderTime: '09:00',
                weeklyReport: true,
                achievementAlerts: true,
                streakReminders: true,
            },
            accessibilitySettings: {
                dyslexiaFriendlyFont: false,
                increasedSpacing: false,
                fontSize: 'medium',
                highContrast: false,
                reduceMotion: false,
                screenReader: false,
                captionsAlways: true,
            },
            audioSettings: {
                speechRate: 1.0,
                autoPlayAudio: true,
                nativeSpeakerVoice: 'female',
                volume: 0.8,
            },
            learningGoal: data.learningGoal,
            timezone: 'UTC',
            locale: 'en',
        };
        const defaultProfile = {
            currentLevel: 'A1',
            targetLevel: 'B1',
            skillLevels: {
                listening: 'A1',
                speaking: 'A1',
                reading: 'A1',
                writing: 'A1',
            },
            nativeLanguage: data.nativeLanguage,
            otherLanguages: [],
            learningStartDate: now,
            totalStudyTimeMinutes: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: now,
            placementTestCompleted: false,
            levelProgress: {
                level: 'A1',
                overallProgress: 0,
                skillProgress: { listening: 0, speaking: 0, reading: 0, writing: 0 },
                canDosCompleted: [],
                canDosInProgress: [],
                estimatedTimeToNextLevel: 30,
            },
            weeklyRealWorldReadinessScore: {
                overall: 0,
                comprehension: 0,
                spokenIntelligibility: 0,
                errorRecurrenceReduction: 0,
                vocabularyRecallSpeed: 0,
                weeklyTrend: [],
                lastUpdated: now,
            },
        };
        db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, preferences, profile, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, data.email, passwordHash, data.displayName, JSON.stringify(defaultPreferences), JSON.stringify(defaultProfile), now, now);
        // Generate tokens
        const { accessToken, refreshToken } = (0, auth_1.generateTokens)(userId, data.email);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: userId,
                    email: data.email,
                    displayName: data.displayName,
                    preferences: defaultPreferences,
                    profile: defaultProfile,
                },
                accessToken,
                refreshToken,
                expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            next(new errorHandler_1.ValidationError('Invalid input', { errors: error.errors }));
        }
        else {
            next(error);
        }
    }
});
// POST /auth/login
router.post('/login', async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);
        // Find user
        const user = db.prepare(`
      SELECT id, email, password_hash, display_name, preferences, profile
      FROM users WHERE email = ?
    `).get(data.email);
        if (!user) {
            throw new errorHandler_1.AuthenticationError('Invalid email or password');
        }
        // Verify password
        const validPassword = await bcryptjs_1.default.compare(data.password, user.password_hash);
        if (!validPassword) {
            throw new errorHandler_1.AuthenticationError('Invalid email or password');
        }
        // Generate tokens
        const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user.id, user.email);
        // Update last active
        db.prepare(`UPDATE users SET updated_at = ? WHERE id = ?`).run(new Date().toISOString(), user.id);
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.display_name,
                    preferences: JSON.parse(user.preferences),
                    profile: JSON.parse(user.profile),
                },
                accessToken,
                refreshToken,
                expiresIn: 7 * 24 * 60 * 60,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            next(new errorHandler_1.ValidationError('Invalid input', { errors: error.errors }));
        }
        else {
            next(error);
        }
    }
});
// POST /auth/refresh
router.post('/refresh', (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            throw new errorHandler_1.ValidationError('Refresh token required');
        }
        const decoded = (0, auth_1.verifyRefreshToken)(token);
        const { accessToken, refreshToken } = (0, auth_1.generateTokens)(decoded.userId, decoded.email);
        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                expiresIn: 7 * 24 * 60 * 60,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /auth/logout
router.post('/logout', (req, res) => {
    // In a production app, you'd invalidate the refresh token here
    res.json({
        success: true,
        data: { message: 'Logged out successfully' },
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map