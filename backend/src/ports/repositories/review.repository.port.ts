import { Review } from "../../entities/review.entity";

export interface IReviewRepository {
    findByRecipe(recipeId: string): Promise<Review[]>;
    findById(id: string): Promise<Review | null>;
    findAll(): Promise<Review[]>;
    getAverageRating(recipeId: string): Promise<number>;
    create(data: Partial<Review>): Promise<Review>;
    update(id: string, data: Pick<Review, "rating" | "comment">): Promise<Review | null>;
    delete(id: string): Promise<boolean>;
}
