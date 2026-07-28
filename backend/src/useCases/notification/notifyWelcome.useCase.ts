import { INotificationRepository } from "../../ports/repositories/notification.repository.port";

export class NotifyWelcomeUseCase {
    constructor(private readonly notifications: INotificationRepository) {}

    execute(userId: string, fullName: string) {
        return this.notifications.create({
            audience: "user",
            recipientId: userId,
            type: "welcome",
            title: `Hello ${fullName}!`,
            message: `Hello ${fullName}, hope E-RECIPE will make your home cooking easier and elegant.`,
        });
    }
}
