import axios from "axios";
import axiosInstance from "../axios-instance";
import { API } from "../endpoint";

export interface AdminUser {
    _id: string;
    fullName: string;
    email: string;
    role: "admin" | "user";
    avatarUrl?: string;
    isPro?: boolean;
    createdAt: string;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

export const getAllUsers = async (params: { page?: number; limit?: number, search?: string }) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.USERS.GET_ALL, { params });
        return response.data; // response body
    }
    catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch users'));
    }
}
export const getUserById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.USERS.GET_BY_ID(id));
        return response.data; // response body
    }
    catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch user'));
    }
}

export const createUser = async (data: { fullName: string; email: string; password: string; role?: "admin" | "user" }) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.USERS.CREATE, data);
        return response.data; // response body
    }
    catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to create user'));
    }
}

export const updateUser = async (id: string, data: { fullName?: string; email?: string; role?: "admin" | "user"; isPro?: boolean }) => {
    try {
        // Plain JSON update — no file involved here, so no multipart needed.
        const response = await axiosInstance.put(API.ADMIN.USERS.UPDATE(id), data);
        return response.data; // response body
    }
    catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to update user'));
    }
}

export const updateUserPassword = async (id: string, data: { password: string }) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.USERS.UPDATE_PASSWORD(id), data);
        return response.data; // response body
    }
    catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to update user password'));
    }
}

export const requestPasswordReset = async (id: string) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.USERS.REQUEST_PASSWORD_RESET(id));
        return response.data; // response body
    }
    catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to send password reset request'));
    }
}


export const deleteUser = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.USERS.DELETE(id));
        return response.data; // response body
    }
    catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to delete user'));
    }
}
