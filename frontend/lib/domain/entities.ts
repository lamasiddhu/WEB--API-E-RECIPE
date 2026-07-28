export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    recipeRecommendations: boolean;
    weeklyDigest: boolean;
}

export interface User {
    _id: string;
    email: string;
    role: "admin" | "user";
    fullName: string;
    avatarUrl?: string;
    phone?: string;
    bio?: string;
    createdAt?: string;
    isProfilePublic?: boolean;
    isPro?: boolean;
    proRequestPending?: boolean;
    favoriteRecipeIds?: string[];
    purchasedRecipeIds?: string[];
    notificationPreferences?: NotificationPreferences;
}

export interface AdminUser extends Omit<User, "createdAt"> {
    createdAt: string;
}

export interface Recipe {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    badge?: string;
    mealType?: string;
    duration?: string;
    chef?: string;
    servings?: number;
    calories?: number;
    protein?: number;
    difficulty?: string;
    rating?: number;
    ingredients?: string[];
    steps?: { title: string; description: string }[];
    imageUrl?: string;
    price?: number;
    tags?: string[];
    videoUrl?: string;
    createdBy?: string;
    approvalStatus?: "pending" | "approved" | "rejected";
}

export interface OrderItem {
    recipeId: string;
    title: string;
    quantity: number;
    unitPrice: number;
}

export interface Order {
    _id: string;
    orderNumber: string;
    customer: string;
    item: string;
    items?: OrderItem[];
    price?: number;
    status: "Processing" | "Completed" | "Delayed" | "Cancelled";
    createdAt?: string;
    cancelReason?: string;
    format?: "digital" | "physical";
}

export interface ShoppingListItem {
    _id: string;
    recipeId: string;
    title: string;
    imageUrl?: string;
    price?: number;
    quantity: number;
}

export interface Notification {
    _id: string;
    audience: "admin" | "user" | "all";
    recipientId?: string;
    type:
        | "pro_request" | "pro_approved" | "pro_rejected" | "announcement"
        | "order_cancelled" | "order_accepted" | "password_reset_requested" | "welcome"
        | "new_recipe" | "recipe_submission" | "recipe_approved" | "recipe_rejected"
        | "personal_message";
    title: string;
    message: string;
    relatedUserId?: string;
    relatedUserName?: string;
    relatedRecipeId?: string;
    relatedRecipeTitle?: string;
    imageUrl?: string;
    senderName?: string;
    status?: "pending" | "approved" | "rejected";
    isRead: boolean;
    createdAt: string;
}

export interface AppSettings {
    maintenanceMode: boolean;
    cacheLastClearedAt?: string;
}

export interface AiRecipeCard {
    _id: string;
    title: string;
    imageUrl?: string;
    badge?: string;
    duration?: string;
    difficulty?: string;
    price?: number;
    rating?: number;
    category?: string;
}

export interface Review {
    _id: string;
    recipeId: string;
    recipeTitle: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}
