import mongoose from "mongoose";
import { RecipeModel, IRecipe } from "../models/recipe.model";

export interface IRecipeRepository {
    getAll(search: string): Promise<IRecipe[]>;
    getById(id: string): Promise<IRecipe | null>;
    create(recipe: Partial<IRecipe>): Promise<IRecipe>;
    update(id: string, recipe: Partial<IRecipe>): Promise<IRecipe | null>;
    delete(id: string): Promise<boolean>;
}

export class RecipeMongoRepository implements IRecipeRepository {
    async getAll(search: string): Promise<IRecipe[]> {
        const filter = search ? { title: { $regex: search, $options: "i" } } : {};
        return await RecipeModel.find(filter).sort({ createdAt: -1 });
    }

    async getById(id: string): Promise<IRecipe | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await RecipeModel.findById(id);
    }

    async create(recipe: Partial<IRecipe>): Promise<IRecipe> {
        return await RecipeModel.create(recipe);
    }

    async update(id: string, recipe: Partial<IRecipe>): Promise<IRecipe | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await RecipeModel.findByIdAndUpdate(id, recipe, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.isValidObjectId(id)) return false;
        const deleted = await RecipeModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
