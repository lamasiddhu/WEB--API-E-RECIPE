import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/user.entity';
import { HttpException } from '../exceptions/http-exception';
import { ApiResponseHelper } from '../utils/apihelper.util';
import { tokenService, userRepository } from '../container';

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
} // adding tag (user) to request, can use req.user

export const authorizedMiddleware =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer '))
                throw new HttpException(401, 'Unauthorized JWT invalid');
            // JWT token should start with "Bearer <token>"
            const token = authHeader.split(' ')[1]; // 0 -> Bearer, 1 -> token
            if (!token) throw new HttpException(401, 'Unauthorized JWT missing');
            const decodedToken = tokenService.verify(token);
            if (!decodedToken || !decodedToken.id) {
                throw new HttpException(401, 'Unauthorized JWT unverified');
            } // make function async
            const user = await userRepository.getUserById(decodedToken.id);
            if (!user) throw new HttpException(401, 'Unauthorized user not found');
            req.user = user; // attach user to request (like tag)
            return next();
        } catch (err: Error | any) {
            return ApiResponseHelper.error(
                res,
                err.message || 'Internal Server Error',
                err.status || 500
            );
        }
    }

// For routes that stay public (e.g. browsing a recipe) but still need to know
// who's asking, if anyone, so entitlement-gated fields can be filtered
// per-viewer. Never rejects the request — an anonymous or invalid/expired
// token is simply treated as an anonymous viewer instead of a 401.
export const optionalAuthMiddleware =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                if (token) {
                    const decodedToken = tokenService.verify(token);
                    if (decodedToken && decodedToken.id) {
                        const user = await userRepository.getUserById(decodedToken.id);
                        if (user) req.user = user;
                    }
                }
            }
        } catch {
            // Invalid/expired token on a public route — fall back to anonymous.
        }
        return next();
    }
