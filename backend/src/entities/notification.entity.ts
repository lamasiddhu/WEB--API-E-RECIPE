export type NotificationAudience = "admin" | "user" | "all";
export type NotificationType =
    | "pro_request"
    | "pro_approved"
    | "pro_rejected"
    | "announcement"
    | "order_cancelled"
    | "order_accepted"
    | "password_reset_requested"
    | "welcome"
    | "new_recipe"
    | "recipe_submission"
    | "recipe_approved"
    | "recipe_rejected"
    | "personal_message";
export type NotificationStatus = "pending" | "approved" | "rejected";

export interface Notification {
    _id: string;
    audience: NotificationAudience;
    recipientId?: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedUserId?: string;
    relatedUserName?: string;
    relatedRecipeId?: string;
    relatedRecipeTitle?: string;
    imageUrl?: string;
    senderName?: string;
    status?: NotificationStatus;
    isRead: boolean;
    readBy: string[];
    dismissedBy: string[];
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
