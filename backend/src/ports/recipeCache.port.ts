import { Recipe } from "../entities/recipe.entity";

export interface IRecipeCache {
    get(): Recipe[] | null;
    set(recipes: Recipe[]): void;
    invalidate(): void;
}
