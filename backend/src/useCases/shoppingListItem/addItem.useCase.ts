import { AddShoppingListItemInput } from "../inputs";
import { ApplicationError } from "../../exceptions/application-error";
import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";
import { IShoppingListItemRepository } from "../../ports/repositories/shoppingListItem.repository.port";
import { ShoppingListRequester } from "../../entities/shoppingListItem.entity";
export class AddShoppingListItemUseCase {
    constructor(private readonly repository: IShoppingListItemRepository, private readonly recipes: IRecipeRepository) {}
    async execute(userId: string, data: AddShoppingListItemInput, requester: ShoppingListRequester) {
        const recipe = await this.recipes.getById(data.recipeId);
        if (!recipe) throw new ApplicationError(404, "Recipe not found");
        if (recipe.badge === "Pro" && requester.role !== "admin" && !requester.isPro)
            throw new ApplicationError(403, "This recipe requires Pro access before it can be purchased.");
        const existing = await this.repository.findByUserAndRecipe(userId, data.recipeId);
        if (existing) return (await this.repository.updateQuantity(existing._id, userId, existing.quantity + 1))!;
        return this.repository.create({ title: data.title, imageUrl: data.imageUrl, price: recipe.price || 0, recipeId: data.recipeId, userId });
    }
}
