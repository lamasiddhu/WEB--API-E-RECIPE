import axios from "axios";
import axiosInstance from "./axios-instance";
import { API } from "./endpoint";
import { AiRecipeCard } from "../domain/entities";
export type { AiRecipeCard } from "../domain/entities";

export interface AiSearchResult {
    message: string;
    recipes: AiRecipeCard[];
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

export const aiRecipeSearch = async (query: string) => {
    try {
        const response = await axiosInstance.post(API.AI.RECIPE_SEARCH, { query });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "The AI assistant is unavailable right now"));
    }
};
