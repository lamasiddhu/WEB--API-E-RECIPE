import axios from "axios";
import { getToken, clearSession } from "../session";

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    || "http://localhost:8089";

// Uploaded files (avatars, recipe images) are stored as paths relative to the
// backend (e.g. "/uploads/xyz.png") — resolve them against the API origin.
export const resolveAssetUrl = (path?: string): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BASE_URL}${path}`;
};

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                clearSession();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;