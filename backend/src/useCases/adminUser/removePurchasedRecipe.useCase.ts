import { ApplicationError } from "../../exceptions/application-error";
import { IUserRepository } from "../../ports/repositories/user.repository.port";
import { stripPassword } from "./stripPassword";

export class RemovePurchasedRecipeUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string, recipeId: string) {
        const updated = await this.userRepository.removePurchasedRecipe(userId, recipeId);
        if (!updated) throw new ApplicationError(404, "User not found");
        return stripPassword(updated);
    }
}
