import { UserMongoRepository } from "../repositories/user.repository";
import {
    CreateUserDTO,
    LoginUserDTO,
    UpdateMeDTO,
    ChangeMyPasswordDTO,
    SetNewPasswordDTO,
    RequestPasswordResetCodeDTO,
    VerifyResetCodeDTO,
    ResetPasswordWithCodeDTO,
    GoogleLoginDTO,
} from "../dtos/user.dto";
import { IUser, INotificationPreferences } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import * as bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { SECRET_KEY, GOOGLE_CLIENT_ID } from "../configs/constant";
import { AppSettingsService } from "./appSettings.service";
import { sendPasswordResetCodeEmail } from "../utils/mailer.util";

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const userRepository = new UserMongoRepository();
const appSettingsService = new AppSettingsService();

export class UserService {
    async createUser(userData: CreateUserDTO): Promise<IUser> {
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        
        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        const user = await userRepository.createUser({ ...userData, password: hashedPassword });
        
        // Remove password before returning
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword as IUser;
    }

    async loginUser(loginData: LoginUserDTO) {
        // FIXED: Find by email and verify password
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpException(401, "Invalid email or password");
        }
        
        const isPasswordValid = await bcryptjs.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new HttpException(401, "Invalid email or password");
        }

        if (user.role !== "admin" && (await appSettingsService.isMaintenanceModeOn())) {
            throw new HttpException(503, "The website is currently under maintenance. Please try again later.");
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        
        const { password, ...userWithoutPassword } = user.toObject();
        return { user: userWithoutPassword, token };
    }

    async loginWithGoogle(data: GoogleLoginDTO) {
        if (!GOOGLE_CLIENT_ID) {
            throw new HttpException(500, "Google sign-in isn't configured on this server yet");
        }

        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({ idToken: data.idToken, audience: GOOGLE_CLIENT_ID });
            payload = ticket.getPayload();
        } catch {
            throw new HttpException(401, "Invalid Google sign-in token");
        }
        if (!payload?.email || !payload.email_verified) {
            throw new HttpException(401, "Google account has no verified email");
        }

        let user = await userRepository.getUserByEmail(payload.email);
        if (!user) {
            const randomPassword = await bcryptjs.hash(crypto.randomUUID(), 10);
            user = await userRepository.createUser({
                fullName: payload.name || payload.email.split("@")[0],
                email: payload.email,
                password: randomPassword,
                avatarUrl: payload.picture,
            });
        }

        if (user.role !== "admin" && (await appSettingsService.isMaintenanceModeOn())) {
            throw new HttpException(503, "The website is currently under maintenance. Please try again later.");
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );

        const { password, ...userWithoutPassword } = user.toObject();
        return { user: userWithoutPassword, token };
    }

    async getMe(id: string): Promise<IUser> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword as IUser;
    }

    async updateMe(id: string, data: UpdateMeDTO): Promise<IUser> {
        if (data.email) {
            const existing = await userRepository.getUserByEmail(data.email);
            if (existing && String(existing._id) !== id) {
                throw new HttpException(400, "Email already exists");
            }
        }

        // Merge notification preferences rather than replacing the whole
        // subdocument, so toggling one preference doesn't wipe the others.
        const { notificationPreferences: requestedPreferences, ...rest } = data;
        let mergedData: Partial<IUser> = rest;
        if (requestedPreferences) {
            const existing = await userRepository.getUserById(id);
            if (!existing) {
                throw new HttpException(404, "User not found");
            }
            // Mongoose subdocuments aren't plain objects — spreading the
            // document instance directly pulls in internal Mongoose state
            // instead of the actual fields, so serialize it first.
            const existingPreferences = existing.toObject().notificationPreferences;
            const mergedPreferences: INotificationPreferences = {
                ...existingPreferences,
                ...requestedPreferences,
            };
            mergedData = { ...rest, notificationPreferences: mergedPreferences };
        }

        const updated = await userRepository.update(id, mergedData);
        if (!updated) {
            throw new HttpException(404, "User not found");
        }
        const { password, ...userWithoutPassword } = updated.toObject();
        return userWithoutPassword as IUser;
    }

    async grantPurchasedRecipes(id: string, recipeIds: string[]): Promise<void> {
        if (recipeIds.length === 0) return;
        await userRepository.grantPurchasedRecipes(id, recipeIds);
    }

    async removePurchasedRecipe(id: string, recipeId: string): Promise<IUser> {
        const updated = await userRepository.removePurchasedRecipe(id, recipeId);
        if (!updated) {
            throw new HttpException(404, "User not found");
        }
        const { password, ...userWithoutPassword } = updated.toObject();
        return userWithoutPassword as IUser;
    }

    async addFavorite(id: string, recipeId: string): Promise<IUser> {
        const updated = await userRepository.addFavorite(id, recipeId);
        if (!updated) {
            throw new HttpException(404, "User not found");
        }
        const { password, ...userWithoutPassword } = updated.toObject();
        return userWithoutPassword as IUser;
    }

    async removeFavorite(id: string, recipeId: string): Promise<IUser> {
        const updated = await userRepository.removeFavorite(id, recipeId);
        if (!updated) {
            throw new HttpException(404, "User not found");
        }
        const { password, ...userWithoutPassword } = updated.toObject();
        return userWithoutPassword as IUser;
    }

    async changeMyPassword(id: string, data: ChangeMyPasswordDTO): Promise<void> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        const isCurrentValid = await bcryptjs.compare(data.currentPassword, user.password);
        if (!isCurrentValid) {
            throw new HttpException(401, "Current password is incorrect");
        }

        const hashedPassword = await bcryptjs.hash(data.newPassword, 10);
        await userRepository.update(id, { password: hashedPassword });
    }

    async setNewPassword(id: string, data: SetNewPasswordDTO): Promise<void> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        if (!user.passwordResetRequested) {
            throw new HttpException(400, "No password reset was requested for your account");
        }

        const hashedPassword = await bcryptjs.hash(data.newPassword, 10);
        await userRepository.update(id, { password: hashedPassword, passwordResetRequested: false });
    }

    private static readonly MAX_RESET_ATTEMPTS = 5;

    async requestPasswordResetCode(data: RequestPasswordResetCodeDTO): Promise<void> {
        const user = await userRepository.getUserByEmail(data.email);
        // Don't reveal whether the email exists — respond the same way either way.
        if (!user) return;

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = await bcryptjs.hash(code, 10);
        await userRepository.update(String(user._id), {
            passwordResetCode: codeHash,
            passwordResetCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            passwordResetAttempts: 0,
        });

        // Fire-and-forget: don't make the caller wait on the SMTP round trip.
        // Awaiting it here would make "email exists" responses measurably
        // slower than "email doesn't exist" ones, defeating the whole point
        // of responding identically either way.
        sendPasswordResetCodeEmail(user.email, code).catch(() => {});
    }

    private async validateResetCode(email: string, code: string): Promise<IUser> {
        const user = await userRepository.getUserByEmail(email);
        if (!user || !user.passwordResetCode || !user.passwordResetCodeExpiresAt) {
            throw new HttpException(400, "Invalid or expired code");
        }
        if (user.passwordResetCodeExpiresAt.getTime() < Date.now()) {
            throw new HttpException(400, "Invalid or expired code");
        }
        if (user.passwordResetAttempts >= UserService.MAX_RESET_ATTEMPTS) {
            // Lock this code out entirely rather than letting guesses continue —
            // the user has to request a fresh one.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await userRepository.update(String(user._id), {
                passwordResetCode: null,
                passwordResetCodeExpiresAt: null,
            } as any);
            throw new HttpException(429, "Too many incorrect attempts. Please request a new code.");
        }

        const isValid = await bcryptjs.compare(code, user.passwordResetCode);
        if (!isValid) {
            await userRepository.update(String(user._id), {
                passwordResetAttempts: user.passwordResetAttempts + 1,
            });
            throw new HttpException(400, "Invalid or expired code");
        }
        return user;
    }

    async verifyResetCode(data: VerifyResetCodeDTO): Promise<void> {
        await this.validateResetCode(data.email, data.code);
    }

    async resetPasswordWithCode(data: ResetPasswordWithCodeDTO): Promise<void> {
        const user = await this.validateResetCode(data.email, data.code);
        const hashedPassword = await bcryptjs.hash(data.newPassword, 10);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await userRepository.update(String(user._id), {
            password: hashedPassword,
            passwordResetCode: null,
            passwordResetCodeExpiresAt: null,
        } as any);
    }
}