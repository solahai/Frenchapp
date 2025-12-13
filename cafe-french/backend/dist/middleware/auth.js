"use strict";
// Authentication middleware
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuth = optionalAuth;
exports.generateTokens = generateTokens;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errorHandler_1.AuthenticationError('No authorization header provided');
        }
        if (!authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AuthenticationError('Invalid authorization format. Use Bearer token');
        }
        const token = authHeader.substring(7);
        if (!token) {
            throw new errorHandler_1.AuthenticationError('No token provided');
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errorHandler_1.AuthenticationError('Token expired. Please login again'));
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.AuthenticationError('Invalid token'));
        }
        else {
            next(error);
        }
    }
}
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    if (token && secret) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            req.user = decoded;
        }
        catch {
            // Token invalid, but optional - continue without user
        }
    }
    next();
}
function generateTokens(userId, email) {
    const secret = process.env.JWT_SECRET || 'default-secret';
    // Convert expiresIn to seconds for numeric values
    const parseExpiry = (val) => {
        const match = val.match(/^(\d+)([dhms]?)$/);
        if (!match)
            return 604800; // Default 7 days in seconds
        const num = parseInt(match[1], 10);
        switch (match[2]) {
            case 'd': return num * 86400;
            case 'h': return num * 3600;
            case 'm': return num * 60;
            case 's': return num;
            default: return num;
        }
    };
    const expiresInSeconds = parseExpiry(process.env.JWT_EXPIRES_IN || '7d');
    const refreshExpiresInSeconds = parseExpiry(process.env.JWT_REFRESH_EXPIRES_IN || '30d');
    const accessToken = jsonwebtoken_1.default.sign({ userId, email }, secret, { expiresIn: expiresInSeconds });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, email, type: 'refresh' }, secret, { expiresIn: refreshExpiresInSeconds });
    return { accessToken, refreshToken };
}
function verifyRefreshToken(token) {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    if (decoded.type !== 'refresh') {
        throw new errorHandler_1.AuthenticationError('Invalid refresh token');
    }
    return decoded;
}
//# sourceMappingURL=auth.js.map