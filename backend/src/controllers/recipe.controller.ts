import { Request, Response } from "express";
import { z } from "zod";
import { RecipeService } from "../services/recipe.service";
import { CreateRecipeDTO, UpdateRecipeDTO } from "../dtos/recipe.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const recipeService = new RecipeService();

export class RecipeController {
    async getAllRecipes(req: Request, res: Response) {
        try {
            const search = typeof req.query.search === "string" ? req.query.search : "";
            const recipes = await recipeService.getAllRecipes(search);
            return ApiResponseHelper.success(res, recipes, "Recipes fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getRecipeById(req: Request, res: Response) {
        try {
            const reqUser = req.user as any;
            const viewer = reqUser
                ? {
                    id: String(reqUser._id),
                    role: reqUser.role,
                    isPro: !!reqUser.isPro,
                    purchasedRecipeIds: (reqUser.purchasedRecipeIds || []).map((id: unknown) => String(id)),
                }
                : undefined;
            const recipe = await recipeService.getRecipeById(String(req.params.id), viewer);
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
            const recipe = await recipeService.createRecipe(parsed.data, String((req.user as any)._id));
            return ApiResponseHelper.success(res, recipe, "Recipe created successfully", 201);
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
            const recipe = await recipeService.updateRecipe(String(req.params.id), parsed.data, requester);
            return ApiResponseHelper.success(res, recipe, "Recipe updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteRecipe(req: Request, res: Response) {
        try {
            const requester = { id: String((req.user as any)._id), role: (req.user as any).role };
            await recipeService.deleteRecipe(String(req.params.id), requester);
            return ApiResponseHelper.success(res, null, "Recipe deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
