import axios from "axios";
import axiosInstance from "./axios-instance";
import { API } from "./endpoint"; // ✅ FIXED: endpoint (singular)

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

// E-Recipe Registration Service
export const register = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.AUTH.REGISTER, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Registration failed');
    }
}

// E-Recipe Login Service
export const login = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.AUTH.LOGIN, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Login failed');
    }
}

// Sign in (or auto-register) using a verified Google ID token
export const loginWithGoogle = async (idToken: string) => {
    try {
        const response = await axiosInstance.post(API.AUTH.GOOGLE_LOGIN, { idToken });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Google sign-in failed');
    }
}

// Fetch the logged-in user's own profile
export const getMe = async () => {
    try {
        const response = await axiosInstance.get(API.AUTH.ME);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch profile'));
    }
}

export interface NotificationPreferencesInput {
    email?: boolean;
    push?: boolean;
    recipeRecommendations?: boolean;
    weeklyDigest?: boolean;
}

// Update the logged-in user's own profile
export const updateMe = async (data: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    phone?: string;
    bio?: string;
    isProfilePublic?: boolean;
    isPro?: boolean;
    notificationPreferences?: NotificationPreferencesInput;
}) => {
    try {
        const response = await axiosInstance.put(API.AUTH.ME, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to update profile'));
    }
}

// Toggle a recipe as one of the logged-in user's favorites
export const addFavorite = async (recipeId: string) => {
    try {
        const response = await axiosInstance.post(API.AUTH.FAVORITES(recipeId));
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to add favorite'));
    }
}

export const removeFavorite = async (recipeId: string) => {
    try {
        const response = await axiosInstance.delete(API.AUTH.FAVORITES(recipeId));
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to remove favorite'));
    }
}

// Change the logged-in user's own password
export const changeMyPassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
        const response = await axiosInstance.put(API.AUTH.CHANGE_PASSWORD, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to change password'));
    }
}

// Set a new password after an admin-triggered reset request (no current password needed)
export const setNewPassword = async (newPassword: string) => {
    try {
        const response = await axiosInstance.put(API.AUTH.SET_NEW_PASSWORD, { newPassword });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to set new password'));
    }
}

// Forgot password flow (no login required): request a 6-digit code by email
export const requestPasswordResetCode = async (email: string) => {
    try {
        const response = await axiosInstance.post(API.AUTH.FORGOT_PASSWORD, { email });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to request reset code'));
    }
}

export const verifyResetCode = async (email: string, code: string) => {
    try {
        const response = await axiosInstance.post(API.AUTH.VERIFY_RESET_CODE, { email, code });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Invalid or expired code'));
    }
}

export const resetPasswordWithCode = async (email: string, code: string, newPassword: string) => {
    try {
        const response = await axiosInstance.post(API.AUTH.RESET_PASSWORD_CODE, { email, code, newPassword });
        return response.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to reset password'));
    }
}