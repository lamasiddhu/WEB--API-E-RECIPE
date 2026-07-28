import { ApplicationError } from "../../exceptions/application-error";
import { IOrderRepository } from "../../ports/repositories/order.repository.port";

export class AcceptOrderUseCase {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly notifyOrderAcceptedUseCase: {
            execute: (userId: string, orderNumber: string, format?: "digital" | "physical") => Promise<unknown>;
        }
    ) {}

    async execute(id: string) {
        const order = await this.orderRepository.getById(id);
        if (!order) throw new ApplicationError(404, "Order not found");
        if (order.format !== "physical") {
            throw new ApplicationError(400, "Only physical orders require acceptance");
        }
        if (order.status === "Cancelled") {
            throw new ApplicationError(400, "This order was cancelled");
        }

        const updated = await this.orderRepository.updateStatus(id, "Completed");
        if (!updated) throw new ApplicationError(404, "Order not found");

        if (updated.userId) {
            await this.notifyOrderAcceptedUseCase.execute(String(updated.userId), updated.orderNumber);
        }

        return updated;
    }
}
