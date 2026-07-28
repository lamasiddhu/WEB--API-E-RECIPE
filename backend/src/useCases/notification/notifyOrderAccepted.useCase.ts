import { INotificationRepository } from "../../ports/repositories/notification.repository.port";

export class NotifyOrderAcceptedUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(userId: string, orderNumber: string, format: "digital" | "physical" = "physical") {
        const fulfillmentNote =
            format === "digital"
                ? "Your recipes are unlocked and ready to view."
                : `Your order #${orderNumber} has been accepted and is on its way.`;
        return this.notificationRepository.create({
            audience: "user",
            recipientId: userId,
            type: "order_accepted",
            title: "Thank You for Your Purchase!",
            message: `${fulfillmentNote} Thank you for purchasing. We hope you'll leave a great review and shop more recipes with us soon!`,
        });
    }
}
