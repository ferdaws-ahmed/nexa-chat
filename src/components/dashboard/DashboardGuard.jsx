"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthContext";

/**
 * DashboardGuard protects dashboard routes
 * - Verifies authentication
 * - Enforces role-based access
 * - Handles redirects WITHOUT causing infinite loops
 */
export const DashboardGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isLoading, isHydrated } = useAuth();

  useEffect(() => {
    // Wait for hydration to complete
    if (!isHydrated || isLoading) {
      return;
    }

    // Not authenticated
    if (!token || !user) {
      router.replace("/login");
      return;
    }

    const userRole = user.role?.toLowerCase();

    // Handle role-based routing for the bare dashboard path
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      if (userRole === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/user");
      }
      return;
    }

    // Protect admin routes
    if (pathname.startsWith("/dashboard/admin")) {
      if (userRole !== "admin") {
        router.replace("/dashboard/user");
        return;
      }
    }

    // Regular users can access /dashboard/user routes, 
    // and admins can also access them if needed.
  }, [isHydrated, isLoading, user, token, pathname, router]);

  // Show loading spinner while hydrating or loading
  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-400 transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-blue-500" />
          <p className="text-xs tracking-widest text-zinc-500 dark:text-zinc-600 uppercase font-mono animate-pulse">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect via useEffect
  if (!token || !user) {
    return null; // Return null while redirect happens
  }

  // Authenticated and authorized - render children
  return children;
};

export default DashboardGuard;
