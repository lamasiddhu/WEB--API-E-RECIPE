import { INotificationRepository } from "../../ports/repositories/notification.repository.port";
import { Notification } from "../../entities/notification.entity";

export class GetNotificationsUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(viewerId: string, role: "admin" | "user", joinedAt: Date) {
        if (role === "admin") {
            const notifications = await this.notificationRepository.findForAdmin(viewerId);
            return notifications.map((notification) => toViewerNotification(notification, viewerId));
        }
        const notifications = await this.notificationRepository.findForUser(viewerId, joinedAt);
        return notifications.map((notification) => toViewerNotification(notification, viewerId));
    }
}

// Broadcasts ("all" audience) track read state per-viewer in `readBy` since
// the document is shared; everything else uses the plain `isRead` flag.
export function toViewerNotification(notification: Notification, viewerId: string) {
    const obj = { ...notification } as Record<string, unknown>;
    if (obj.audience === "all") {
        const readBy = Array.isArray(obj.readBy) ? (obj.readBy as unknown[]) : [];
        obj.isRead = readBy.some((id: unknown) => String(id) === String(viewerId));
    }
    delete obj.readBy;
    delete obj.dismissedBy;
    return obj;
}
