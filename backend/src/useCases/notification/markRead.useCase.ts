import { ApplicationError } from "../../exceptions/application-error";
import { INotificationRepository } from "../../ports/repositories/notification.repository.port";
import { toViewerNotification } from "./getNotifications.useCase";

export class MarkReadUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(id: string, viewerId: string) {
        const updated = await this.notificationRepository.markRead(id, viewerId);
        if (!updated) {
            throw new ApplicationError(404, "Notification not found");
        }
        return toViewerNotification(updated, viewerId);
    }
}
