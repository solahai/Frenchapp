// Mistake Tracker Routes

import { Router, Request, Response, NextFunction } from 'express';
import { mistakeTracker } from '../services/mistakeTracker';

const router = Router();

// GET /mistakes/profile
router.get('/profile', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const profile = mistakeTracker.getProfile(userId);
    const topErrors = mistakeTracker.getTopRecurringErrors(userId, 5);

    const recommendations = [];
    
    // Generate recommendations based on top errors
    for (const error of topErrors.slice(0, 3)) {
      if (error.type === 'grammar') {
        recommendations.push(`Focus on ${error.description} - it appeared ${error.occurrences} times recently.`);
      } else if (error.type === 'vocabulary') {
        recommendations.push(`Practice distinguishing ${error.description}.`);
      } else if (error.type === 'pronunciation') {
        recommendations.push(`Work on pronunciation: ${error.description}.`);
      }
    }

    res.json({
      success: true,
      data: {
        profile: {
          userId: profile.userId,
          totalErrorsTracked: profile.totalErrorsTracked,
          grammarErrorCount: profile.grammarErrors.length,
          vocabularyConfusionCount: profile.vocabularyConfusions.length,
          pronunciationErrorCount: profile.pronunciationErrors.length,
          graduatedErrors: profile.graduatedErrors.length,
          lastUpdated: profile.lastUpdated,
        },
        topErrors,
        recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /mistakes/errors
router.get('/errors', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const type = req.query.type as string;

    const profile = mistakeTracker.getProfile(userId);

    let errors: any[] = [];

    if (!type || type === 'grammar') {
      errors = errors.concat(profile.grammarErrors.map(e => ({
        ...e,
        type: 'grammar',
      })));
    }

    if (!type || type === 'vocabulary') {
      errors = errors.concat(profile.vocabularyConfusions.map(e => ({
        ...e,
        type: 'vocabulary',
      })));
    }

    if (!type || type === 'pronunciation') {
      errors = errors.concat(profile.pronunciationErrors.map(e => ({
        ...e,
        type: 'pronunciation',
      })));
    }

    // Sort by occurrence count
    errors.sort((a, b) => (b.totalOccurrences || b.totalConfusions || 0) - (a.totalOccurrences || a.totalConfusions || 0));

    res.json({
      success: true,
      data: { errors },
    });
  } catch (error) {
    next(error);
  }
});

// GET /mistakes/workout
router.get('/workout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const maxMinutes = parseInt(req.query.maxMinutes as string) || 12;

    const workout = await mistakeTracker.generateRemediationWorkout(userId, maxMinutes);

    res.json({
      success: true,
      data: {
        workout,
        estimatedMinutes: workout.estimatedMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /mistakes/workout/:id/complete
router.post('/workout/:id/complete', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { results } = req.body;

    // Record correct usages for graduation tracking
    if (results?.correctErrorIds) {
      for (const errorId of results.correctErrorIds) {
        mistakeTracker.recordCorrectUsage(userId, errorId);
      }
    }

    res.json({
      success: true,
      data: {
        message: 'Workout completed',
        errorsAddressed: results?.correctErrorIds?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /mistakes/analytics
router.get('/analytics', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const period = (req.query.period as string) || 'week';

    const profile = mistakeTracker.getProfile(userId);

    // Calculate analytics
    const grammarCount = profile.grammarErrors.reduce((sum, e) => sum + e.totalOccurrences, 0);
    const vocabCount = profile.vocabularyConfusions.reduce((sum, e) => sum + e.totalConfusions, 0);
    const pronunciationCount = profile.pronunciationErrors.reduce((sum, e) => sum + e.totalOccurrences, 0);

    const errorsByCategory: Record<string, number> = {};
    for (const error of profile.grammarErrors) {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + error.totalOccurrences;
    }

    const improvingErrors = profile.grammarErrors.filter(e => e.status === 'improving').length +
                           profile.pronunciationErrors.filter(e => e.status === 'improving').length;

    const persistentErrors = profile.grammarErrors.filter(e => e.status === 'recurring').length +
                            profile.vocabularyConfusions.filter(e => e.status === 'recurring').length +
                            profile.pronunciationErrors.filter(e => e.status === 'recurring').length;

    res.json({
      success: true,
      data: {
        period,
        totalErrors: grammarCount + vocabCount + pronunciationCount,
        uniqueErrorTypes: Object.keys(errorsByCategory).length,
        mostCommonCategory: Object.entries(errorsByCategory)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
        grammarErrorCount: grammarCount,
        vocabularyErrorCount: vocabCount,
        pronunciationErrorCount: pronunciationCount,
        errorsByCategory,
        resolvedErrors: profile.graduatedErrors.length,
        improvingErrors,
        persistentErrors,
        priorityAreas: Object.entries(errorsByCategory)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat]) => cat),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /mistakes/weekly-update
router.post('/weekly-update', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    mistakeTracker.weeklyUpdate(userId);

    res.json({
      success: true,
      data: { message: 'Weekly update completed' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
