"use client";

import React, { useState, useEffect } from "react";
import { Shield, Users, Server, Radio, Cpu } from "lucide-react";

export default function AdminOverviewView() {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    apiStatus: "Online",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/dashboard/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setSystemStats((prev) => ({
            ...prev,
            totalUsers: data.users.length,
          }));
        }
      } catch (err) {
        console.error("Failed to load system admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminOverview();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Admin Overview
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monitor global user traffic, system health, and API status in
          real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <div className="h-48 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl animate-pulse"></div>
          </>
        ) : (
          <>
            {/* মেট্রিক ১: অল ইউজার্স */}
            <div className="group relative p-6 rounded-xl bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md dark:hover:shadow-lg">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  <Users size={18} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-foreground">
                  {systemStats.totalUsers}
                </h3>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Platform members
                </span>
              </div>
            </div>

            {/* মেট্রিক ২: গ্লোবাল নোড হেলথ */}
            <div className="group relative p-6 rounded-xl bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md dark:hover:shadow-lg">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <Server size={18} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  Core Engine
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <h3 className="text-xl font-bold text-foreground">
                  Operational
                </h3>
              </div>
            </div>

            {/* মেট্রিক ৩: মেটা এপিআই গেটওয়ে */}
            <div className="group relative p-6 rounded-xl bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md dark:hover:shadow-lg">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  <Cpu size={18} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  Meta Gateway
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-blue-500 animate-pulse" />
                <h3 className="text-xl font-bold text-foreground">
                  v20.0 Active
                </h3>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
