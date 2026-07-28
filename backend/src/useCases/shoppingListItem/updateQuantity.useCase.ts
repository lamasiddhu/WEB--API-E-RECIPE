import { ApplicationError } from "../../exceptions/application-error";
import { IShoppingListItemRepository } from "../../ports/repositories/shoppingListItem.repository.port";
export class UpdateShoppingListQuantityUseCase {
    constructor(private readonly repository: IShoppingListItemRepository) {}
    async execute(userId: string, itemId: string, quantity: number) {
        const updated = await this.repository.updateQuantity(itemId, userId, quantity);
        if (!updated) throw new ApplicationError(404, "Shopping list item not found");
        return updated;
    }
}
