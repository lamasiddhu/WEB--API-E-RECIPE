import mongoose from "mongoose";
import { NotificationMongoRepository } from "../repositories/notification.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { HttpException } from "../exceptions/http-exception";
import { INotification } from "../models/notification.model";

const notificationRepository = new NotificationMongoRepository();
const userRepository = new UserMongoRepository();

export class NotificationService {
    async requestPro(userId: string, userName: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        if (user.isPro) {
            throw new HttpException(400, "You already have Pro access");
        }
        if (user.proRequestPending) {
            throw new HttpException(400, "Your Pro access request is already pending review");
        }

        await userRepository.update(userId, { proRequestPending: true });

        return await notificationRepository.create({
            audience: "admin",
            type: "pro_request",
            title: "Pro Access Request",
            message: `${userName} requested Pro access.`,
            relatedUserId: user._id,
            relatedUserName: userName,
            status: "pending",
        });
    }

    async respondToProRequest(notificationId: string, action: "approve" | "reject") {
        const notification = await notificationRepository.findById(notificationId);
        if (!notification || notification.type !== "pro_request") {
            throw new HttpException(404, "Pro access request not found");
        }
        if (notification.status !== "pending") {
            throw new HttpException(400, "This request has already been reviewed");
        }
        if (!notification.relatedUserId) {
            throw new HttpException(400, "Request is missing the requesting user");
        }

        const approved = action === "approve";
        await userRepository.update(String(notification.relatedUserId), {
            isPro: approved,
            proRequestPending: false,
        });

        await notificationRepository.updateStatus(notificationId, approved ? "approved" : "rejected");

        await notificationRepository.create({
            audience: "user",
            recipientId: notification.relatedUserId,
            type: approved ? "pro_approved" : "pro_rejected",
            title: approved ? "Pro Access Approved" : "Pro Access Request Declined",
            message: approved
                ? "Your Pro access request was approved! Premium recipes are now unlocked."
                : "Your Pro access request was declined by an admin.",
            status: approved ? "approved" : "rejected",
        });

        return { approved };
    }

    async notifyOrderCancelled(userId: string, orderNumber: string, reason: string) {
        return await notificationRepository.create({
            audience: "user",
            recipientId: new mongoose.Types.ObjectId(userId),
            type: "order_cancelled",
            title: `Order #${orderNumber} Cancelled`,
            message: `Your order was cancelled. Reason: ${reason}`,
        });
    }

    async notifyOrderAccepted(userId: string, orderNumber: string, format: "digital" | "physical" = "physical") {
        const fulfillmentNote =
            format === "digital"
                ? "Your recipes are unlocked and ready to view."
                : `Your order #${orderNumber} has been accepted and is on its way.`;
        return await notificationRepository.create({
            audience: "user",
            recipientId: new mongoose.Types.ObjectId(userId),
            type: "order_accepted",
            title: "Thank You for Your Purchase!",
            message: `${fulfillmentNote} Thank you for purchasing. We hope you'll leave a great review and shop more recipes with us soon!`,
        });
    }

    async notifyPasswordResetRequested(userId: string) {
        return await notificationRepository.create({
            audience: "user",
            recipientId: new mongoose.Types.ObjectId(userId),
            type: "password_reset_requested",
            title: "Password Reset Requested",
            message: "An admin has requested you reset your password. Tap this notification to set a new one.",
        });
    }

    async broadcastAnnouncement(message: string) {
        return await notificationRepository.create({
            audience: "all",
            type: "announcement",
            title: "Announcement",
            message,
        });
    }

    async getForAdmin(viewerId: string) {
        const notifications = await notificationRepository.findForAdmin(viewerId);
        return notifications.map((n) => toViewerNotification(n, viewerId));
    }

    async getForUser(userId: string) {
        const notifications = await notificationRepository.findForUser(userId);
        return notifications.map((n) => toViewerNotification(n, userId));
    }

    async markRead(id: string, viewerId: string) {
        const updated = await notificationRepository.markRead(id, viewerId);
        if (!updated) {
            throw new HttpException(404, "Notification not found");
        }
        return toViewerNotification(updated, viewerId);
    }

    async markAllRead(viewerId: string, role: "admin" | "user") {
        if (role === "admin") {
            await notificationRepository.markAllReadForAdmin(viewerId);
        } else {
            await notificationRepository.markAllReadForUser(viewerId);
        }
    }

    async clearAll(viewerId: string, role: "admin" | "user") {
        if (role === "admin") {
            await notificationRepository.clearAllForAdmin(viewerId);
        } else {
            await notificationRepository.clearAllForUser(viewerId);
        }
    }
}

// Broadcasts ("all" audience) track read state per-viewer in `readBy` since
// the document is shared; everything else uses the plain `isRead` flag.
function toViewerNotification(notification: INotification, viewerId: string) {
    const obj = notification.toObject();
    if (obj.audience === "all") {
        obj.isRead = (obj.readBy || []).some((id: any) => String(id) === String(viewerId));
    }
    delete obj.readBy;
    delete obj.dismissedBy;
    return obj;
}
