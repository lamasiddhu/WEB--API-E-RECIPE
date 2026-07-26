import { IRecipe } from "../models/recipe.model";

// A small in-memory cache for the unfiltered recipe list — the most common
// browse request. Search queries always hit the database directly since
// caching every possible search term isn't worth it here.
const CACHE_TTL_MS = 60_000;

let cachedRecipes: IRecipe[] | null = null;
let cachedAt = 0;

export function getCachedRecipes(): IRecipe[] | null {
    if (!cachedRecipes || Date.now() - cachedAt > CACHE_TTL_MS) return null;
    return cachedRecipes;
}

export function setCachedRecipes(recipes: IRecipe[]): void {
    cachedRecipes = recipes;
    cachedAt = Date.now();
}

export function invalidateRecipeCache(): void {
    cachedRecipes = null;
    cachedAt = 0;
}
