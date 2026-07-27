import { z } from "zod";

// E-Recipe Registration DTO. Public self-registration can never set a role —
// admin accounts are only created via AdminCreateUserDTO by an existing admin.
export const CreateUserDTO = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export type UserType = {
    fullName: string;
    email: string;
    password: string;
    role?: "admin" | "user";
};

// FIXED: Login DTO now expects email and password
export const LoginUserDTO = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

// Admin: create a user directly, optionally assigning a role
export const AdminCreateUserDTO = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["admin", "user"]).optional(),
});
export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

// Admin: partial update of a user's profile fields
export const AdminUpdateUserDTO = z.object({
    fullName: z.string().min(1).optional(),
    email: z.string().email("Invalid email address").optional(),
    role: z.enum(["admin", "user"]).optional(),
    isPro: z.boolean().optional(),
});
export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;

// Admin: reset a user's password
export const UpdatePasswordDTO = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordDTO>;

// Self-service: update your own profile. isPro/role are deliberately excluded —
// Pro access is granted only via the admin-approved pro_request flow, never
// self-service, so a user can never grant themselves Pro through this endpoint.
export const UpdateMeDTO = z.object({
    fullName: z.string().min(1).optional(),
    email: z.string().email("Invalid email address").optional(),
    avatarUrl: z.string().optional(),
    phone: z.string().optional(),
    bio: z.string().max(280, "Bio must be 280 characters or fewer").optional(),
    isProfilePublic: z.boolean().optional(),
    notificationPreferences: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        recipeRecommendations: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
    }).partial().optional(),
});
export type UpdateMeDTO = z.infer<typeof UpdateMeDTO>;

// Self-service: change your own password (requires proving you know the current one)
export const ChangeMyPasswordDTO = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});
export type ChangeMyPasswordDTO = z.infer<typeof ChangeMyPasswordDTO>;

// Self-service: set a new password after an admin-triggered reset request —
// does not require the old password, but only works while a reset is pending.
export const SetNewPasswordDTO = z.object({
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});
export type SetNewPasswordDTO = z.infer<typeof SetNewPasswordDTO>;

// Sign in (or auto-register) with a verified Google ID token from the frontend.
export const GoogleLoginDTO = z.object({
    idToken: z.string().min(1, "Google ID token is required"),
});
export type GoogleLoginDTO = z.infer<typeof GoogleLoginDTO>;

// Public "forgot password" flow: request a 6-digit code emailed to the account.
export const RequestPasswordResetCodeDTO = z.object({
    email: z.string().email("Invalid email address"),
});
export type RequestPasswordResetCodeDTO = z.infer<typeof RequestPasswordResetCodeDTO>;

export const VerifyResetCodeDTO = z.object({
    email: z.string().email("Invalid email address"),
    code: z.string().length(6, "Code must be 6 digits"),
});
export type VerifyResetCodeDTO = z.infer<typeof VerifyResetCodeDTO>;

export const ResetPasswordWithCodeDTO = z.object({
    email: z.string().email("Invalid email address"),
    code: z.string().length(6, "Code must be 6 digits"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});
export type ResetPasswordWithCodeDTO = z.infer<typeof ResetPasswordWithCodeDTO>;
