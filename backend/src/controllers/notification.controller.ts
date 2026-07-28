import { Request, Response } from "express";
import { z } from "zod";
import { BroadcastAnnouncementDTO, RespondProRequestDTO, SendPersonalNotificationDTO } from "../dtos/notification.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import {
    broadcastAnnouncementUseCase,
    clearAllNotificationsUseCase,
    getNotificationsUseCase,
    markAllNotificationsReadUseCase,
    markNotificationReadUseCase,
    requestProUseCase,
    respondToProRequestUseCase,
    respondToRecipeSubmissionUseCase,
    sendPersonalNotificationUseCase,
} from "../container";

export class NotificationController {
    async getMyNotifications(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const notifications = await getNotificationsUseCase.execute(String(user._id), user.role, user.createdAt);
            return ApiResponseHelper.success(res, notifications, "Notifications fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async requestPro(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const notification = await requestProUseCase.execute(String(user._id), user.fullName);
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
            const result = await respondToProRequestUseCase.execute(String(req.params.id), parsed.data.action);
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
            const notification = await broadcastAnnouncementUseCase.execute(parsed.data.message);
            return ApiResponseHelper.success(res, notification, "Announcement broadcast to all users", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async sendPersonalNotification(req: Request, res: Response) {
        try {
            const parsed = SendPersonalNotificationDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const notification = await sendPersonalNotificationUseCase.execute(
                parsed.data.recipientId,
                parsed.data.message,
                parsed.data.title
            );
            return ApiResponseHelper.success(res, notification, "Notification sent to user", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async respondToRecipeSubmission(req: Request, res: Response) {
        try {
            const parsed = RespondProRequestDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const result = await respondToRecipeSubmissionUseCase.execute(String(req.params.id), parsed.data.action);
            return ApiResponseHelper.success(res, result, "Recipe request reviewed");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async markRead(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const notification = await markNotificationReadUseCase.execute(String(req.params.id), String(user._id));
            return ApiResponseHelper.success(res, notification, "Notification marked as read");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async markAllRead(req: Request, res: Response) {
        try {
            const user = req.user as any;
            await markAllNotificationsReadUseCase.execute(String(user._id), user.role);
            return ApiResponseHelper.success(res, null, "All notifications marked as read");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async clearAll(req: Request, res: Response) {
        try {
            const user = req.user as any;
            await clearAllNotificationsUseCase.execute(String(user._id), user.role);
            return ApiResponseHelper.success(res, null, "Notifications cleared");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
