import { ApplicationError } from "../../exceptions/application-error";
import { IShoppingListItemRepository } from "../../ports/repositories/shoppingListItem.repository.port";
export class RemoveShoppingListItemUseCase {
    constructor(private readonly repository: IShoppingListItemRepository) {}
    async execute(userId: string, itemId: string) {
        if (!(await this.repository.delete(itemId, userId))) throw new ApplicationError(404, "Shopping list item not found");
        return true;
    }
}
