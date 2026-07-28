import { UpdateRecipeInput } from "../inputs";
import { ApplicationError } from "../../exceptions/application-error";
import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";
import { RecipeRequester } from "../../entities/recipe.entity";
import { IRecipeCache } from "../../ports/recipeCache.port";
import { assertCanModify, stripVideoIfFree } from "./recipePolicy";
export class UpdateRecipeUseCase {
    constructor(
        private readonly repository: IRecipeRepository,
        private readonly cache: IRecipeCache
    ) {}
    async execute(id: string, data: UpdateRecipeInput, requester: RecipeRequester) {
        await assertCanModify(this.repository, id, requester);
        const updated = await this.repository.update(id, stripVideoIfFree(data));
        if (!updated) throw new ApplicationError(404, "Recipe not found");
        this.cache.invalidate(); return updated;
    }
}
