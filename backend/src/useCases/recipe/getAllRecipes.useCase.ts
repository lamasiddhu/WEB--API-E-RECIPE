import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";
import { RecipeViewer } from "../../entities/recipe.entity";
import { IRecipeCache } from "../../ports/recipeCache.port";
import { filterRecipeForViewer } from "./recipePolicy";
import { IReviewRepository } from "../../ports/repositories/review.repository.port";
export class GetAllRecipesUseCase {
    constructor(
        private readonly repository: IRecipeRepository,
        private readonly cache: IRecipeCache,
        private readonly reviews: IReviewRepository
    ) {}
    async execute(search: string, viewer?: RecipeViewer) {
        // Only the unfiltered browse list is cached; viewer filtering always happens afterward.
        let recipes = search ? await this.repository.getAll(search) : this.cache.get();
        if (!recipes) { recipes = await this.repository.getAll(search); this.cache.set(recipes); }
        return Promise.all(recipes.map(async (recipe) =>
            filterRecipeForViewer(
                { ...recipe, rating: await this.reviews.getAverageRating(recipe._id) },
                viewer
            )
        ));
    }
}
