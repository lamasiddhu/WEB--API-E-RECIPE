import { ApplicationError } from "../../exceptions/application-error";
import { IOrderRepository } from "../../ports/repositories/order.repository.port";

export class CancelOrderUseCase {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly notifyOrderCancelledUseCase: {
            execute: (userId: string, orderNumber: string, reason: string) => Promise<unknown>;
        }
    ) {}

    async execute(id: string, reason: string) {
        const order = await this.orderRepository.cancel(id, reason);
        if (!order) throw new ApplicationError(404, "Order not found");

        if (order.userId) {
            await this.notifyOrderCancelledUseCase.execute(String(order.userId), order.orderNumber, reason);
        }

        return order;
    }
}
