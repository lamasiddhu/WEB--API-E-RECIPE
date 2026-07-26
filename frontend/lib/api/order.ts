import axios from "axios";
import axiosInstance from "./axios-instance";
import { API } from "./endpoint";

export interface ApiOrder {
    _id: string;
    orderNumber: string;
    customer: string;
    item: string;
    price?: number;
    status: "Processing" | "Completed" | "Delayed" | "Cancelled";
    createdAt?: string;
    cancelReason?: string;
    format?: "digital" | "physical";
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

export const getAllOrders = async () => {
    try {
        const response = await axiosInstance.get(API.ORDERS.GET_ALL);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to fetch orders"));
    }
};

export const getMyOrders = async () => {
    try {
        const response = await axiosInstance.get(API.ORDERS.GET_MINE);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to fetch your orders"));
    }
};

export const createOrder = async (data: Partial<ApiOrder>) => {
    try {
        const response = await axiosInstance.post(API.ORDERS.CREATE, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to create order"));
    }
};

export const cancelOrder = async (id: string, reason: string) => {
    try {
        const response = await axiosInstance.patch(API.ORDERS.CANCEL(id), { reason });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to cancel order"));
    }
};

export const acceptOrder = async (id: string) => {
    try {
        const response = await axiosInstance.patch(API.ORDERS.ACCEPT(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to accept order"));
    }
};

export const deleteOrder = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ORDERS.DELETE(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to delete order"));
    }
};
