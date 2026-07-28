export interface FoodProfile {
    _id: string;
    userId: string;
    dietaryPreference: "none" | "vegetarian" | "vegan" | "halal" | "kosher" | "gluten_free";
    allergies: string[];
    spiceLevel: "mild" | "medium" | "spicy" | "extra_spicy";
    cookingSkill: "beginner" | "intermediate" | "advanced" | "professional";
    mealsPerWeek: number;
    preferredCuisine: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
