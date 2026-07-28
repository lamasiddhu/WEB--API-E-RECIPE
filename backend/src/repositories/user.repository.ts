import mongoose from "mongoose";
import { UserModel, IUser } from "../models/user.model";
import { User } from "../entities/user.entity";
import { IUserRepository, PaginatedUsers } from "../ports/repositories/user.repository.port";

export class UserMongoRepository implements IUserRepository {
    private toEntity(doc: IUser): User {
        return {
            _id: String(doc._id),
            fullName: doc.fullName,
            email: doc.email,
            password: doc.password,
            role: doc.role,
            avatarUrl: doc.avatarUrl,
            phone: doc.phone,
            bio: doc.bio,
            notificationPreferences: {
                email: doc.notificationPreferences.email,
                push: doc.notificationPreferences.push,
                recipeRecommendations: doc.notificationPreferences.recipeRecommendations,
                weeklyDigest: doc.notificationPreferences.weeklyDigest,
            },
            isProfilePublic: doc.isProfilePublic,
            isPro: doc.isPro,
            proRequestPending: doc.proRequestPending,
            passwordResetRequested: doc.passwordResetRequested,
            passwordResetCode: doc.passwordResetCode,
            passwordResetCodeExpiresAt: doc.passwordResetCodeExpiresAt,
            passwordResetAttempts: doc.passwordResetAttempts,
            favoriteRecipeIds: doc.favoriteRecipeIds?.map(String),
            purchasedRecipeIds: doc.purchasedRecipeIds?.map(String),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            version: (doc as IUser & { __v: number }).__v,
        };
    }

    async getUserById(id: string): Promise<User | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const user = await UserModel.findOne({ _id: id });
        return user ? this.toEntity(user) : null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email });
        return user ? this.toEntity(user) : null;
    }

    async createUser(user: Partial<User>): Promise<User> {
        return this.toEntity(await UserModel.create(user as unknown as Partial<IUser>));
    }

    async getAll(): Promise<User[]> {
        return (await UserModel.find()).map((user) => this.toEntity(user));
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

        return { users: users.map((user) => this.toEntity(user)), total };
    }

    async update(id: string, user: Partial<User>): Promise<User | null> {
        const updated = await UserModel.findByIdAndUpdate(id, user as unknown as Partial<IUser>, { new: true });
        return updated ? this.toEntity(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await UserModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async addFavorite(id: string, recipeId: string): Promise<User | null> {
        const updated = await UserModel.findByIdAndUpdate(
            id,
            { $addToSet: { favoriteRecipeIds: new mongoose.Types.ObjectId(recipeId) } },
            { new: true }
        );
        return updated ? this.toEntity(updated) : null;
    }

    async removeFavorite(id: string, recipeId: string): Promise<User | null> {
        const updated = await UserModel.findByIdAndUpdate(
            id,
            { $pull: { favoriteRecipeIds: new mongoose.Types.ObjectId(recipeId) } },
            { new: true }
        );
        return updated ? this.toEntity(updated) : null;
    }

    async grantPurchasedRecipes(id: string, recipeIds: string[]): Promise<User | null> {
        const updated = await UserModel.findByIdAndUpdate(
            id,
            { $addToSet: { purchasedRecipeIds: { $each: recipeIds.map((r) => new mongoose.Types.ObjectId(r)) } } },
            { new: true }
        );
        return updated ? this.toEntity(updated) : null;
    }

    async removePurchasedRecipe(id: string, recipeId: string): Promise<User | null> {
        const updated = await UserModel.findByIdAndUpdate(
            id,
            { $pull: { purchasedRecipeIds: new mongoose.Types.ObjectId(recipeId) } },
            { new: true }
        );
        return updated ? this.toEntity(updated) : null;
    }
}
