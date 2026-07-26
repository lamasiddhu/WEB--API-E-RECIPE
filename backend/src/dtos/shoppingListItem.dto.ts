import { z } from "zod";

// price is deliberately excluded — the server always prices the item from the
// recipe record itself (see ShoppingListItemService.addItem), never the client.
export const AddShoppingListItemDTO = z.object({
    recipeId: z.string().min(1, "Recipe ID is required"),
    title: z.string().min(1, "Title is required"),
    imageUrl: z.string().optional(),
});
export type AddShoppingListItemDTO = z.infer<typeof AddShoppingListItemDTO>;

export const UpdateShoppingListItemDTO = z.object({
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
});
export type UpdateShoppingListItemDTO = z.infer<typeof UpdateShoppingListItemDTO>;

export const CheckoutShoppingListDTO = z.object({
    format: z.enum(["digital", "physical"]),
});
export type CheckoutShoppingListDTO = z.infer<typeof CheckoutShoppingListDTO>;
