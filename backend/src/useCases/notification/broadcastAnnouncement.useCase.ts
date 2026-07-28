import { INotificationRepository } from "../../ports/repositories/notification.repository.port";

export class BroadcastAnnouncementUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(message: string) {
        return this.notificationRepository.create({
            audience: "all",
            type: "announcement",
            title: "Announcement",
            message,
            senderName: "E-RECIPE",
        });
    }
}
