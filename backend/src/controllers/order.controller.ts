import { Request, Response } from "express";
import { z } from "zod";
import { OrderService } from "../services/order.service";
import { CreateOrderDTO, CancelOrderDTO } from "../dtos/order.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const orderService = new OrderService();

export class OrderController {
    async getAllOrders(req: Request, res: Response) {
        try {
            const orders = await orderService.getAllOrders();
            return ApiResponseHelper.success(res, orders, "Orders fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getMyOrders(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const orders = await orderService.getMyOrders(userId);
            return ApiResponseHelper.success(res, orders, "Your orders fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async createOrder(req: Request, res: Response) {
        try {
            const parsed = CreateOrderDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = req.user ? String((req.user as any)._id) : undefined;
            const order = await orderService.createOrder(parsed.data, userId);
            return ApiResponseHelper.success(res, order, "Order created successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async cancelOrder(req: Request, res: Response) {
        try {
            const parsed = CancelOrderDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const order = await orderService.cancelOrder(String(req.params.id), parsed.data.reason);
            return ApiResponseHelper.success(res, order, "Order cancelled successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async acceptOrder(req: Request, res: Response) {
        try {
            const order = await orderService.acceptOrder(String(req.params.id));
            return ApiResponseHelper.success(res, order, "Order accepted");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteOrder(req: Request, res: Response) {
        try {
            await orderService.deleteOrder(String(req.params.id));
            return ApiResponseHelper.success(res, null, "Order deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
