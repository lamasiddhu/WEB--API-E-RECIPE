import mongoose, { Schema, Document } from "mongoose";

export interface IRecipeStep {
    title: string;
    description: string;
}

export const RECIPE_TAGS = ["Vegan", "Quick Meals", "Gluten-Free", "Low Carb", "Breakfast"] as const;

export interface IRecipe extends Document {
    title: string;
    description: string;
    category: string;
    badge: string;
    duration: string;
    chef: string;
    servings: number;
    calories: number;
    protein: number;
    difficulty: string;
    rating: number;
    ingredients: string[];
    steps: IRecipeStep[];
    imageUrl?: string;
    price: number;
    tags: string[];
    // YouTube video walkthrough — only ever set for Normal/Pro recipes, and
    // only ever sent to entitled viewers (see RecipeService.filterForViewer).
    videoUrl?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RecipeStepSchema = new Schema<IRecipeStep>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
    },
    { _id: false }
);

const RecipeSchema: Schema = new Schema<IRecipe>(
    {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        category: { type: String, default: "Uncategorized" },
        badge: { type: String, enum: ["Free", "Normal", "Pro"], default: "Free" },
        duration: { type: String, default: "30 min" },
        chef: { type: String, default: "" },
        servings: { type: Number, default: 4 },
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        difficulty: { type: String, default: "Intermediate" },
        rating: { type: Number, default: 0 },
        ingredients: { type: [String], default: [] },
        steps: { type: [RecipeStepSchema], default: [] },
        imageUrl: { type: String },
        price: { type: Number, default: 0, min: 0 },
        tags: { type: [String], enum: RECIPE_TAGS, default: [] },
        videoUrl: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const RecipeModel = mongoose.model<IRecipe>("Recipe", RecipeSchema);
