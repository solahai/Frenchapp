import { Request, Response, NextFunction } from 'express';
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
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): void;
export declare function generateTokens(userId: string, email: string): {
    accessToken: string;
    refreshToken: string;
};
export declare function verifyRefreshToken(token: string): JwtPayload;
//# sourceMappingURL=auth.d.ts.map