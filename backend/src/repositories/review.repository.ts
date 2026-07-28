import mongoose from "mongoose";
import { Review } from "../entities/review.entity";
import { IReview, ReviewModel } from "../models/review.model";
import { IReviewRepository } from "../ports/repositories/review.repository.port";

export class ReviewMongoRepository implements IReviewRepository {
    private toEntity(doc: IReview): Review {
        const populatedUser = doc.userId as unknown as {
            _id?: mongoose.Types.ObjectId;
            avatarUrl?: string;
            fullName?: string;
        };
        return {
            _id: String(doc._id),
            recipeId: String(doc.recipeId),
            recipeTitle: doc.recipeTitle,
            userId: String(populatedUser._id || doc.userId),
            userName: doc.userName || populatedUser.fullName || "User",
            userAvatarUrl: doc.userAvatarUrl || populatedUser.avatarUrl,
            rating: doc.rating,
            comment: doc.comment,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            version: (doc as IReview & { __v: number }).__v,
        };
    }

    async findByRecipe(recipeId: string): Promise<Review[]> {
        if (!mongoose.isValidObjectId(recipeId)) return [];
        return (await ReviewModel.find({ recipeId }).populate("userId", "fullName avatarUrl").sort({ createdAt: -1 }))
            .map((review) => this.toEntity(review));
    }

    async findById(id: string): Promise<Review | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const review = await ReviewModel.findById(id);
        return review ? this.toEntity(review) : null;
    }

    async findAll(): Promise<Review[]> {
        return (await ReviewModel.find().populate("userId", "fullName avatarUrl").sort({ createdAt: -1 }))
            .map((review) => this.toEntity(review));
    }

    async getAverageRating(recipeId: string): Promise<number> {
        if (!mongoose.isValidObjectId(recipeId)) return 0;
        const [result] = await ReviewModel.aggregate<{ average: number }>([
            { $match: { recipeId: new mongoose.Types.ObjectId(recipeId) } },
            { $group: { _id: null, average: { $avg: "$rating" } } },
        ]);
        return result ? Math.round(result.average * 10) / 10 : 0;
    }

    async create(data: Partial<Review>): Promise<Review> {
        return this.toEntity(await ReviewModel.create(data));
    }

    async update(id: string, data: Pick<Review, "rating" | "comment">): Promise<Review | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const updated = await ReviewModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
        return updated ? this.toEntity(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.isValidObjectId(id)) return false;
        return Boolean(await ReviewModel.findByIdAndDelete(id));
    }
}
