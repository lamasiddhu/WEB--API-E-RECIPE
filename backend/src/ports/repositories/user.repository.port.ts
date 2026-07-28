import { User } from "../../entities/user.entity";

export interface PaginatedUsers {
    users: User[];
    total: number;
}

export interface IUserRepository {
    getUserByEmail(email: string): Promise<User | null>;
    createUser(user: Partial<User>): Promise<User>;
    getUserById(id: string): Promise<User | null>;
    getAll(): Promise<User[]>;
    getAllPaginated(page: number, limit: number, search: string): Promise<PaginatedUsers>;
    update(id: string, user: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
    addFavorite(id: string, recipeId: string): Promise<User | null>;
    removeFavorite(id: string, recipeId: string): Promise<User | null>;
    grantPurchasedRecipes(id: string, recipeIds: string[]): Promise<User | null>;
    removePurchasedRecipe(id: string, recipeId: string): Promise<User | null>;
}
