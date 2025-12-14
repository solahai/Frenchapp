"use strict";
// Rate limiting middleware
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.speechRateLimiter = exports.aiRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.rateLimiter = (0, express_rate_limit_1.default)({
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
exports.aiRateLimiter = (0, express_rate_limit_1.default)({
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
exports.speechRateLimiter = (0, express_rate_limit_1.default)({
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
//# sourceMappingURL=rateLimiter.js.map