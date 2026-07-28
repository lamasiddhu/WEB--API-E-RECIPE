import { IOrderRepository } from "../../ports/repositories/order.repository.port";

export class GetMyOrdersUseCase {
    constructor(private readonly orderRepository: IOrderRepository) {}

    async execute(userId: string) {
        return this.orderRepository.getAllForUser(userId);
    }
}
