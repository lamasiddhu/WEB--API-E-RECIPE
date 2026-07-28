import { ApplicationError } from "../../exceptions/application-error";
import { IPasswordHasher } from "../../ports/security.port";
import { IUserRepository } from "../../ports/repositories/user.repository.port";
import { UpdatePasswordInput } from "../inputs";
import { stripPassword } from "./stripPassword";

export class UpdatePasswordUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwords: IPasswordHasher
    ) {}

    async execute(id: string, data: UpdatePasswordInput) {
        const existing = await this.userRepository.getUserById(id);
        if (!existing) throw new ApplicationError(404, "User not found");

        const hashedPassword = await this.passwords.hash(data.password);
        const updated = await this.userRepository.update(id, { password: hashedPassword });
        if (!updated) throw new ApplicationError(404, "User not found");
        return stripPassword(updated);
    }
}
