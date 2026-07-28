import { ApplicationError } from "../../exceptions/application-error";
import { INotificationRepository } from "../../ports/repositories/notification.repository.port";
import { IUserRepository } from "../../ports/repositories/user.repository.port";

export class SendPersonalNotificationUseCase {
    constructor(
        private readonly notifications: INotificationRepository,
        private readonly users: IUserRepository
    ) {}

    async execute(recipientId: string, message: string, title?: string) {
        const user = await this.users.getUserById(recipientId);
        if (!user) throw new ApplicationError(404, "User not found");

        return this.notifications.create({
            audience: "user",
            recipientId,
            type: "personal_message",
            title: title || "Message from E-RECIPE",
            message,
            relatedUserId: recipientId,
            relatedUserName: user.fullName,
            senderName: "E-RECIPE",
        });
    }
}
