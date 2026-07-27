import { z } from "zod";

export const OrderItemDTO = z.object({
    recipeId: z.string().min(1),
    title: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
});
export type OrderItemDTO = z.infer<typeof OrderItemDTO>;

export const CreateOrderDTO = z.object({
    orderNumber: z.string().min(1).optional(),
    customer: z.string().min(1, "Customer name is required"),
    item: z.string().min(1, "Item is required"),
    items: z.array(OrderItemDTO).optional(),
    price: z.number().nonnegative().optional(),
    status: z.enum(["Processing", "Completed", "Delayed", "Cancelled"]).optional(),
    format: z.enum(["digital", "physical"]).optional(),
    recipeIds: z.array(z.string()).optional(),
});
export type CreateOrderDTO = z.infer<typeof CreateOrderDTO>;

export const CancelOrderDTO = z.object({
    reason: z.string().min(1, "A cancellation reason is required"),
});
export type CancelOrderDTO = z.infer<typeof CancelOrderDTO>;
