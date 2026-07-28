import { INotificationRepository } from "../../ports/repositories/notification.repository.port";

export class ClearAllUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(viewerId: string, role: "admin" | "user") {
        if (role === "admin") {
            await this.notificationRepository.clearAllForAdmin(viewerId);
        } else {
            await this.notificationRepository.clearAllForUser(viewerId);
        }
    }
}
