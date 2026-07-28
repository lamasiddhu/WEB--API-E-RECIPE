import { INotificationRepository } from "../../ports/repositories/notification.repository.port";

export class MarkAllReadUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(viewerId: string, role: "admin" | "user") {
        if (role === "admin") {
            await this.notificationRepository.markAllReadForAdmin(viewerId);
        } else {
            await this.notificationRepository.markAllReadForUser(viewerId);
        }
    }
}
