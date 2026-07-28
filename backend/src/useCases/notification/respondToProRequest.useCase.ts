import { ApplicationError } from "../../exceptions/application-error";
import { INotificationRepository } from "../../ports/repositories/notification.repository.port";
import { IUserRepository } from "../../ports/repositories/user.repository.port";

export class RespondToProRequestUseCase {
    constructor(
        private readonly notificationRepository: INotificationRepository,
        private readonly userRepository: IUserRepository
    ) {}

    async execute(notificationId: string, action: "approve" | "reject") {
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification || notification.type !== "pro_request") {
            throw new ApplicationError(404, "Pro access request not found");
        }
        if (notification.status !== "pending") {
            throw new ApplicationError(400, "This request has already been reviewed");
        }
        if (!notification.relatedUserId) {
            throw new ApplicationError(400, "Request is missing the requesting user");
        }

        const approved = action === "approve";
        await this.userRepository.update(String(notification.relatedUserId), {
            isPro: approved,
            proRequestPending: false,
        });

        await this.notificationRepository.updateStatus(notificationId, approved ? "approved" : "rejected");

        await this.notificationRepository.create({
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
}
