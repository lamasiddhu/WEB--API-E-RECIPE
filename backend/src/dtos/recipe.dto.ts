import { z } from "zod";
import { RECIPE_TAGS } from "../models/recipe.model";

const RecipeStepDTO = z.object({
    title: z.string().min(1, "Step title is required"),
    description: z.string().min(1, "Step description is required"),
});

export const CreateRecipeDTO = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    category: z.string().optional(),
    badge: z.enum(["Free", "Normal", "Pro"]).optional(),
    duration: z.string().optional(),
    chef: z.string().optional(),
    servings: z.number().int().positive().optional(),
    calories: z.number().nonnegative().optional(),
    protein: z.number().nonnegative().optional(),
    difficulty: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    ingredients: z.array(z.string()).optional(),
    steps: z.array(RecipeStepDTO).optional(),
    imageUrl: z.string().optional(),
    price: z.number().nonnegative().optional(),
    tags: z.array(z.enum(RECIPE_TAGS)).optional(),
});
export type CreateRecipeDTO = z.infer<typeof CreateRecipeDTO>;

export const UpdateRecipeDTO = CreateRecipeDTO.partial();
export type UpdateRecipeDTO = z.infer<typeof UpdateRecipeDTO>;
