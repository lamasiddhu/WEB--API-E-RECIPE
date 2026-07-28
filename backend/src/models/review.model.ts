import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
    _id: mongoose.Types.ObjectId;
    recipeId: mongoose.Types.ObjectId;
    recipeTitle: string;
    userId: mongoose.Types.ObjectId;
    userName: string;
    userAvatarUrl?: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        recipeId: { type: Schema.Types.ObjectId, ref: "Recipe", required: true, index: true },
        recipeTitle: { type: String, required: true, trim: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        userName: { type: String, required: true, trim: true },
        userAvatarUrl: { type: String },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true, maxlength: 1000 },
    },
    { timestamps: true }
);

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
