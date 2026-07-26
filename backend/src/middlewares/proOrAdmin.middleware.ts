import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/http-exception';
import { ApiResponseHelper } from '../utils/apihelper.util';

export const proOrAdminMiddleware = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpException(401, 'Unauthorized no user info');
        }
        if (req.user.role !== 'admin' && !req.user.isPro) {
            throw new HttpException(403, 'Only admins and Pro members can add recipes');
        }
        return next();
    } catch (err: Error | any) {
        return ApiResponseHelper.error(
            res,
            err.message || 'Internal Server Error',
            err.status || 500
        );
    }
}
