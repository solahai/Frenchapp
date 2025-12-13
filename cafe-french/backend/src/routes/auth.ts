// Authentication Routes

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { DatabaseService } from '../services/database';
import { generateTokens, verifyRefreshToken } from '../middleware/auth';
import { ValidationError, AuthenticationError } from '../middleware/errorHandler';

const router = Router();
const db = DatabaseService.getInstance().getDb();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50),
  nativeLanguage: z.string().default('en'),
  learningGoal: z.string().default('daily_life'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existing) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const userId = `user_${uuidv4()}`;
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
    `).run(
      userId,
      data.email,
      passwordHash,
      data.displayName,
      JSON.stringify(defaultPreferences),
      JSON.stringify(defaultProfile),
      now,
      now
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userId, data.email);

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Invalid input', { errors: error.errors }));
    } else {
      next(error);
    }
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = db.prepare(`
      SELECT id, email, password_hash, display_name, preferences, profile
      FROM users WHERE email = ?
    `).get(data.email) as any;

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const validPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!validPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Update last active
    db.prepare(`UPDATE users SET updated_at = ? WHERE id = ?`).run(
      new Date().toISOString(),
      user.id
    );

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Invalid input', { errors: error.errors }));
    } else {
      next(error);
    }
  }
});

// POST /auth/refresh
router.post('/refresh', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new ValidationError('Refresh token required');
    }

    const decoded = verifyRefreshToken(token);
    const { accessToken, refreshToken } = generateTokens(decoded.userId, decoded.email);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', (req: Request, res: Response) => {
  // In a production app, you'd invalidate the refresh token here
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});

export default router;
