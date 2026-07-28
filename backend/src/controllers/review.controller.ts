import { Request, Response } from "express";
import { z } from "zod";
import { createReviewUseCase, deleteReviewUseCase, getAllReviewsUseCase, getRecipeReviewsUseCase, updateReviewUseCase } from "../container";
import { ReviewDTO } from "../dtos/review.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class ReviewController {
    async getForRecipe(req: Request, res: Response) {
        try {
            const reviews = await getRecipeReviewsUseCase.execute(String(req.params.recipeId));
            return ApiResponseHelper.success(res, reviews, "Reviews fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const parsed = ReviewDTO.safeParse(req.body);
            if (!parsed.success) return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            const user = req.user!;
            const review = await createReviewUseCase.execute(String(req.params.recipeId), parsed.data, {
                id: user._id,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                isPro: user.isPro,
                purchasedRecipeIds: user.purchasedRecipeIds || [],
            });
            return ApiResponseHelper.success(res, review, "Review submitted successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            return ApiResponseHelper.success(res, await getAllReviewsUseCase.execute(), "Reviews fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const parsed = ReviewDTO.safeParse(req.body);
            if (!parsed.success) return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            const review = await updateReviewUseCase.execute(String(req.params.id), parsed.data);
            return ApiResponseHelper.success(res, review, "Review updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await deleteReviewUseCase.execute(String(req.params.id));
            return ApiResponseHelper.success(res, null, "Review deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
