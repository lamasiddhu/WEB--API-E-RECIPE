import mongoose from "mongoose";
import { UserModel, IUser } from "../models/user.model";

export interface PaginatedUsers {
    users: IUser[];
    total: number;
}

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    createUser(user: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAll(): Promise<IUser[]>;
    getAllPaginated(page: number, limit: number, search: string): Promise<PaginatedUsers>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
    addFavorite(id: string, recipeId: string): Promise<IUser | null>;
    removeFavorite(id: string, recipeId: string): Promise<IUser | null>;
    grantPurchasedRecipes(id: string, recipeIds: string[]): Promise<IUser | null>;
    removePurchasedRecipe(id: string, recipeId: string): Promise<IUser | null>;
}

export class UserMongoRepository implements IUserRepository {
    async getUserById(id: string): Promise<IUser | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await UserModel.findOne({ _id: id });
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email });
    }

    async createUser(user: Partial<IUser>): Promise<IUser> {
        return await UserModel.create(user);
    }

    async getAll(): Promise<IUser[]> {
        return await UserModel.find();
    }

    async getAllPaginated(page: number, limit: number, search: string): Promise<PaginatedUsers> {
        const filter = search
            ? {
                $or: [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            UserModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            UserModel.countDocuments(filter),
        ]);

        return { users, total };
    }

    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, user, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await UserModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async addFavorite(id: string, recipeId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            id,
            { $addToSet: { favoriteRecipeIds: new mongoose.Types.ObjectId(recipeId) } },
            { new: true }
        );
    }

    async removeFavorite(id: string, recipeId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            id,
            { $pull: { favoriteRecipeIds: new mongoose.Types.ObjectId(recipeId) } },
            { new: true }
        );
    }

    async grantPurchasedRecipes(id: string, recipeIds: string[]): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            id,
            { $addToSet: { purchasedRecipeIds: { $each: recipeIds.map((r) => new mongoose.Types.ObjectId(r)) } } },
            { new: true }
        );
    }

    async removePurchasedRecipe(id: string, recipeId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            id,
            { $pull: { purchasedRecipeIds: new mongoose.Types.ObjectId(recipeId) } },
            { new: true }
        );
    }
}
