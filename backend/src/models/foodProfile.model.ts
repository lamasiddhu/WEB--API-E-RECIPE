import mongoose, { Schema, Document } from "mongoose";

export interface IFoodProfile extends Document {
    userId: mongoose.Types.ObjectId;
    dietaryPreference: "none" | "vegetarian" | "vegan" | "halal" | "kosher" | "gluten_free";
    allergies: string[];
    spiceLevel: "mild" | "medium" | "spicy" | "extra_spicy";
    cookingSkill: "beginner" | "intermediate" | "advanced" | "professional";
    mealsPerWeek: number;
    preferredCuisine: string;
    createdAt: Date;
    updatedAt: Date;
}

const FoodProfileSchema: Schema = new Schema<IFoodProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        dietaryPreference: {
            type: String,
            enum: ["none", "vegetarian", "vegan", "halal", "kosher", "gluten_free"],
            default: "none",
        },
        allergies: { type: [String], default: [] },
        spiceLevel: {
            type: String,
            enum: ["mild", "medium", "spicy", "extra_spicy"],
            default: "medium",
        },
        cookingSkill: {
            type: String,
            enum: ["beginner", "intermediate", "advanced", "professional"],
            default: "intermediate",
        },
        mealsPerWeek: { type: Number, default: 5 },
        preferredCuisine: { type: String, default: "" },
    },
    { timestamps: true }
);

export const FoodProfileModel = mongoose.model<IFoodProfile>("FoodProfile", FoodProfileSchema);
