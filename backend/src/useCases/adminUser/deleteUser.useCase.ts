import { ApplicationError } from "../../exceptions/application-error";
import { IUserRepository } from "../../ports/repositories/user.repository.port";

export class DeleteUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(id: string) {
        const deleted = await this.userRepository.delete(id);
        if (!deleted) throw new ApplicationError(404, "User not found");
        return true;
    }
}
