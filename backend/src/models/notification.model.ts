import mongoose, { Schema, Document } from "mongoose";

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

export interface INotification extends Document {
    audience: NotificationAudience;
    recipientId?: mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    relatedUserId?: mongoose.Types.ObjectId;
    relatedUserName?: string;
    relatedRecipeId?: mongoose.Types.ObjectId;
    relatedRecipeTitle?: string;
    imageUrl?: string;
    senderName?: string;
    status?: NotificationStatus;
    isRead: boolean;
    // Broadcast notifications (audience "all") are a single shared document —
    // per-user read/dismiss state can't live on `isRead` without affecting
    // every other recipient, so it's tracked separately for those only.
    readBy: mongoose.Types.ObjectId[];
    dismissedBy: mongoose.Types.ObjectId[];
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
    {
        audience: { type: String, enum: ["admin", "user", "all"], required: true },
        recipientId: { type: Schema.Types.ObjectId, ref: "User" },
        type: {
            type: String,
            enum: [
                "pro_request",
                "pro_approved",
                "pro_rejected",
                "announcement",
                "order_cancelled",
                "order_accepted",
                "password_reset_requested",
                "welcome",
                "new_recipe",
                "recipe_submission",
                "recipe_approved",
                "recipe_rejected",
                "personal_message",
            ],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        relatedUserId: { type: Schema.Types.ObjectId, ref: "User" },
        relatedUserName: { type: String },
        relatedRecipeId: { type: Schema.Types.ObjectId, ref: "Recipe" },
        relatedRecipeTitle: { type: String },
        imageUrl: { type: String },
        senderName: { type: String, default: "E-RECIPE" },
        status: { type: String, enum: ["pending", "approved", "rejected"] },
        isRead: { type: Boolean, default: false },
        readBy: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
        dismissedBy: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    },
    { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
