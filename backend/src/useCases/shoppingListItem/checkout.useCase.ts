import { OrderFormat } from "../../entities/order.entity";
import { Order } from "../../entities/order.entity";
import { CreateOrderInput } from "../inputs";
import { ApplicationError } from "../../exceptions/application-error";
import { IShoppingListItemRepository } from "../../ports/repositories/shoppingListItem.repository.port";
export class CheckoutShoppingListUseCase {
    constructor(
        private readonly repository: IShoppingListItemRepository,
        private readonly createOrder: { execute(data: CreateOrderInput, userId?: string): Promise<Order> },
        private readonly users: { grantPurchasedRecipes(id: string, recipeIds: string[]): Promise<unknown> },
        private readonly notifyAccepted: { execute(userId: string, orderNumber: string, format?: OrderFormat): Promise<unknown> },
    ) {}
    async execute(userId: string, customerName: string, format: OrderFormat) {
        const items = await this.repository.getAllForUser(userId);
        if (!items.length) throw new ApplicationError(400, "Your basket is empty");
        const recipeIds = items.map((item) => item.recipeId);
        const order = await this.createOrder.execute({
            customer: customerName,
            item: items.map((item) => `${item.title} x${item.quantity}`).join(", "),
            items: items.map((item) => ({ recipeId: item.recipeId, title: item.title, quantity: item.quantity, unitPrice: item.price })),
            price: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            format, recipeIds,
        }, userId);
        await this.users.grantPurchasedRecipes(userId, recipeIds);
        // Physical orders get their thank-you notification when an admin accepts
        // the order; digital orders complete instantly at checkout, so send it right here instead.
        if (format === "digital") await this.notifyAccepted.execute(userId, order.orderNumber, "digital");
        await this.repository.deleteAllForUser(userId);
        return order;
    }
}
