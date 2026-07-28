import { INotificationRepository } from "../../ports/repositories/notification.repository.port";

export class NotifyPasswordResetRequestedUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(userId: string) {
        return this.notificationRepository.create({
            audience: "user",
            recipientId: userId,
            type: "password_reset_requested",
            title: "Password Reset Requested",
            message: "An admin has requested you reset your password. Tap this notification to set a new one.",
        });
    }
}
