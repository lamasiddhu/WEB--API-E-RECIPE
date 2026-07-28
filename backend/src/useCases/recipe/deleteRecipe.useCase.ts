import { ApplicationError } from "../../exceptions/application-error";
import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";
import { RecipeRequester } from "../../entities/recipe.entity";
import { IRecipeCache } from "../../ports/recipeCache.port";
import { assertCanModify } from "./recipePolicy";
export class DeleteRecipeUseCase {
    constructor(
        private readonly repository: IRecipeRepository,
        private readonly cache: IRecipeCache
    ) {}
    async execute(id: string, requester: RecipeRequester) {
        await assertCanModify(this.repository, id, requester);
        if (!(await this.repository.delete(id))) throw new ApplicationError(404, "Recipe not found");
        this.cache.invalidate(); return true;
    }
}
