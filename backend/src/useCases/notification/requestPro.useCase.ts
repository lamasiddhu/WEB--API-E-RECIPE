import { ApplicationError } from "../../exceptions/application-error";
import { INotificationRepository } from "../../ports/repositories/notification.repository.port";
import { IUserRepository } from "../../ports/repositories/user.repository.port";

export class RequestProUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly notificationRepository: INotificationRepository
    ) {}

    async execute(userId: string, userName: string) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new ApplicationError(404, "User not found");
        }
        if (user.isPro) {
            throw new ApplicationError(400, "You already have Pro access");
        }
        if (user.proRequestPending) {
            throw new ApplicationError(400, "Your Pro access request is already pending review");
        }

        await this.userRepository.update(userId, { proRequestPending: true });

        return this.notificationRepository.create({
            audience: "admin",
            type: "pro_request",
            title: "Pro Access Request",
            message: `${userName} requested Pro access.`,
            relatedUserId: String(user._id),
            relatedUserName: userName,
            status: "pending",
        });
    }
}
