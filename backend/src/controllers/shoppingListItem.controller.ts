import { Request, Response } from "express";
import { z } from "zod";
import { AddShoppingListItemDTO, UpdateShoppingListItemDTO, CheckoutShoppingListDTO } from "../dtos/shoppingListItem.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { addShoppingListItemUseCase, checkoutShoppingListUseCase, getMyShoppingListUseCase, removeShoppingListItemUseCase, updateShoppingListQuantityUseCase } from "../container";

export class ShoppingListItemController {
    async getMyList(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const items = await getMyShoppingListUseCase.execute(userId);
            return ApiResponseHelper.success(res, items, "Shopping list fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async addItem(req: Request, res: Response) {
        try {
            const parsed = AddShoppingListItemDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            const requester = { isPro: !!(req.user as any).isPro, role: (req.user as any).role };
            const item = await addShoppingListItemUseCase.execute(userId, parsed.data, requester);
            return ApiResponseHelper.success(res, item, "Added to shopping list", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updateQuantity(req: Request, res: Response) {
        try {
            const parsed = UpdateShoppingListItemDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            const item = await updateShoppingListQuantityUseCase.execute(userId, String(req.params.id), parsed.data.quantity);
            return ApiResponseHelper.success(res, item, "Quantity updated");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async removeItem(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            await removeShoppingListItemUseCase.execute(userId, String(req.params.id));
            return ApiResponseHelper.success(res, null, "Item removed");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async checkout(req: Request, res: Response) {
        try {
            const parsed = CheckoutShoppingListDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            const customerName = (req.user as any).fullName || "Chef";
            const order = await checkoutShoppingListUseCase.execute(userId, customerName, parsed.data.format);
            return ApiResponseHelper.success(res, order, "Order placed successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
