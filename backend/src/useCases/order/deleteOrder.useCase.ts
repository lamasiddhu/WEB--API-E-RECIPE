import { ApplicationError } from "../../exceptions/application-error";
import { IOrderRepository } from "../../ports/repositories/order.repository.port";

export class DeleteOrderUseCase {
    constructor(private readonly orderRepository: IOrderRepository) {}

    async execute(id: string) {
        const deleted = await this.orderRepository.delete(id);
        if (!deleted) throw new ApplicationError(404, "Order not found");
        return true;
    }
}
