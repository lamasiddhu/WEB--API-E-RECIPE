import { FoodProfile } from "../entities/foodProfile.entity";
import { OrderFormat, OrderItem, OrderStatus } from "../entities/order.entity";
import { Recipe } from "../entities/recipe.entity";
import { NotificationPreferences } from "../entities/user.entity";

export interface CreateUserInput {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginUserInput {
    email: string;
    password: string;
}

export interface AdminCreateUserInput extends CreateUserInput {
    role?: "admin" | "user";
}

export interface AdminUpdateUserInput {
    fullName?: string;
    email?: string;
    role?: "admin" | "user";
    isPro?: boolean;
}

export interface UpdatePasswordInput {
    password: string;
}

export interface UpdateMeInput {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    phone?: string;
    bio?: string;
    isProfilePublic?: boolean;
    notificationPreferences?: Partial<NotificationPreferences>;
}

export interface ChangeMyPasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface SetNewPasswordInput {
    newPassword: string;
}

export interface GoogleLoginInput {
    idToken: string;
}

export interface RequestPasswordResetCodeInput {
    email: string;
}

export interface VerifyResetCodeInput {
    email: string;
    code: string;
}

export interface ResetPasswordWithCodeInput extends VerifyResetCodeInput {
    newPassword: string;
}

export type SaveFoodProfileInput = Pick<
    FoodProfile,
    "dietaryPreference" | "allergies" | "spiceLevel" | "cookingSkill" | "mealsPerWeek"
> & { preferredCuisine?: string };

export interface CreateOrderInput {
    orderNumber?: string;
    customer: string;
    item: string;
    items?: OrderItem[];
    price?: number;
    status?: OrderStatus;
    format?: OrderFormat;
    recipeIds?: string[];
}

export type CreateRecipeInput = Partial<Omit<Recipe, "_id" | "createdAt" | "updatedAt" | "version">> & {
    title: string;
};

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

export interface AddShoppingListItemInput {
    recipeId: string;
    title: string;
    imageUrl?: string;
}
