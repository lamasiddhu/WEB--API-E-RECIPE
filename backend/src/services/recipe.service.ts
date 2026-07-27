import mongoose from "mongoose";
import { RecipeMongoRepository } from "../repositories/recipe.repository";
import { IRecipe } from "../models/recipe.model";
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
    async getAllRecipes(search: string, viewer?: Viewer) {
        // Only the unfiltered "browse everything" list is cached — search
        // results always come straight from the database. The cache itself
        // always stays the raw, unfiltered list shared across all viewers;
        // per-viewer entitlement filtering happens after, on every request.
        let recipes;
        if (!search) {
            const cached = getCachedRecipes();
            if (cached) {
                recipes = cached;
            } else {
                recipes = await recipeRepository.getAll(search);
                setCachedRecipes(recipes);
            }
        } else {
            recipes = await recipeRepository.getAll(search);
        }
        return recipes.map((recipe) => this.filterForViewer(recipe, viewer));
    }

    async getRecipeById(id: string, viewer?: Viewer) {
        const recipe = await recipeRepository.getById(id);
        if (!recipe) throw new HttpException(404, "Recipe not found");
        return this.filterForViewer(recipe, viewer);
    }

    // Not entitled to a Normal/Pro recipe: never send the real ingredients/steps
    // (or the video walkthrough) to the client — the "buy to unlock" UI is only
    // a CSS blur, so the underlying data must already be stripped before it
    // leaves the server.
    private filterForViewer(recipe: IRecipe, viewer?: Viewer) {
        const badge = recipe.badge || "Free";
        if (badge === "Free") return recipe;

        const isEntitled =
            viewer?.role === "admin" ||
            !!viewer?.isPro ||
            (badge === "Normal" && !!viewer?.purchasedRecipeIds.includes(String(recipe._id))) ||
            (!!recipe.createdBy && String(recipe.createdBy) === viewer?.id);
        if (isEntitled) return recipe;

        const obj = recipe.toObject();
        return { ...obj, ingredients: [], steps: [], videoUrl: undefined };
    }

    // Video walkthroughs only ever make sense for Normal/Pro (purchasable)
    // recipes — a Free recipe never gets one, enforced here so a client can't
    // sneak a videoUrl onto a Free-tier recipe even if the admin UI never offers it.
    private stripVideoIfFree<T extends { badge?: string; videoUrl?: string }>(data: T): T {
        if (data.badge === "Free") {
            return { ...data, videoUrl: undefined };
        }
        return data;
    }

    async createRecipe(data: CreateRecipeDTO, createdBy: string) {
        const recipe = await recipeRepository.create({
            ...this.stripVideoIfFree(data),
            createdBy: new mongoose.Types.ObjectId(createdBy),
        });
        invalidateRecipeCache();
        return recipe;
    }

    async updateRecipe(id: string, data: UpdateRecipeDTO, requester: Requester) {
        await this.assertCanModify(id, requester);
        const updated = await recipeRepository.update(id, this.stripVideoIfFree(data));
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
