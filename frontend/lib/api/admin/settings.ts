import axios from "axios";
import axiosInstance from "../axios-instance";
import { API } from "../endpoint";
export type { AppSettings } from "../../domain/entities";

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

export const getAppSettings = async () => {
    try {
        const response = await axiosInstance.get(API.ADMIN.SETTINGS.GET);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to fetch settings"));
    }
};

export const setMaintenanceMode = async (maintenanceMode: boolean) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.SETTINGS.SET_MAINTENANCE_MODE, { maintenanceMode });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to update maintenance mode"));
    }
};

export const clearSystemCache = async () => {
    try {
        const response = await axiosInstance.post(API.ADMIN.SETTINGS.CLEAR_CACHE);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to clear cache"));
    }
};
