import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus = "Processing" | "Completed" | "Delayed" | "Cancelled";
export type OrderFormat = "digital" | "physical";

export interface IOrderItem {
    recipeId: mongoose.Types.ObjectId;
    title: string;
    quantity: number;
    unitPrice: number;
}

export interface IOrder extends Document {
    orderNumber: string;
    customer: string;
    // Flattened summary, kept for backward compatibility with orders placed
    // before structured `items` existed, and as a quick display string.
    item: string;
    items: IOrderItem[];
    price: number;
    status: OrderStatus;
    format: OrderFormat;
    recipeIds: mongoose.Types.ObjectId[];
    userId?: mongoose.Types.ObjectId;
    cancelReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
    {
        recipeId: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
        title: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const OrderSchema: Schema = new Schema<IOrder>(
    {
        orderNumber: { type: String, required: true, unique: true },
        customer: { type: String, required: true },
        item: { type: String, required: true },
        items: { type: [OrderItemSchema], default: [] },
        price: { type: Number, default: 0 },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        cancelReason: { type: String },
        format: { type: String, enum: ["digital", "physical"], default: "digital" },
        recipeIds: { type: [Schema.Types.ObjectId], ref: "Recipe", default: [] },
        status: {
            type: String,
            enum: ["Processing", "Completed", "Delayed", "Cancelled"],
            default: "Processing",
        },
    },
    { timestamps: true }
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
