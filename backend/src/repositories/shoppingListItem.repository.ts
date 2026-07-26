import mongoose from "mongoose";
import { ShoppingListItemModel, IShoppingListItem } from "../models/shoppingListItem.model";

export interface IShoppingListItemRepository {
    getAllForUser(userId: string): Promise<IShoppingListItem[]>;
    findByUserAndRecipe(userId: string, recipeId: string): Promise<IShoppingListItem | null>;
    create(item: Partial<IShoppingListItem>): Promise<IShoppingListItem>;
    updateQuantity(id: string, userId: string, quantity: number): Promise<IShoppingListItem | null>;
    delete(id: string, userId: string): Promise<boolean>;
    deleteAllForUser(userId: string): Promise<void>;
}

export class ShoppingListItemMongoRepository implements IShoppingListItemRepository {
    async getAllForUser(userId: string): Promise<IShoppingListItem[]> {
        return await ShoppingListItemModel.find({ userId }).sort({ createdAt: -1 });
    }

    async findByUserAndRecipe(userId: string, recipeId: string): Promise<IShoppingListItem | null> {
        if (!mongoose.isValidObjectId(recipeId)) return null;
        return await ShoppingListItemModel.findOne({ userId, recipeId });
    }

    async create(item: Partial<IShoppingListItem>): Promise<IShoppingListItem> {
        return await ShoppingListItemModel.create(item);
    }

    async updateQuantity(id: string, userId: string, quantity: number): Promise<IShoppingListItem | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await ShoppingListItemModel.findOneAndUpdate({ _id: id, userId }, { quantity }, { new: true });
    }

    async delete(id: string, userId: string): Promise<boolean> {
        if (!mongoose.isValidObjectId(id)) return false;
        const deleted = await ShoppingListItemModel.findOneAndDelete({ _id: id, userId });
        return !!deleted;
    }

    async deleteAllForUser(userId: string): Promise<void> {
        await ShoppingListItemModel.deleteMany({ userId });
    }
}
