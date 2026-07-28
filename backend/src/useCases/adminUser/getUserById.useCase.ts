import { ApplicationError } from "../../exceptions/application-error";
import { IUserRepository } from "../../ports/repositories/user.repository.port";
import { stripPassword } from "./stripPassword";

export class GetUserByIdUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(id: string) {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new ApplicationError(404, "User not found");
        return stripPassword(user);
    }
}
