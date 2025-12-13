// Authentication middleware

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from './errorHandler';

export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AuthenticationError('No authorization header provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Invalid authorization format. Use Bearer token');
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired. Please login again'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else {
      next(error);
    }
  }
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET;

  if (token && secret) {
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.user = decoded;
    } catch {
      // Token invalid, but optional - continue without user
    }
  }

  next();
}

export function generateTokens(userId: string, email: string): { accessToken: string; refreshToken: string } {
  const secret = process.env.JWT_SECRET || 'default-secret';
  
  // Convert expiresIn to seconds for numeric values
  const parseExpiry = (val: string): number => {
    const match = val.match(/^(\d+)([dhms]?)$/);
    if (!match) return 604800; // Default 7 days in seconds
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

  const accessToken = jwt.sign(
    { userId, email },
    secret,
    { expiresIn: expiresInSeconds }
  );

  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    secret,
    { expiresIn: refreshExpiresInSeconds }
  );

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const decoded = jwt.verify(token, secret) as JwtPayload & { type?: string };
  
  if (decoded.type !== 'refresh') {
    throw new AuthenticationError('Invalid refresh token');
  }
  
  return decoded;
}
