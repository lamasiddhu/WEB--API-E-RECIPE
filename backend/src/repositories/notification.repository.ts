import mongoose from "mongoose";
import { NotificationModel, INotification } from "../models/notification.model";
import { Notification } from "../entities/notification.entity";
import { INotificationRepository } from "../ports/repositories/notification.repository.port";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminScopeFilter = (viewerId: string): any => ({
    audience: { $in: ["admin", "all"] },
    dismissedBy: { $ne: new mongoose.Types.ObjectId(viewerId) },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userScopeFilter = (userId: string, joinedAt: Date): any => ({
    $or: [
        { audience: "all", createdAt: { $gte: joinedAt } },
        { audience: "user", recipientId: userId },
    ],
    dismissedBy: { $ne: new mongoose.Types.ObjectId(userId) },
});

const allUserScopeFilter = (userId: string): any => ({
    $or: [{ audience: "all" }, { audience: "user", recipientId: userId }],
    dismissedBy: { $ne: new mongoose.Types.ObjectId(userId) },
});

// Pending pro-access requests still need an Approve/Reject decision — bulk
// "clear all" must never silently drop them.
const excludingPendingRequests = {
    $nor: [
        { type: "pro_request", status: "pending" },
        { type: "recipe_submission", status: "pending" },
    ],
};

export class NotificationMongoRepository implements INotificationRepository {
    private toEntity(doc: INotification): Notification {
        return {
            _id: String(doc._id),
            audience: doc.audience,
            recipientId: doc.recipientId ? String(doc.recipientId) : undefined,
            type: doc.type,
            title: doc.title,
            message: doc.message,
            relatedUserId: doc.relatedUserId ? String(doc.relatedUserId) : undefined,
            relatedUserName: doc.relatedUserName,
            relatedRecipeId: doc.relatedRecipeId ? String(doc.relatedRecipeId) : undefined,
            relatedRecipeTitle: doc.relatedRecipeTitle,
            imageUrl: doc.imageUrl,
            senderName: doc.senderName || "E-RECIPE",
            status: doc.status,
            isRead: doc.isRead,
            readBy: doc.readBy.map((id) => String(id)),
            dismissedBy: doc.dismissedBy.map((id) => String(id)),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            version: (doc as INotification & { __v: number }).__v,
        };
    }

    async create(data: Partial<Notification>): Promise<Notification> {
        const created = await NotificationModel.create({
            ...data,
            recipientId: data.recipientId ? new mongoose.Types.ObjectId(data.recipientId) : undefined,
            relatedUserId: data.relatedUserId ? new mongoose.Types.ObjectId(data.relatedUserId) : undefined,
            relatedRecipeId: data.relatedRecipeId ? new mongoose.Types.ObjectId(data.relatedRecipeId) : undefined,
            readBy: (data.readBy || []).map((id) => new mongoose.Types.ObjectId(id)),
            dismissedBy: (data.dismissedBy || []).map((id) => new mongoose.Types.ObjectId(id)),
        } as Partial<INotification>);
        return this.toEntity(created);
    }

    async findById(id: string): Promise<Notification | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const notification = await NotificationModel.findById(id);
        return notification ? this.toEntity(notification) : null;
    }

    async findForAdmin(viewerId: string): Promise<Notification[]> {
        const notifications = await NotificationModel.find(adminScopeFilter(viewerId)).sort({ createdAt: -1 }).limit(50);
        return notifications.map((notification) => this.toEntity(notification));
    }

    async findForUser(userId: string, joinedAt: Date): Promise<Notification[]> {
        const notifications = await NotificationModel.find(userScopeFilter(userId, joinedAt)).sort({ createdAt: -1 }).limit(50);
        return notifications.map((notification) => this.toEntity(notification));
    }

    async markRead(id: string, viewerId: string): Promise<Notification | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const notification = await NotificationModel.findById(id);
        if (!notification) return null;

        if (notification.audience === "all") {
            const updated = await NotificationModel.findByIdAndUpdate(
                id,
                { $addToSet: { readBy: new mongoose.Types.ObjectId(viewerId) } },
                { new: true }
            );
            return updated ? this.toEntity(updated) : null;
        }
        const updated = await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
        return updated ? this.toEntity(updated) : null;
    }

    async markAllReadForAdmin(viewerId: string): Promise<void> {
        const filter = adminScopeFilter(viewerId);
        await NotificationModel.updateMany(
            { ...filter, audience: "all" },
            { $addToSet: { readBy: new mongoose.Types.ObjectId(viewerId) } }
        );
        await NotificationModel.updateMany({ ...filter, audience: { $ne: "all" } }, { isRead: true });
    }

    async markAllReadForUser(userId: string): Promise<void> {
        const filter = allUserScopeFilter(userId);
        await NotificationModel.updateMany(
            { ...filter, audience: "all" },
            { $addToSet: { readBy: new mongoose.Types.ObjectId(userId) } }
        );
        await NotificationModel.updateMany({ ...filter, audience: { $ne: "all" } }, { isRead: true });
    }

    async clearAllForAdmin(viewerId: string): Promise<void> {
        const filter = adminScopeFilter(viewerId);
        // Broadcasts are shared — dismiss just for this viewer instead of deleting.
        await NotificationModel.updateMany(
            { ...filter, audience: "all" },
            { $addToSet: { dismissedBy: new mongoose.Types.ObjectId(viewerId) } }
        );
        await NotificationModel.deleteMany({ ...filter, audience: { $ne: "all" }, ...excludingPendingRequests });
    }

    async clearAllForUser(userId: string): Promise<void> {
        const filter = allUserScopeFilter(userId);
        await NotificationModel.updateMany(
            { ...filter, audience: "all" },
            { $addToSet: { dismissedBy: new mongoose.Types.ObjectId(userId) } }
        );
        await NotificationModel.deleteMany({ ...filter, audience: { $ne: "all" } });
    }

    async updateStatus(id: string, status: "approved" | "rejected"): Promise<Notification | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const updated = await NotificationModel.findByIdAndUpdate(id, { status, isRead: true }, { new: true });
        return updated ? this.toEntity(updated) : null;
    }
}
