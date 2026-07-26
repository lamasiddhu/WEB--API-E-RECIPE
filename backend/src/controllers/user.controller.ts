import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateMeDTO, ChangeMyPasswordDTO, SetNewPasswordDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";
const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(userData.error), 400);
            }
            const user = await userService.createUser(userData.data);
            return ApiResponseHelper.success(res, user, "User created successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
    
    async loginUser(req: Request, res: Response) {
        try{
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsedData.error), 400);
            }
            const { user, token } = await userService.loginUser(parsedData.data);
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        }catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getMe(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const user = await userService.getMe(userId);
            return ApiResponseHelper.success(res, user, "Profile fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateMe(req: Request, res: Response) {
        try {
            const parsed = UpdateMeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            const user = await userService.updateMe(userId, parsed.data);
            return ApiResponseHelper.success(res, user, "Profile updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async addFavorite(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const user = await userService.addFavorite(userId, String(req.params.recipeId));
            return ApiResponseHelper.success(res, user, "Recipe added to favorites");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async removeFavorite(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const user = await userService.removeFavorite(userId, String(req.params.recipeId));
            return ApiResponseHelper.success(res, user, "Recipe removed from favorites");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async setNewPassword(req: Request, res: Response) {
        try {
            const parsed = SetNewPasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            await userService.setNewPassword(userId, parsed.data);
            return ApiResponseHelper.success(res, null, "Password set successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async changeMyPassword(req: Request, res: Response) {
        try {
            const parsed = ChangeMyPasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            await userService.changeMyPassword(userId, parsed.data);
            return ApiResponseHelper.success(res, null, "Password changed successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}