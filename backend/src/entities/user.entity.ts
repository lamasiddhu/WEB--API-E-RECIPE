export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    recipeRecommendations: boolean;
    weeklyDigest: boolean;
}

export interface User {
    _id: string;
    fullName: string;
    email: string;
    password?: string;
    role: "user" | "admin";
    avatarUrl?: string;
    phone?: string;
    bio?: string;
    notificationPreferences: NotificationPreferences;
    isProfilePublic: boolean;
    isPro: boolean;
    proRequestPending: boolean;
    passwordResetRequested?: boolean;
    passwordResetCode?: string | null;
    passwordResetCodeExpiresAt?: Date | null;
    passwordResetAttempts: number;
    favoriteRecipeIds?: string[];
    purchasedRecipeIds?: string[];
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
