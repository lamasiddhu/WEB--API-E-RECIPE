import axios from "axios";
import { Review } from "../domain/entities";
import axiosInstance from "./axios-instance";
import { API } from "./endpoint";

const message = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) ? error.response?.data?.message || fallback : fallback;

export const getRecipeReviews = async (recipeId: string) => {
    try {
        return (await axiosInstance.get(API.REVIEWS.FOR_RECIPE(recipeId))).data;
    } catch (error) {
        throw new Error(message(error, "Failed to fetch reviews"));
    }
};

export const submitReview = async (recipeId: string, data: Pick<Review, "rating" | "comment">) => {
    try {
        return (await axiosInstance.post(API.REVIEWS.FOR_RECIPE(recipeId), data)).data;
    } catch (error) {
        throw new Error(message(error, "Failed to submit review"));
    }
};

export const getAllReviews = async () => {
    try {
        return (await axiosInstance.get(API.REVIEWS.GET_ALL)).data;
    } catch (error) {
        throw new Error(message(error, "Failed to fetch reviews"));
    }
};

export const updateReview = async (id: string, data: Pick<Review, "rating" | "comment">) => {
    try {
        return (await axiosInstance.put(API.REVIEWS.UPDATE(id), data)).data;
    } catch (error) {
        throw new Error(message(error, "Failed to update review"));
    }
};

export const deleteReview = async (id: string) => {
    try {
        return (await axiosInstance.delete(API.REVIEWS.DELETE(id))).data;
    } catch (error) {
        throw new Error(message(error, "Failed to delete review"));
    }
};
