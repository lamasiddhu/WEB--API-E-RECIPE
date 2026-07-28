import { ApplicationError } from "../../exceptions/application-error";
import { IUserRepository } from "../../ports/repositories/user.repository.port";
import { AdminUpdateUserInput } from "../inputs";
import { stripPassword } from "./stripPassword";

export class UpdateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(id: string, data: AdminUpdateUserInput) {
        const existing = await this.userRepository.getUserById(id);
        if (!existing) throw new ApplicationError(404, "User not found");

        if (data.email && data.email !== existing.email) {
            const emailTaken = await this.userRepository.getUserByEmail(data.email);
            if (emailTaken) throw new ApplicationError(400, "Email already exists");
        }

        const updated = await this.userRepository.update(id, data);
        if (!updated) throw new ApplicationError(404, "User not found");
        return stripPassword(updated);
    }
}
