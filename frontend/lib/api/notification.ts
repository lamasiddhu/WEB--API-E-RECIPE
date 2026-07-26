import axios from "axios";
import axiosInstance from "./axios-instance";
import { API } from "./endpoint";

export interface ApiNotification {
    _id: string;
    audience: "admin" | "user" | "all";
    recipientId?: string;
    type:
        | "pro_request"
        | "pro_approved"
        | "pro_rejected"
        | "announcement"
        | "order_cancelled"
        | "order_accepted"
        | "password_reset_requested";
    title: string;
    message: string;
    relatedUserId?: string;
    relatedUserName?: string;
    status?: "pending" | "approved" | "rejected";
    isRead: boolean;
    createdAt: string;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

export const getMyNotifications = async () => {
    try {
        const response = await axiosInstance.get(API.NOTIFICATIONS.GET_ALL);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to fetch notifications"));
    }
};

export const requestProAccess = async () => {
    try {
        const response = await axiosInstance.post(API.NOTIFICATIONS.PRO_REQUEST);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to request Pro access"));
    }
};

export const respondToProRequest = async (id: string, action: "approve" | "reject") => {
    try {
        const response = await axiosInstance.patch(API.NOTIFICATIONS.RESPOND(id), { action });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to review request"));
    }
};

export const markNotificationRead = async (id: string) => {
    try {
        const response = await axiosInstance.patch(API.NOTIFICATIONS.READ(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to update notification"));
    }
};

export const markAllNotificationsRead = async () => {
    try {
        const response = await axiosInstance.patch(API.NOTIFICATIONS.READ_ALL);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to mark all notifications as read"));
    }
};

export const clearAllNotifications = async () => {
    try {
        const response = await axiosInstance.delete(API.NOTIFICATIONS.CLEAR_ALL);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to clear notifications"));
    }
};

export const broadcastAnnouncement = async (message: string) => {
    try {
        const response = await axiosInstance.post(API.NOTIFICATIONS.ANNOUNCE, { message });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, "Failed to broadcast announcement"));
    }
};
