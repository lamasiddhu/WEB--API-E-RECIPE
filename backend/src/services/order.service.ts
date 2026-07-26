import mongoose from "mongoose";
import { OrderMongoRepository } from "../repositories/order.repository";
import { CreateOrderDTO } from "../dtos/order.dto";
import { HttpException } from "../exceptions/http-exception";
import { NotificationService } from "./notification.service";

const orderRepository = new OrderMongoRepository();
const notificationService = new NotificationService();

export class OrderService {
    async getAllOrders() {
        return await orderRepository.getAll();
    }

    async getMyOrders(userId: string) {
        return await orderRepository.getAllForUser(userId);
    }

    async createOrder(data: CreateOrderDTO, userId?: string) {
        const orderNumber = data.orderNumber || `ORD-${Date.now().toString(36).toUpperCase()}`;
        const { recipeIds, format, status, ...rest } = data;
        return await orderRepository.create({
            ...rest,
            orderNumber,
            format,
            status: status || (format === "physical" ? "Processing" : "Completed"),
            recipeIds: (recipeIds || []).map((id) => new mongoose.Types.ObjectId(id)),
            userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        });
    }

    async acceptOrder(id: string) {
        const order = await orderRepository.getById(id);
        if (!order) throw new HttpException(404, "Order not found");
        if (order.format !== "physical") {
            throw new HttpException(400, "Only physical orders require acceptance");
        }
        if (order.status === "Cancelled") {
            throw new HttpException(400, "This order was cancelled");
        }

        const updated = await orderRepository.updateStatus(id, "Completed");
        if (!updated) throw new HttpException(404, "Order not found");

        if (updated.userId) {
            await notificationService.notifyOrderAccepted(String(updated.userId), updated.orderNumber);
        }

        return updated;
    }

    async cancelOrder(id: string, reason: string) {
        const order = await orderRepository.cancel(id, reason);
        if (!order) throw new HttpException(404, "Order not found");

        if (order.userId) {
            await notificationService.notifyOrderCancelled(String(order.userId), order.orderNumber, reason);
        }

        return order;
    }

    async deleteOrder(id: string) {
        const deleted = await orderRepository.delete(id);
        if (!deleted) throw new HttpException(404, "Order not found");
        return true;
    }
}
