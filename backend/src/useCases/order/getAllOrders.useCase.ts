import { IOrderRepository } from "../../ports/repositories/order.repository.port";

export class GetAllOrdersUseCase {
    constructor(private readonly orderRepository: IOrderRepository) {}

    async execute() {
        return this.orderRepository.getAll();
    }
}
