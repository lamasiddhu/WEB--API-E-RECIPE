import { Request, Response } from "express";
import { z } from "zod";
import { CreateOrderDTO, CancelOrderDTO } from "../dtos/order.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import {
    acceptOrderUseCase,
    cancelOrderUseCase,
    createOrderUseCase,
    deleteOrderUseCase,
    getAllOrdersUseCase,
    getMyOrdersUseCase,
} from "../container";

export class OrderController {
    async getAllOrders(req: Request, res: Response) {
        try {
            const orders = await getAllOrdersUseCase.execute();
            return ApiResponseHelper.success(res, orders, "Orders fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getMyOrders(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const orders = await getMyOrdersUseCase.execute(userId);
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
            const order = await createOrderUseCase.execute(parsed.data, userId);
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
            const order = await cancelOrderUseCase.execute(String(req.params.id), parsed.data.reason);
            return ApiResponseHelper.success(res, order, "Order cancelled successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async acceptOrder(req: Request, res: Response) {
        try {
            const order = await acceptOrderUseCase.execute(String(req.params.id));
            return ApiResponseHelper.success(res, order, "Order accepted");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteOrder(req: Request, res: Response) {
        try {
            await deleteOrderUseCase.execute(String(req.params.id));
            return ApiResponseHelper.success(res, null, "Order deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
