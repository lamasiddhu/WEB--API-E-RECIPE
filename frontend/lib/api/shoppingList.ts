import axios from "axios";
import axiosInstance from "./axios-instance";
import { API } from "./endpoint";
import { ShoppingListItem } from "../domain/entities";
export type ApiShoppingListItem = ShoppingListItem;

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

export const getMyShoppingList = async () => {
    try {
        const response = await axiosInstance.get(API.SHOPPING_LIST.GET_ALL);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to fetch shopping list"));
    }
};

export const addToShoppingList = async (data: { recipeId: string; title: string; imageUrl?: string; price?: number }) => {
    try {
        const response = await axiosInstance.post(API.SHOPPING_LIST.ADD, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to add to shopping list"));
    }
};

export const updateShoppingListQuantity = async (id: string, quantity: number) => {
    try {
        const response = await axiosInstance.put(API.SHOPPING_LIST.UPDATE(id), { quantity });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to update quantity"));
    }
};

export const removeFromShoppingList = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.SHOPPING_LIST.DELETE(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to remove item"));
    }
};

export const checkoutShoppingList = async (format: "digital" | "physical") => {
    try {
        const response = await axiosInstance.post(API.SHOPPING_LIST.CHECKOUT, { format });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to place order"));
    }
};
