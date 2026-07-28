import { ApplicationError } from "../../exceptions/application-error";
import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";
import { RecipeViewer } from "../../entities/recipe.entity";
import { filterRecipeForViewer } from "./recipePolicy";
import { IReviewRepository } from "../../ports/repositories/review.repository.port";
export class GetRecipeByIdUseCase {
    constructor(
        private readonly repository: IRecipeRepository,
        private readonly reviews: IReviewRepository
    ) {}
    async execute(id: string, viewer?: RecipeViewer) {
        const recipe = await this.repository.getById(id);
        if (!recipe) throw new ApplicationError(404, "Recipe not found");
        const canViewUnpublished =
            viewer?.role === "admin" || (!!viewer && recipe.createdBy === viewer.id);
        if (recipe.approvalStatus !== "approved" && !canViewUnpublished) {
            throw new ApplicationError(404, "Recipe not found");
        }
        return filterRecipeForViewer(
            { ...recipe, rating: await this.reviews.getAverageRating(recipe._id) },
            viewer
        );
    }
}
