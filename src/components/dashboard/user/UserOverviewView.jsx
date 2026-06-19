"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Activity,
  ArrowUpRight,
  Zap,
} from "lucide-react";

export default function UserOverviewView() {
  const router = useRouter();
  const [stats, setStats] = useState({ activePage: null, pausedChatsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const [settingsRes, chatsRes] = await Promise.all([
          fetch("/api/dashboard/user/settings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/dashboard/user/live-chats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const settingsData = await settingsRes.json();
        const chatsData = await chatsRes.json();

        setStats({
          activePage:
            settingsData.success && settingsData.appConfig?.pageId
              ? settingsData.appConfig.pageId
              : null,
          pausedChatsCount:
            chatsData.success && chatsData.pausedConversations
              ? chatsData.pausedConversations.length
              : 0,
        });
      } catch (err) {
        console.error("Error loading overview stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-32 rounded-2xl bg-card dark:bg-surface border border-border animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-8 transition-colors duration-300 shadow-sm dark:shadow-none">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/10">
            <Zap size={12} fill="currentColor" /> Workspace Active
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            স্বাগতম আপনার NexaChat ড্যাশবোর্ডে
          </h2>
          <p className="text-xs md:text-sm text-muted leading-relaxed">
            এখানে আপনি আপনার এআই অ্যাসিস্ট্যান্টের রিয়েল-টাইম মেটা মেসেঞ্জার
            অ্যাক্টিভিটি এবং মডারেটর টেকওভার স্ট্যাটাস লাইভ মনিটর করতে পারবেন।
          </p>
        </div>
        <div className="absolute top-1/2 right-6 -translate-y-1/2 text-slate-200 dark:text-slate-700/50 hidden md:block">
          <LayoutDashboard size={140} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 flex flex-col justify-between space-y-4 shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Integration Status
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
              <Activity size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {stats.activePage ? "Facebook Active" : "No Page Linked"}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate font-mono mt-0.5">
              {stats.activePage
                ? `ID: ${stats.activePage}`
                : "ফেসবুক মেসেঞ্জার ডিসকানেক্টেড"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 flex flex-col justify-between space-y-4 shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Interventions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">
              <MessageSquare size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {stats.pausedChatsCount} Paused Chats
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              অ্যাক্টিভ মডারেটর টেকওভার সেশন
            </p>
          </div>
        </div>

        <div
          onClick={() => router.push("/dashboard/user/settings")}
          className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 flex flex-col justify-between space-y-4 cursor-pointer hover:border-blue-500/50 transition-all shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Configurations
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
              <Settings size={16} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Page Settings
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                বট এবং পেজ কনফিগার করুন
              </p>
            </div>
            <ArrowUpRight size={20} className="text-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
