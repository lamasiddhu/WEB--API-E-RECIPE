import mongoose from "mongoose";
import { ShoppingListItemModel, IShoppingListItem } from "../models/shoppingListItem.model";
import { ShoppingListItem } from "../entities/shoppingListItem.entity";
import { IShoppingListItemRepository } from "../ports/repositories/shoppingListItem.repository.port";

export class ShoppingListItemMongoRepository implements IShoppingListItemRepository {
    private toEntity(doc: IShoppingListItem): ShoppingListItem {
        return {
            _id: String(doc._id), userId: String(doc.userId), recipeId: String(doc.recipeId),
            title: doc.title, imageUrl: doc.imageUrl, price: doc.price, quantity: doc.quantity,
            createdAt: doc.createdAt, updatedAt: doc.updatedAt,
            version: (doc as IShoppingListItem & { __v: number }).__v,
        };
    }

    async getAllForUser(userId: string): Promise<ShoppingListItem[]> {
        return (await ShoppingListItemModel.find({ userId }).sort({ createdAt: -1 })).map((item) => this.toEntity(item));
    }

    async findByUserAndRecipe(userId: string, recipeId: string): Promise<ShoppingListItem | null> {
        if (!mongoose.isValidObjectId(recipeId)) return null;
        const item = await ShoppingListItemModel.findOne({ userId, recipeId });
        return item ? this.toEntity(item) : null;
    }

    async create(item: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
        return this.toEntity(await ShoppingListItemModel.create(item));
    }

    async updateQuantity(id: string, userId: string, quantity: number): Promise<ShoppingListItem | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const item = await ShoppingListItemModel.findOneAndUpdate({ _id: id, userId }, { quantity }, { new: true });
        return item ? this.toEntity(item) : null;
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
