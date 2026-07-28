import { Request, Response } from "express";
import { z } from "zod";
import { FoodProfileDTO } from "../dtos/foodProfile.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { getFoodProfileUseCase, saveFoodProfileUseCase } from "../container";

export class FoodProfileController {
    async getProfile(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const profile = await getFoodProfileUseCase.execute(userId);
            return ApiResponseHelper.success(res, profile, "Food profile fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async saveProfile(req: Request, res: Response) {
        try {
            const parsed = FoodProfileDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            const profile = await saveFoodProfileUseCase.execute(userId, parsed.data);
            return ApiResponseHelper.success(res, profile, "Food profile saved successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
