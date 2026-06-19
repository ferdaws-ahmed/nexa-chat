"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

/**
 * AuthContext provides centralized authentication state management
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  /**
   * Initialize auth state from cookies and localStorage
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Source 1: Cookies (set by Next.js API routes)
        const cookieToken = Cookies.get("token");
        const cookieUser = Cookies.get("user");

        // Source 2: localStorage (set by legacy or direct login)
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        const activeToken = cookieToken || storedToken;
        const activeUserStr = cookieUser || storedUser;

        if (activeToken && activeUserStr) {
          try {
            const parsedUser = typeof activeUserStr === 'string' && activeUserStr.startsWith('{') 
              ? JSON.parse(activeUserStr) 
              : activeUserStr;
            
            setToken(activeToken);
            setUser(parsedUser);
            
            // Sync both sources
            if (!storedToken) localStorage.setItem("token", activeToken);
            if (!storedUser) localStorage.setItem("user", typeof activeUserStr === 'string' ? activeUserStr : JSON.stringify(activeUserStr));
          } catch (e) {
            console.error("Failed to parse user data", e);
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuth();
      } finally {
        setIsHydrated(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Clear authentication state
   */
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Cookies.remove("token");
    Cookies.remove("user");
  }, []);

  /**
   * Set authentication state
   */
  const setAuth = useCallback((newToken, newUser) => {
    // 1. Update State immediately for responsiveness
    setToken(newToken);
    setUser(newUser);
    
    // 2. Sync localStorage (for persistence across tabs)
    if (typeof window !== 'undefined') {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
    }
    
    // 3. Sync Cookies (for middleware and server components)
    Cookies.set("token", newToken, { expires: 30, path: '/' });
    Cookies.set("user", JSON.stringify(newUser), { expires: 30, path: '/' });

    // 4. Force a router refresh to update server components, 
    // but use a small delay if needed to let cookies settle
    router.refresh();
  }, [router]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    clearAuth();
    Cookies.remove("originalAdmin");
    router.replace("/login");
  }, [clearAuth, router]);

  const value = {
    user,
    token,
    isLoading,
    isHydrated,
    setAuth,
    clearAuth,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * Always use this hook instead of direct context access
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
