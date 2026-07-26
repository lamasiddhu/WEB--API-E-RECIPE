import mongoose from "mongoose";
import { OrderModel, IOrder, OrderStatus } from "../models/order.model";

export interface IOrderRepository {
    getAll(): Promise<IOrder[]>;
    getAllForUser(userId: string): Promise<IOrder[]>;
    getById(id: string): Promise<IOrder | null>;
    create(order: Partial<IOrder>): Promise<IOrder>;
    updateStatus(id: string, status: OrderStatus): Promise<IOrder | null>;
    cancel(id: string, reason: string): Promise<IOrder | null>;
    delete(id: string): Promise<boolean>;
}

export class OrderMongoRepository implements IOrderRepository {
    async getAll(): Promise<IOrder[]> {
        return await OrderModel.find().sort({ createdAt: -1 });
    }

    async getAllForUser(userId: string): Promise<IOrder[]> {
        return await OrderModel.find({ userId }).sort({ createdAt: -1 });
    }

    async getById(id: string): Promise<IOrder | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await OrderModel.findById(id);
    }

    async create(order: Partial<IOrder>): Promise<IOrder> {
        return await OrderModel.create(order);
    }

    async updateStatus(id: string, status: OrderStatus): Promise<IOrder | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
    }

    async cancel(id: string, reason: string): Promise<IOrder | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await OrderModel.findByIdAndUpdate(id, { status: "Cancelled", cancelReason: reason }, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.isValidObjectId(id)) return false;
        const deleted = await OrderModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
