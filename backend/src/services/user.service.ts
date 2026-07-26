import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateMeDTO, ChangeMyPasswordDTO, SetNewPasswordDTO } from "../dtos/user.dto";
import { IUser, INotificationPreferences } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import * as bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";
import { AppSettingsService } from "./appSettings.service";

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
}