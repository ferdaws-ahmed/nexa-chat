"use client";

import React from "react";
import DashboardGuard from "@/components/dashboard/DashboardGuard";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ImpersonationBanner from "@/components/dashboard/ImpersonationBanner";
import { useAuth } from "@/providers/AuthContext";

function DashboardLayoutContent({ children, sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full bg-background text-foreground antialiased overflow-hidden transition-all duration-500 font-sans">
      <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Topbar user={user} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-background transition-all duration-500 relative scroll-smooth">
          {/* Background Cinematic Gradients (Visible in Dark Mode) */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/5 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50 dark:opacity-100" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 dark:bg-indigo-600/5 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50 dark:opacity-100" />
          
          <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10 lg:py-10 min-h-full relative z-10">
            {children}
          </div>
        </main>
        <ImpersonationBanner />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <DashboardGuard>
      <DashboardLayoutContent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </DashboardLayoutContent>
    </DashboardGuard>
  );
}
