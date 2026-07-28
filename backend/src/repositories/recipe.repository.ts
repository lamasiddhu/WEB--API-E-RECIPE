import mongoose from "mongoose";
import { RecipeModel, IRecipe } from "../models/recipe.model";
import { Recipe } from "../entities/recipe.entity";
import { IRecipeRepository } from "../ports/repositories/recipe.repository.port";

export class RecipeMongoRepository implements IRecipeRepository {
    private toEntity(doc: IRecipe): Recipe {
        return {
            _id: String(doc._id), title: doc.title, description: doc.description, category: doc.category,
            badge: doc.badge, mealType: doc.mealType, duration: doc.duration, chef: doc.chef,
            servings: doc.servings, calories: doc.calories, protein: doc.protein, difficulty: doc.difficulty,
            rating: doc.rating, ingredients: doc.ingredients, steps: doc.steps.map((step) => ({ title: step.title, description: step.description })),
            imageUrl: doc.imageUrl, price: doc.price, tags: doc.tags, videoUrl: doc.videoUrl,
            createdBy: doc.createdBy ? String(doc.createdBy) : undefined,
            approvalStatus: doc.approvalStatus || "approved",
            createdAt: doc.createdAt, updatedAt: doc.updatedAt,
            version: (doc as IRecipe & { __v: number }).__v,
        };
    }
    async getAll(search: string): Promise<Recipe[]> {
        // Legacy recipes have no approvalStatus and remain published.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const published: any = {
            $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = search
            ? { $and: [published, { title: { $regex: search, $options: "i" } }] }
            : published;
        return (await RecipeModel.find(filter).sort({ createdAt: -1 })).map((recipe) => this.toEntity(recipe));
    }

    async getById(id: string): Promise<Recipe | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const recipe = await RecipeModel.findById(id); return recipe ? this.toEntity(recipe) : null;
    }

    async getAllForAdmin(search: string): Promise<Recipe[]> {
        const filter = search ? { title: { $regex: search, $options: "i" } } : {};
        return (await RecipeModel.find(filter).sort({ createdAt: -1 }))
            .map((recipe) => this.toEntity(recipe));
    }

    async create(recipe: Partial<Recipe>): Promise<Recipe> {
        return this.toEntity(await RecipeModel.create(recipe));
    }

    async update(id: string, recipe: Partial<Recipe>): Promise<Recipe | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const updated = await RecipeModel.findByIdAndUpdate(id, recipe, { new: true }); return updated ? this.toEntity(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.isValidObjectId(id)) return false;
        const deleted = await RecipeModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
