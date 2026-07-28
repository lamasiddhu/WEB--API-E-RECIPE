import mongoose from "mongoose";
import { OrderModel, IOrder } from "../models/order.model";
import { Order, OrderStatus } from "../entities/order.entity";
import { IOrderRepository } from "../ports/repositories/order.repository.port";

export class OrderMongoRepository implements IOrderRepository {
    private toEntity(doc: IOrder): Order {
        return {
            _id: String(doc._id),
            orderNumber: doc.orderNumber,
            customer: doc.customer,
            item: doc.item,
            items: doc.items.map((item) => ({
                recipeId: String(item.recipeId),
                title: item.title,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
            price: doc.price,
            status: doc.status,
            format: doc.format,
            recipeIds: doc.recipeIds.map((id) => String(id)),
            userId: doc.userId ? String(doc.userId) : undefined,
            cancelReason: doc.cancelReason,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            version: (doc as IOrder & { __v: number }).__v,
        };
    }

    async getAll(): Promise<Order[]> {
        const orders = await OrderModel.find().sort({ createdAt: -1 });
        return orders.map((order) => this.toEntity(order));
    }

    async getAllForUser(userId: string): Promise<Order[]> {
        const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
        return orders.map((order) => this.toEntity(order));
    }

    async getById(id: string): Promise<Order | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const order = await OrderModel.findById(id);
        return order ? this.toEntity(order) : null;
    }

    async create(order: Partial<Order>): Promise<Order> {
        const created = await OrderModel.create({
            ...order,
            recipeIds: (order.recipeIds || []).map((id) => new mongoose.Types.ObjectId(id)),
            items: (order.items || []).map((item) => ({ ...item, recipeId: new mongoose.Types.ObjectId(item.recipeId) })),
            userId: order.userId ? new mongoose.Types.ObjectId(order.userId) : undefined,
        } as Partial<IOrder>);
        return this.toEntity(created);
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const updated = await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
        return updated ? this.toEntity(updated) : null;
    }

    async cancel(id: string, reason: string): Promise<Order | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        const updated = await OrderModel.findByIdAndUpdate(id, { status: "Cancelled", cancelReason: reason }, { new: true });
        return updated ? this.toEntity(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.isValidObjectId(id)) return false;
        const deleted = await OrderModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
