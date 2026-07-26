import mongoose from "mongoose";
import { ShoppingListItemMongoRepository } from "../repositories/shoppingListItem.repository";
import { AddShoppingListItemDTO } from "../dtos/shoppingListItem.dto";
import { HttpException } from "../exceptions/http-exception";
import { OrderService } from "./order.service";
import { OrderFormat } from "../models/order.model";
import { UserService } from "./user.service";
import { NotificationService } from "./notification.service";
import { RecipeMongoRepository } from "../repositories/recipe.repository";

const shoppingListRepository = new ShoppingListItemMongoRepository();
const orderService = new OrderService();
const userService = new UserService();
const notificationService = new NotificationService();
const recipeRepository = new RecipeMongoRepository();

export interface Requester {
    isPro: boolean;
    role: "admin" | "user";
}

export class ShoppingListItemService {
    async getMyList(userId: string) {
        return await shoppingListRepository.getAllForUser(userId);
    }

    async addItem(userId: string, data: AddShoppingListItemDTO, requester: Requester) {
        const recipe = await recipeRepository.getById(data.recipeId);
        if (!recipe) {
            throw new HttpException(404, "Recipe not found");
        }
        if (recipe.badge === "Pro" && requester.role !== "admin" && !requester.isPro) {
            throw new HttpException(
                403,
                "This recipe requires Pro access and can't be purchased individually."
            );
        }

        const existing = await shoppingListRepository.findByUserAndRecipe(userId, data.recipeId);
        if (existing) {
            const updated = await shoppingListRepository.updateQuantity(
                String(existing._id),
                userId,
                existing.quantity + 1
            );
            return updated!;
        }
        return await shoppingListRepository.create({
            title: data.title,
            imageUrl: data.imageUrl,
            price: recipe.price || 0,
            recipeId: new mongoose.Types.ObjectId(data.recipeId),
            userId: new mongoose.Types.ObjectId(userId),
        });
    }

    async updateQuantity(userId: string, itemId: string, quantity: number) {
        const updated = await shoppingListRepository.updateQuantity(itemId, userId, quantity);
        if (!updated) {
            throw new HttpException(404, "Shopping list item not found");
        }
        return updated;
    }

    async removeItem(userId: string, itemId: string) {
        const deleted = await shoppingListRepository.delete(itemId, userId);
        if (!deleted) {
            throw new HttpException(404, "Shopping list item not found");
        }
        return true;
    }

    async checkout(userId: string, customerName: string, format: OrderFormat) {
        const items = await shoppingListRepository.getAllForUser(userId);
        if (items.length === 0) {
            throw new HttpException(400, "Your basket is empty");
        }

        const itemSummary = items.map((item) => `${item.title} x${item.quantity}`).join(", ");
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const recipeIds = items.map((item) => String(item.recipeId));
        const order = await orderService.createOrder(
            { customer: customerName, item: itemSummary, price: totalPrice, format, recipeIds },
            userId
        );

        await userService.grantPurchasedRecipes(userId, recipeIds);

        // Physical orders get their thank-you notification when an admin accepts
        // the order (see OrderService.acceptOrder); digital orders complete
        // instantly at checkout, so send it right here instead.
        if (format === "digital") {
            await notificationService.notifyOrderAccepted(userId, order.orderNumber, "digital");
        }

        await shoppingListRepository.deleteAllForUser(userId);
        return order;
    }
}
