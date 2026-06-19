"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ShieldAlert, ArrowLeftRight, X } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";

export default function ImpersonationBanner() {
  const [originalAdmin, setOriginalAdmin] = useState(null);
  const { user, setAuth } = useAuth();
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    const adminCookie = Cookies.get("originalAdmin");
    if (adminCookie) {
      try {
        setOriginalAdmin(JSON.parse(adminCookie));
      } catch (e) {
        console.error("Failed to parse originalAdmin cookie");
      }
    } else {
      setOriginalAdmin(null);
    }
  }, [user]);

  const handleReturnToAdmin = async () => {
    try {
      setIsStopping(true);
      const response = await fetch("/api/auth/return-to-admin", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        // Clear local storage and cookies for the impersonated user
        // and set the admin data
        setAuth(data.token, data.user);
        
        // Hard redirect to admin dashboard to ensure clean state
        window.location.href = "/dashboard/admin";
      } else {
        alert(data.error || "Failed to return to admin");
        setIsStopping(false);
      }
    } catch (error) {
      console.error("Error returning to admin:", error);
      alert("An error occurred");
      setIsStopping(false);
    }
  };

  if (!originalAdmin) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-4rem)] max-w-xl animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-50 shrink-0">
              <ShieldAlert size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none mb-1">
                Viewing as {user?.name}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
                Admin Session Active
              </p>
            </div>
          </div>
          
          <button
            onClick={handleReturnToAdmin}
            disabled={isStopping}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/20
              ${isStopping ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {isStopping ? (
              <div className="h-3 w-3 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            ) : (
              <ArrowLeftRight size={14} strokeWidth={2.5} />
            )}
            Return
          </button>
        </div>
      </div>
    </div>
  );
}
