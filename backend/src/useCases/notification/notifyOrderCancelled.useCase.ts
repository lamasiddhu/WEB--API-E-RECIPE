import { INotificationRepository } from "../../ports/repositories/notification.repository.port";

export class NotifyOrderCancelledUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(userId: string, orderNumber: string, reason: string) {
        return this.notificationRepository.create({
            audience: "user",
            recipientId: userId,
            type: "order_cancelled",
            title: `Order #${orderNumber} Cancelled`,
            message: `Your order was cancelled. Reason: ${reason}`,
        });
    }
}
