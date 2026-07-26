import mongoose from "mongoose";
import { RecipeMongoRepository } from "../repositories/recipe.repository";
import { CreateRecipeDTO, UpdateRecipeDTO } from "../dtos/recipe.dto";
import { HttpException } from "../exceptions/http-exception";
import { getCachedRecipes, setCachedRecipes, invalidateRecipeCache } from "../utils/recipeCache.util";

const recipeRepository = new RecipeMongoRepository();

export interface Requester {
    id: string;
    role: "admin" | "user";
}

export interface Viewer {
    id: string;
    role: "admin" | "user";
    isPro: boolean;
    purchasedRecipeIds: string[];
}

export class RecipeService {
    async getAllRecipes(search: string) {
        // Only the unfiltered "browse everything" list is cached — search
        // results always come straight from the database.
        if (!search) {
            const cached = getCachedRecipes();
            if (cached) return cached;

            const recipes = await recipeRepository.getAll(search);
            setCachedRecipes(recipes);
            return recipes;
        }
        return await recipeRepository.getAll(search);
    }

    async getRecipeById(id: string, viewer?: Viewer) {
        const recipe = await recipeRepository.getById(id);
        if (!recipe) throw new HttpException(404, "Recipe not found");

        const badge = recipe.badge || "Free";
        if (badge === "Free") return recipe;

        const isEntitled =
            viewer?.role === "admin" ||
            !!viewer?.isPro ||
            (badge === "Normal" && !!viewer?.purchasedRecipeIds.includes(id));
        if (isEntitled) return recipe;

        // Not entitled: never send the real ingredients/steps to the client —
        // the "buy to unlock" UI is only a CSS blur, so the underlying data
        // must already be stripped before it leaves the server.
        const obj = recipe.toObject();
        return { ...obj, ingredients: [], steps: [] };
    }

    async createRecipe(data: CreateRecipeDTO, createdBy: string) {
        const recipe = await recipeRepository.create({ ...data, createdBy: new mongoose.Types.ObjectId(createdBy) });
        invalidateRecipeCache();
        return recipe;
    }

    async updateRecipe(id: string, data: UpdateRecipeDTO, requester: Requester) {
        await this.assertCanModify(id, requester);
        const updated = await recipeRepository.update(id, data);
        if (!updated) throw new HttpException(404, "Recipe not found");
        invalidateRecipeCache();
        return updated;
    }

    async deleteRecipe(id: string, requester: Requester) {
        await this.assertCanModify(id, requester);
        const deleted = await recipeRepository.delete(id);
        if (!deleted) throw new HttpException(404, "Recipe not found");
        invalidateRecipeCache();
        return true;
    }

    private async assertCanModify(id: string, requester: Requester) {
        if (requester.role === "admin") return;

        const recipe = await recipeRepository.getById(id);
        if (!recipe) throw new HttpException(404, "Recipe not found");
        if (!recipe.createdBy || String(recipe.createdBy) !== requester.id) {
            throw new HttpException(403, "You can only edit or delete recipes you created");
        }
    }
}
