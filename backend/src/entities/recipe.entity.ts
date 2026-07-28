export interface RecipeStep { title: string; description: string; }
export type RecipeApprovalStatus = "pending" | "approved" | "rejected";
export const RECIPE_TAGS = ["Vegan", "Quick Meals", "Gluten-Free", "Low Carb", "Breakfast"] as const;
export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
export interface Recipe {
    _id: string; title: string; description: string; category: string; badge: string; mealType?: string;
    duration: string; chef: string; servings: number; calories: number; protein: number; difficulty: string;
    rating: number; ingredients: string[]; steps: RecipeStep[]; imageUrl?: string; price: number; tags: string[];
    videoUrl?: string; createdBy?: string; approvalStatus: RecipeApprovalStatus;
    createdAt: Date; updatedAt: Date; version: number;
}
export interface RecipeRequester { id: string; role: "admin" | "user"; fullName?: string; }
export interface RecipeViewer extends RecipeRequester { isPro: boolean; purchasedRecipeIds: string[]; }
