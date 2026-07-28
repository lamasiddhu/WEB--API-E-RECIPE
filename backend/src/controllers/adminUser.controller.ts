import { Request, Response } from "express";
import { z } from "zod";
import { AdminCreateUserDTO, AdminUpdateUserDTO, UpdatePasswordDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import {
    adminCreateUserUseCase,
    adminDeleteUserUseCase,
    adminGetAllUsersUseCase,
    adminGetUserByIdUseCase,
    adminRemovePurchasedRecipeUseCase,
    adminRequestPasswordResetUseCase,
    adminUpdatePasswordUseCase,
    adminUpdateUserUseCase,
} from "../container";

export class AdminUserController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
            const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
            const search = typeof req.query.search === "string" ? req.query.search : "";

            const { users, total } = await adminGetAllUsersUseCase.execute(page, limit, search);
            return ApiResponseHelper.success(res, users, "Users fetched successfully", 200, {
                page,
                limit,
                total,
            });
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const user = await adminGetUserByIdUseCase.execute(String(req.params.id));
            return ApiResponseHelper.success(res, user, "User fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const parsed = AdminCreateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = await adminCreateUserUseCase.execute(parsed.data);
            return ApiResponseHelper.success(res, user, "User created successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const parsed = AdminUpdateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = await adminUpdateUserUseCase.execute(String(req.params.id), parsed.data);
            return ApiResponseHelper.success(res, user, "User updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updatePassword(req: Request, res: Response) {
        try {
            const parsed = UpdatePasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = await adminUpdatePasswordUseCase.execute(String(req.params.id), parsed.data);
            return ApiResponseHelper.success(res, user, "Password updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async requestPasswordReset(req: Request, res: Response) {
        try {
            await adminRequestPasswordResetUseCase.execute(String(req.params.id));
            return ApiResponseHelper.success(res, null, "Password reset request sent to the user");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            await adminDeleteUserUseCase.execute(String(req.params.id));
            return ApiResponseHelper.success(res, null, "User deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async removeUserPurchasedRecipe(req: Request, res: Response) {
        try {
            const user = await adminRemovePurchasedRecipeUseCase.execute(String(req.params.id), String(req.params.recipeId));
            return ApiResponseHelper.success(res, user, "Recipe removed from the user's library");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
