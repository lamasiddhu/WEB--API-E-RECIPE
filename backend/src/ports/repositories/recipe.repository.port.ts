import { Recipe } from "../../entities/recipe.entity";

export interface IRecipeRepository {
    getAll(search: string): Promise<Recipe[]>;
    getAllForAdmin(search: string): Promise<Recipe[]>;
    getById(id: string): Promise<Recipe | null>;
    create(recipe: Partial<Recipe>): Promise<Recipe>;
    update(id: string, recipe: Partial<Recipe>): Promise<Recipe | null>;
    delete(id: string): Promise<boolean>;
}
