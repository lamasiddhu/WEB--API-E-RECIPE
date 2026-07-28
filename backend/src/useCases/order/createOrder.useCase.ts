import { IClock } from "../../ports/security.port";
import { IOrderRepository } from "../../ports/repositories/order.repository.port";
import { CreateOrderInput } from "../inputs";

export class CreateOrderUseCase {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly clock: IClock
    ) {}

    async execute(data: CreateOrderInput, userId?: string) {
        const orderNumber = data.orderNumber || `ORD-${this.clock.now().getTime().toString(36).toUpperCase()}`;
        const { recipeIds, items, format, status, ...rest } = data;
        return this.orderRepository.create({
            ...rest,
            orderNumber,
            format,
            status: status || (format === "physical" ? "Processing" : "Completed"),
            recipeIds: recipeIds || [],
            items: (items || []).map((item) => ({ ...item })),
            userId,
        });
    }
}
