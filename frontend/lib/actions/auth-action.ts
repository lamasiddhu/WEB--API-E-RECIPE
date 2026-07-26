"use server";

import { register, login } from "@/lib/api/auth"; // ✅ FIXED: correct path

export const handleRegisterUser = async (data: any) => {
    try {
        const result = await register(data);

        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || 'Registration failed' };
        }
    } catch (error: Error | any) {
        return { success: false, message: error?.message || 'Registration failed' };
    }
}

// Session storage (token/user) is written client-side by the caller after
// this resolves — a server action can't touch the browser's sessionStorage.
export const handleLoginUser = async (data: any) => {
    try {
        const result = await login(data);

        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || 'Login failed' };
        }
    } catch (error: Error | any) {
        return { success: false, message: error?.message || 'Login failed' };
    }
}
