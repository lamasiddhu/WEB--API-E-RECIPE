import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus = "Processing" | "Completed" | "Delayed" | "Cancelled";
export type OrderFormat = "digital" | "physical";

export interface IOrder extends Document {
    orderNumber: string;
    customer: string;
    item: string;
    price: number;
    status: OrderStatus;
    format: OrderFormat;
    recipeIds: mongoose.Types.ObjectId[];
    userId?: mongoose.Types.ObjectId;
    cancelReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>(
    {
        orderNumber: { type: String, required: true, unique: true },
        customer: { type: String, required: true },
        item: { type: String, required: true },
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
