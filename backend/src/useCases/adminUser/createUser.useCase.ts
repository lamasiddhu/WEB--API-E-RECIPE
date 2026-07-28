import { ApplicationError } from "../../exceptions/application-error";
import { IPasswordHasher } from "../../ports/security.port";
import { IUserRepository } from "../../ports/repositories/user.repository.port";
import { AdminCreateUserInput } from "../inputs";
import { stripPassword } from "./stripPassword";

export class CreateUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwords: IPasswordHasher,
        private readonly welcome: { execute(userId: string, fullName: string): Promise<unknown> }
    ) {}

    async execute(data: AdminCreateUserInput) {
        const existing = await this.userRepository.getUserByEmail(data.email);
        if (existing) throw new ApplicationError(400, "Email already exists");

        const hashedPassword = await this.passwords.hash(data.password);
        const user = await this.userRepository.createUser({
            ...data,
            password: hashedPassword,
            role: data.role || "user",
        });
        await this.welcome.execute(user._id, user.fullName);
        return stripPassword(user);
    }
}
