import mongoose from "mongoose";
import { NotificationModel, INotification } from "../models/notification.model";

export interface INotificationRepository {
    create(data: Partial<INotification>): Promise<INotification>;
    findById(id: string): Promise<INotification | null>;
    findForAdmin(viewerId: string): Promise<INotification[]>;
    findForUser(userId: string): Promise<INotification[]>;
    markRead(id: string, viewerId: string): Promise<INotification | null>;
    markAllReadForAdmin(viewerId: string): Promise<void>;
    markAllReadForUser(userId: string): Promise<void>;
    clearAllForAdmin(viewerId: string): Promise<void>;
    clearAllForUser(userId: string): Promise<void>;
    updateStatus(id: string, status: "approved" | "rejected"): Promise<INotification | null>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminScopeFilter = (viewerId: string): any => ({
    audience: { $in: ["admin", "all"] },
    dismissedBy: { $ne: new mongoose.Types.ObjectId(viewerId) },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userScopeFilter = (userId: string): any => ({
    $or: [{ audience: "all" }, { audience: "user", recipientId: userId }],
    dismissedBy: { $ne: new mongoose.Types.ObjectId(userId) },
});

// Pending pro-access requests still need an Approve/Reject decision — bulk
// "clear all" must never silently drop them.
const excludingPendingProRequest = { $nor: [{ type: "pro_request", status: "pending" }] };

export class NotificationMongoRepository implements INotificationRepository {
    async create(data: Partial<INotification>): Promise<INotification> {
        return await NotificationModel.create(data);
    }

    async findById(id: string): Promise<INotification | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await NotificationModel.findById(id);
    }

    async findForAdmin(viewerId: string): Promise<INotification[]> {
        return await NotificationModel.find(adminScopeFilter(viewerId)).sort({ createdAt: -1 }).limit(50);
    }

    async findForUser(userId: string): Promise<INotification[]> {
        return await NotificationModel.find(userScopeFilter(userId)).sort({ createdAt: -1 }).limit(50);
    }

    async markRead(id: string, viewerId: string): Promise<INotification | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const notification = await NotificationModel.findById(id);
        if (!notification) return null;

        if (notification.audience === "all") {
            return await NotificationModel.findByIdAndUpdate(
                id,
                { $addToSet: { readBy: new mongoose.Types.ObjectId(viewerId) } },
                { new: true }
            );
        }
        return await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
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
        const filter = userScopeFilter(userId);
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
        await NotificationModel.deleteMany({ ...filter, audience: { $ne: "all" }, ...excludingPendingProRequest });
    }

    async clearAllForUser(userId: string): Promise<void> {
        const filter = userScopeFilter(userId);
        await NotificationModel.updateMany(
            { ...filter, audience: "all" },
            { $addToSet: { dismissedBy: new mongoose.Types.ObjectId(userId) } }
        );
        await NotificationModel.deleteMany({ ...filter, audience: { $ne: "all" } });
    }

    async updateStatus(id: string, status: "approved" | "rejected"): Promise<INotification | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await NotificationModel.findByIdAndUpdate(id, { status, isRead: true }, { new: true });
    }
}
