export interface ShoppingListItem {
    _id: string;
    userId: string;
    recipeId: string;
    title: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
export interface ShoppingListRequester {
    isPro: boolean;
    role: "admin" | "user";
}
