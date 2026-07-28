import { IShoppingListItemRepository } from "../../ports/repositories/shoppingListItem.repository.port";
export class GetMyShoppingListUseCase {
    constructor(private readonly repository: IShoppingListItemRepository) {}
    execute(userId: string) { return this.repository.getAllForUser(userId); }
}
