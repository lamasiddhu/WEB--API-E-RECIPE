import axios from "axios";
import axiosInstance from "./axios-instance";
import { API } from "./endpoint";
import { Recipe } from "../domain/entities";
export type ApiRecipe = Recipe;

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

export const getAllRecipes = async (search?: string) => {
    try {
        const response = await axiosInstance.get(API.RECIPES.GET_ALL, {
            params: search ? { search } : undefined,
        });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to fetch recipes"));
    }
};

export const createRecipe = async (data: Partial<ApiRecipe>) => {
    try {
        const response = await axiosInstance.post(API.RECIPES.CREATE, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to create recipe"));
    }
};

export const getAllRecipesForAdmin = async (search?: string) => {
    try {
        const response = await axiosInstance.get(API.RECIPES.GET_ALL_ADMIN, {
            params: search ? { search } : undefined,
        });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to fetch recipes"));
    }
};

export const submitRecipe = async (data: Partial<ApiRecipe>) => {
    try {
        const response = await axiosInstance.post(API.RECIPES.SUBMIT, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to submit recipe"));
    }
};

export const updateRecipe = async (id: string, data: Partial<ApiRecipe>) => {
    try {
        const response = await axiosInstance.put(API.RECIPES.UPDATE(id), data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to update recipe"));
    }
};

export const getRecipeById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.RECIPES.GET_BY_ID(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to fetch recipe"));
    }
};

export const deleteRecipe = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.RECIPES.DELETE(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to delete recipe"));
    }
};
