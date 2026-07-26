import mongoose, { Schema, Document } from "mongoose";

export interface IShoppingListItem extends Document {
    userId: mongoose.Types.ObjectId;
    recipeId: mongoose.Types.ObjectId;
    title: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

const ShoppingListItemSchema: Schema = new Schema<IShoppingListItem>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        recipeId: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
        title: { type: String, required: true },
        imageUrl: { type: String },
        price: { type: Number, default: 0, min: 0 },
        quantity: { type: Number, default: 1, min: 1 },
    },
    { timestamps: true }
);

export const ShoppingListItemModel = mongoose.model<IShoppingListItem>(
    "ShoppingListItem",
    ShoppingListItemSchema
);
