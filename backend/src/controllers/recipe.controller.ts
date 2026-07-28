import { Request, Response } from "express";
import { z } from "zod";
import { RecipeViewer } from "../entities/recipe.entity";
import { CreateRecipeDTO, UpdateRecipeDTO } from "../dtos/recipe.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { createRecipeUseCase, deleteRecipeUseCase, getAllRecipesForAdminUseCase, getAllRecipesUseCase, getRecipeByIdUseCase, updateRecipeUseCase } from "../container";

function buildViewer(req: Request): RecipeViewer | undefined {
    const reqUser = req.user as any;
    if (!reqUser) return undefined;
    return {
        id: String(reqUser._id),
        role: reqUser.role,
        isPro: !!reqUser.isPro,
        purchasedRecipeIds: (reqUser.purchasedRecipeIds || []).map((id: unknown) => String(id)),
    };
}

export class RecipeController {
    async getAllRecipesForAdmin(req: Request, res: Response) {
        try {
            const search = typeof req.query.search === "string" ? req.query.search : "";
            const recipes = await getAllRecipesForAdminUseCase.execute(search);
            return ApiResponseHelper.success(res, recipes, "Recipes fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getAllRecipes(req: Request, res: Response) {
        try {
            const search = typeof req.query.search === "string" ? req.query.search : "";
            const recipes = await getAllRecipesUseCase.execute(search, buildViewer(req));
            return ApiResponseHelper.success(res, recipes, "Recipes fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getRecipeById(req: Request, res: Response) {
        try {
            const recipe = await getRecipeByIdUseCase.execute(String(req.params.id), buildViewer(req));
            return ApiResponseHelper.success(res, recipe, "Recipe fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async createRecipe(req: Request, res: Response) {
        try {
            const parsed = CreateRecipeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const recipe = await createRecipeUseCase.execute(parsed.data, {
                id: String(user._id),
                role: user.role,
                fullName: user.fullName,
            });
            return ApiResponseHelper.success(res, recipe, "Recipe created successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async submitRecipe(req: Request, res: Response) {
        try {
            const parsed = CreateRecipeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const recipe = await createRecipeUseCase.execute(parsed.data, {
                id: String(user._id),
                role: user.role,
                fullName: user.fullName,
            }, true);
            return ApiResponseHelper.success(res, recipe, "Recipe submitted for approval", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updateRecipe(req: Request, res: Response) {
        try {
            const parsed = UpdateRecipeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const requester = { id: String((req.user as any)._id), role: (req.user as any).role };
            const recipe = await updateRecipeUseCase.execute(String(req.params.id), parsed.data, requester);
            return ApiResponseHelper.success(res, recipe, "Recipe updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteRecipe(req: Request, res: Response) {
        try {
            const requester = { id: String((req.user as any)._id), role: (req.user as any).role };
            await deleteRecipeUseCase.execute(String(req.params.id), requester);
            return ApiResponseHelper.success(res, null, "Recipe deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
