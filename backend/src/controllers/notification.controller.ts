import { Request, Response } from "express";
import { z } from "zod";
import { NotificationService } from "../services/notification.service";
import { BroadcastAnnouncementDTO, RespondProRequestDTO } from "../dtos/notification.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const notificationService = new NotificationService();

export class NotificationController {
    async getMyNotifications(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const notifications =
                user.role === "admin"
                    ? await notificationService.getForAdmin(String(user._id))
                    : await notificationService.getForUser(String(user._id));
            return ApiResponseHelper.success(res, notifications, "Notifications fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async requestPro(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const notification = await notificationService.requestPro(String(user._id), user.fullName);
            return ApiResponseHelper.success(res, notification, "Pro access requested", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async respondToProRequest(req: Request, res: Response) {
        try {
            const parsed = RespondProRequestDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const result = await notificationService.respondToProRequest(String(req.params.id), parsed.data.action);
            return ApiResponseHelper.success(res, result, "Request reviewed");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async broadcastAnnouncement(req: Request, res: Response) {
        try {
            const parsed = BroadcastAnnouncementDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const notification = await notificationService.broadcastAnnouncement(parsed.data.message);
            return ApiResponseHelper.success(res, notification, "Announcement broadcast to all users", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async markRead(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const notification = await notificationService.markRead(String(req.params.id), String(user._id));
            return ApiResponseHelper.success(res, notification, "Notification marked as read");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async markAllRead(req: Request, res: Response) {
        try {
            const user = req.user as any;
            await notificationService.markAllRead(String(user._id), user.role);
            return ApiResponseHelper.success(res, null, "All notifications marked as read");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async clearAll(req: Request, res: Response) {
        try {
            const user = req.user as any;
            await notificationService.clearAll(String(user._id), user.role);
            return ApiResponseHelper.success(res, null, "Notifications cleared");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
