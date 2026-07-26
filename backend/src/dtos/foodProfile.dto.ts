import { z } from "zod";

export const FoodProfileDTO = z.object({
    dietaryPreference: z.enum(["none", "vegetarian", "vegan", "halal", "kosher", "gluten_free"]),
    allergies: z.array(z.string()).default([]),
    spiceLevel: z.enum(["mild", "medium", "spicy", "extra_spicy"]),
    cookingSkill: z.enum(["beginner", "intermediate", "advanced", "professional"]),
    mealsPerWeek: z.number().int().min(0).max(21),
    preferredCuisine: z.string().optional(),
});
export type FoodProfileDTO = z.infer<typeof FoodProfileDTO>;
