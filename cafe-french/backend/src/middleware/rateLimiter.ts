// Rate limiting middleware

import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for AI endpoints
export const aiRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'AI service rate limit reached. Please wait a moment.',
    }
  },
});

// Very strict rate limit for speech endpoints (expensive)
export const speechRateLimiter = rateLimit({
  windowMs: 60000,
  max: 20,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Speech service rate limit reached. Please wait a moment.',
    }
  },
});
