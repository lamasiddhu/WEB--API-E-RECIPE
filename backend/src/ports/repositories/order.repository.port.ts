import { Order, OrderStatus } from "../../entities/order.entity";

export interface IOrderRepository {
    getAll(): Promise<Order[]>;
    getAllForUser(userId: string): Promise<Order[]>;
    getById(id: string): Promise<Order | null>;
    create(order: Partial<Order>): Promise<Order>;
    updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
    cancel(id: string, reason: string): Promise<Order | null>;
    delete(id: string): Promise<boolean>;
}
