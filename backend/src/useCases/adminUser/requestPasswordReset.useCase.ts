import { ApplicationError } from "../../exceptions/application-error";
import { IUserRepository } from "../../ports/repositories/user.repository.port";

export class RequestPasswordResetUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly notifyPasswordResetRequestedUseCase: { execute(userId: string): Promise<unknown> }
    ) {}

    async execute(id: string) {
        const existing = await this.userRepository.getUserById(id);
        if (!existing) throw new ApplicationError(404, "User not found");

        await this.userRepository.update(id, { passwordResetRequested: true });
        await this.notifyPasswordResetRequestedUseCase.execute(id);
        return true;
    }
}
