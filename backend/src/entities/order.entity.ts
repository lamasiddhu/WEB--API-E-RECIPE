export type OrderStatus = "Processing" | "Completed" | "Delayed" | "Cancelled";
export type OrderFormat = "digital" | "physical";

export interface OrderItem {
    recipeId: string;
    title: string;
    quantity: number;
    unitPrice: number;
}

export interface Order {
    _id: string;
    orderNumber: string;
    customer: string;
    item: string;
    items: OrderItem[];
    price: number;
    status: OrderStatus;
    format: OrderFormat;
    recipeIds: string[];
    userId?: string;
    cancelReason?: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
