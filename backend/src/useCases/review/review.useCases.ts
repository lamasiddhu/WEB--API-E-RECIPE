import { ApplicationError } from "../../exceptions/application-error";
import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";
import { IReviewRepository } from "../../ports/repositories/review.repository.port";
import { IRecipeCache } from "../../ports/recipeCache.port";

export interface ReviewAuthor {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: "admin" | "user";
    isPro: boolean;
    purchasedRecipeIds: string[];
}

export class GetRecipeReviewsUseCase {
    constructor(private readonly reviews: IReviewRepository) {}
    execute(recipeId: string) { return this.reviews.findByRecipe(recipeId); }
}

export class CreateReviewUseCase {
    constructor(
        private readonly reviews: IReviewRepository,
        private readonly recipes: IRecipeRepository,
        private readonly cache: IRecipeCache
    ) {}

    async execute(recipeId: string, data: { rating: number; comment: string }, author: ReviewAuthor) {
        const recipe = await this.recipes.getById(recipeId);
        if (!recipe) throw new ApplicationError(404, "Recipe not found");

        const badge = recipe.badge || "Free";
        const canReview = badge === "Free" ||
            author.role === "admin" ||
            (!!recipe.createdBy && recipe.createdBy === author.id) ||
            (badge === "Normal" && author.purchasedRecipeIds.includes(recipeId)) ||
            (badge === "Pro" && author.isPro && author.purchasedRecipeIds.includes(recipeId));
        if (!canReview) throw new ApplicationError(403, "Purchase this recipe before leaving a review");

        const review = await this.reviews.create({
            recipeId,
            recipeTitle: recipe.title,
            userId: author.id,
            userName: author.fullName,
            userAvatarUrl: author.avatarUrl,
            rating: data.rating,
            comment: data.comment,
        });
        await this.recipes.update(recipeId, { rating: await this.reviews.getAverageRating(recipeId) });
        this.cache.invalidate();
        return review;
    }
}

export class GetAllReviewsUseCase {
    constructor(private readonly reviews: IReviewRepository) {}
    execute() { return this.reviews.findAll(); }
}

export class UpdateReviewUseCase {
    constructor(
        private readonly reviews: IReviewRepository,
        private readonly recipes: IRecipeRepository,
        private readonly cache: IRecipeCache
    ) {}
    async execute(id: string, data: { rating: number; comment: string }) {
        const review = await this.reviews.update(id, data);
        if (!review) throw new ApplicationError(404, "Review not found");
        await this.recipes.update(review.recipeId, { rating: await this.reviews.getAverageRating(review.recipeId) });
        this.cache.invalidate();
        return review;
    }
}

export class DeleteReviewUseCase {
    constructor(
        private readonly reviews: IReviewRepository,
        private readonly recipes: IRecipeRepository,
        private readonly cache: IRecipeCache
    ) {}
    async execute(id: string) {
        const review = await this.reviews.findById(id);
        if (!review) throw new ApplicationError(404, "Review not found");
        if (!(await this.reviews.delete(id))) throw new ApplicationError(404, "Review not found");
        await this.recipes.update(review.recipeId, { rating: await this.reviews.getAverageRating(review.recipeId) });
        this.cache.invalidate();
    }
}
