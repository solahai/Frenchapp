import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
    details?: Record<string, any>;
}
export declare class AppError extends Error implements ApiError {
    statusCode: number;
    code: string;
    details?: Record<string, any>;
    constructor(message: string, statusCode?: number, code?: string, details?: Record<string, any>);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class RateLimitError extends AppError {
    constructor();
}
export declare class AIServiceError extends AppError {
    constructor(message?: string);
}
export declare function errorHandler(err: ApiError, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map