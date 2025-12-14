"use strict";
// Error handling middleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIServiceError = exports.RateLimitError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
exports.errorHandler = errorHandler;
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
class RateLimitError extends AppError {
    constructor() {
        super('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
    }
}
exports.RateLimitError = RateLimitError;
class AIServiceError extends AppError {
    constructor(message = 'AI service temporarily unavailable') {
        super(message, 503, 'AI_SERVICE_ERROR');
    }
}
exports.AIServiceError = AIServiceError;
function errorHandler(err, req, res, _next) {
    console.error('Error:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message;
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(err.details && { details: err.details }),
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        },
        meta: {
            timestamp: new Date().toISOString(),
            path: req.path,
        }
    });
}
//# sourceMappingURL=errorHandler.js.map