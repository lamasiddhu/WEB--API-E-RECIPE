import { UserMongoRepository } from "../repositories/user.repository";
import { AdminCreateUserDTO, AdminUpdateUserDTO, UpdatePasswordDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import * as bcryptjs from "bcryptjs";
import { NotificationService } from "./notification.service";

const userRepository = new UserMongoRepository();
const notificationService = new NotificationService();

const stripPassword = (user: IUser) => {
    const { password, ...rest } = user.toObject();
    return rest;
};

export class AdminUserService {
    async getAllUsers(page: number, limit: number, search: string) {
        const { users, total } = await userRepository.getAllPaginated(page, limit, search);
        return { users: users.map(stripPassword), total };
    }

    async getUserById(id: string) {
        const user = await userRepository.getUserById(id);
        if (!user) throw new HttpException(404, "User not found");
        return stripPassword(user);
    }

    async createUser(data: AdminCreateUserDTO) {
        const existing = await userRepository.getUserByEmail(data.email);
        if (existing) throw new HttpException(400, "Email already exists");

        const hashedPassword = await bcryptjs.hash(data.password, 10);
        const user = await userRepository.createUser({
            ...data,
            password: hashedPassword,
            role: data.role || "user",
        });
        return stripPassword(user);
    }

    async updateUser(id: string, data: AdminUpdateUserDTO) {
        const existing = await userRepository.getUserById(id);
        if (!existing) throw new HttpException(404, "User not found");

        if (data.email && data.email !== existing.email) {
            const emailTaken = await userRepository.getUserByEmail(data.email);
            if (emailTaken) throw new HttpException(400, "Email already exists");
        }

        const updated = await userRepository.update(id, data);
        if (!updated) throw new HttpException(404, "User not found");
        return stripPassword(updated);
    }

    async updatePassword(id: string, data: UpdatePasswordDTO) {
        const existing = await userRepository.getUserById(id);
        if (!existing) throw new HttpException(404, "User not found");

        const hashedPassword = await bcryptjs.hash(data.password, 10);
        const updated = await userRepository.update(id, { password: hashedPassword });
        if (!updated) throw new HttpException(404, "User not found");
        return stripPassword(updated);
    }

    async requestPasswordReset(id: string) {
        const existing = await userRepository.getUserById(id);
        if (!existing) throw new HttpException(404, "User not found");

        await userRepository.update(id, { passwordResetRequested: true });
        await notificationService.notifyPasswordResetRequested(id);
        return true;
    }

    async deleteUser(id: string) {
        const deleted = await userRepository.delete(id);
        if (!deleted) throw new HttpException(404, "User not found");
        return true;
    }

    async removeUserPurchasedRecipe(userId: string, recipeId: string) {
        const updated = await userRepository.removePurchasedRecipe(userId, recipeId);
        if (!updated) throw new HttpException(404, "User not found");
        return stripPassword(updated);
    }
}
