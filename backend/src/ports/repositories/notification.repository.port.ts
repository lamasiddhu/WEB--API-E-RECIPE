import { Notification } from "../../entities/notification.entity";

export interface INotificationRepository {
    create(data: Partial<Notification>): Promise<Notification>;
    findById(id: string): Promise<Notification | null>;
    findForAdmin(viewerId: string): Promise<Notification[]>;
    findForUser(userId: string, joinedAt: Date): Promise<Notification[]>;
    markRead(id: string, viewerId: string): Promise<Notification | null>;
    markAllReadForAdmin(viewerId: string): Promise<void>;
    markAllReadForUser(userId: string): Promise<void>;
    clearAllForAdmin(viewerId: string): Promise<void>;
    clearAllForUser(userId: string): Promise<void>;
    updateStatus(id: string, status: "approved" | "rejected"): Promise<Notification | null>;
}
