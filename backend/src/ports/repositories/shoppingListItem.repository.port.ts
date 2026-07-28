import { ShoppingListItem } from "../../entities/shoppingListItem.entity";

export interface IShoppingListItemRepository {
    getAllForUser(userId: string): Promise<ShoppingListItem[]>;
    findByUserAndRecipe(userId: string, recipeId: string): Promise<ShoppingListItem | null>;
    create(item: Partial<ShoppingListItem>): Promise<ShoppingListItem>;
    updateQuantity(id: string, userId: string, quantity: number): Promise<ShoppingListItem | null>;
    delete(id: string, userId: string): Promise<boolean>;
    deleteAllForUser(userId: string): Promise<void>;
}
