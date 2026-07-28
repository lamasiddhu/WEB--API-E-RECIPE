import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";

export class GetAllRecipesForAdminUseCase {
    constructor(private readonly repository: IRecipeRepository) {}

    execute(search: string) {
        return this.repository.getAllForAdmin(search);
    }
}
