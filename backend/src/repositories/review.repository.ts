import mongoose from "mongoose";
import { Review } from "../entities/review.entity";
import { IReview, ReviewModel } from "../models/review.model";
import { IReviewRepository } from "../ports/repositories/review.repository.port";

export class ReviewMongoRepository implements IReviewRepository {
    // Reviews store their own snapshot of userName/userAvatarUrl at creation
    // time, so rendering a review never actually depends on the author's
    // account still existing — userId is only ever the raw stored reference,
    // never populated, since a deleted user would otherwise turn this field
    // into `null` and crash every field read off it.
    private toEntity(doc: IReview): Review {
        return {
            _id: String(doc._id),
            recipeId: String(doc.recipeId),
            recipeTitle: doc.recipeTitle,
            userId: String(doc.userId),
            userName: doc.userName || "User",
            userAvatarUrl: doc.userAvatarUrl,
            rating: doc.rating,
            comment: doc.comment,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            version: (doc as IReview & { __v: number }).__v,
        };
    }

    async findByRecipe(recipeId: string): Promise<Review[]> {
        if (!mongoose.isValidObjectId(recipeId)) return [];
        return (await ReviewModel.find({ recipeId }).sort({ createdAt: -1 }))
            .map((review) => this.toEntity(review));
    }

    async findById(id: string): Promise<Review | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const review = await ReviewModel.findById(id);
        return review ? this.toEntity(review) : null;
    }

    async findAll(): Promise<Review[]> {
        return (await ReviewModel.find().sort({ createdAt: -1 }))
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
