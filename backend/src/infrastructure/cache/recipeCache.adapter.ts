import { Recipe } from "../../entities/recipe.entity";
import { IRecipeCache } from "../../ports/recipeCache.port";
import {
    getCachedRecipes,
    invalidateRecipeCache,
    setCachedRecipes,
} from "../../utils/recipeCache.util";

export class InMemoryRecipeCache implements IRecipeCache {
    get(): Recipe[] | null {
        return getCachedRecipes();
    }

    set(recipes: Recipe[]): void {
        setCachedRecipes(recipes);
    }

    invalidate(): void {
        invalidateRecipeCache();
    }
}
