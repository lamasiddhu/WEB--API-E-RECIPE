"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken, getStoredUser, updateStoredUser, clearSession } from "../composition/session";
import { User } from "../domain/entities";

// 1. Define the shape of your user data

// 2. Define what the Context will provide
interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
  loading: boolean;
  checkAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
}

// 3. CREATE the context (This was missing!)
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = () => {
    try {
      const token = getToken();
      const parsedUser = getStoredUser<User>();

      setUser(parsedUser);
      setIsAuthenticated(!!token);
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      updateStoredUser(partial);
      return next;
    });
  }, []);

  const logout = () => {
    clearSession();
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { isAuthenticated, user, logout, loading, checkAuth, updateUser } },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
