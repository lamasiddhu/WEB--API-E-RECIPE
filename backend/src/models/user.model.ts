import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/user.type";

export interface INotificationPreferences {
    email: boolean;
    push: boolean;
    recipeRecommendations: boolean;
    weeklyDigest: boolean;
}

export interface IUser extends UserType, Document {
    password: string;
    email: string;
    role: "admin" | "user";
    avatarUrl?: string;
    phone?: string;
    bio?: string;
    notificationPreferences: INotificationPreferences;
    isProfilePublic: boolean;
    isPro: boolean;
    proRequestPending: boolean;
    favoriteRecipeIds: mongoose.Types.ObjectId[];
    purchasedRecipeIds: mongoose.Types.ObjectId[];
    passwordResetRequested: boolean;
    // can add mongo related attr
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
    {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        recipeRecommendations: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false },
    },
    { _id: false }
);

const UserMongoSchema: Schema = new Schema<IUser>(
    {
        fullName: { type: String, required: true }, // ✅ Single field
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        avatarUrl: { type: String },
        phone: { type: String },
        bio: { type: String },
        notificationPreferences: { type: NotificationPreferencesSchema, default: () => ({}) },
        isProfilePublic: { type: Boolean, default: true },
        isPro: { type: Boolean, default: false },
        proRequestPending: { type: Boolean, default: false },
        favoriteRecipeIds: { type: [Schema.Types.ObjectId], ref: "Recipe", default: [] },
        purchasedRecipeIds: { type: [Schema.Types.ObjectId], ref: "Recipe", default: [] },
        passwordResetRequested: { type: Boolean, default: false },
    },
    { timestamps: true }
)
export const UserModel = mongoose.model<IUser>
(
    "User", // db.users -> Model Name "User"
    UserMongoSchema
);