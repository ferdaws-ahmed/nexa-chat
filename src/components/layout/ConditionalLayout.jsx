"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { useAuth } from "@/providers/AuthContext";

/**
 * ConditionalLayout manages the high-level layout structure of the application.
 * It determines whether to show the public navbar/footer or the dashboard layout
 * based on the current route, while preventing rendering loops during role switches.
 */
export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const { isHydrated, isLoading } = useAuth();

  // Memoize the layout check to prevent unnecessary re-evaluations
  const layoutType = useMemo(() => {
    if (pathname.startsWith("/dashboard")) return "dashboard";
    if (pathname === "/login" || pathname === "/register") return "auth";
    return "public";
  }, [pathname]);

  // If auth is still initializing, show a minimal loading state to prevent layout jumps
  // and infinite redirection loops during role hydration.
  if (!isHydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-blue-500" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted animate-pulse">
            Authenticating Session
          </p>
        </div>
      </div>
    );
  }

  // Render based on layout type
  switch (layoutType) {
    case "dashboard":
      // Dashboard routes have their own internal Sidebar/Topbar in dashboard/layout.js
      return (
        <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-background transition-colors duration-300">
          {children}
        </main>
      );

    case "auth":
      // Auth pages (Login/Register) usually don't need Navbar/Footer
      return (
        <main className="flex-1 flex flex-col min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
          {/* Subtle background glow for auth pages */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
          </div>
          {children}
        </main>
      );

    default:
      // Public landing pages with Navbar and Footer
      return (
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
          <Navbar />
          <main className="grow relative overflow-hidden">{children}</main>
          <Footer />
        </div>
      );
  }
}
