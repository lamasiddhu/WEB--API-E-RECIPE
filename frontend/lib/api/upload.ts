import axios from "axios";
import axiosInstance from "./axios-instance";
import { API } from "./endpoint";

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

export const uploadFile = async (file: File): Promise<{ url: string }> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosInstance.post(API.UPLOAD, formData, {
            // Let the browser set the multipart boundary itself.
            headers: { "Content-Type": undefined },
        });
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to upload file"));
    }
};
