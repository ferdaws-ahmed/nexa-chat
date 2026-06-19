"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthContext";
import Logo from "@/components/logo/Logo";
import {
  MessageSquare, Settings, Users, LogOut, X,
  User as UserIcon, ShieldCheck, LayoutDashboard,
  Binary, MessageCircleCode, Sparkles, UserCheck, CreditCard, HelpCircle
} from "lucide-react";

export default function Sidebar({ user, isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const userRole = user?.role?.toLowerCase() || "user";
  const userPackage = user?.package?.toLowerCase() || "inactive";
  const isPageConnected = user?.isPageConnected || false;

  // প্ল্যান একটিভ এবং ফেসবুক কানেক্টেড থাকলেই কেবল ফিচার আনলক হবে
  const isFeaturesUnlocked = userPackage !== "inactive" && isPageConnected;

  const menuItems = [
    { name: "Dashboard", path: "/dashboard/user", icon: LayoutDashboard, show: true, forceUnlock: true },
    { name: "Connect Page", path: "/dashboard/user/connect-page", icon: Settings, show: true, forceUnlock: true },
    { name: "Live Chat Hub", path: "/dashboard/user/live-chat", icon: MessageSquare, show: true },
    { name: "Keywords Bot", path: "/dashboard/user/keywords-bot", icon: Binary, show: true },
    { name: "Comment Bot", path: "/dashboard/user/comment-bot", icon: MessageCircleCode, show: true },
    { name: "AI Automation", path: "/dashboard/user/ai-automation", icon: Sparkles, show: true },
    { name: "Payment History", path: "/dashboard/user/payment-history", icon: CreditCard, show: userPackage !== "inactive" && userRole !== "admin", forceUnlock: true },
    
    // Admin Routes
    { name: "Admin Control", path: "/dashboard/admin", icon: ShieldCheck, show: userRole === "admin", forceUnlock: true },
    { name: "Approvals (2FA)", path: "/dashboard/admin/approvals", icon: UserCheck, show: userRole === "admin", forceUnlock: true },
    { name: "Payment Requests", path: "/dashboard/admin/payments", icon: CreditCard, show: userRole === "admin", forceUnlock: true },
    { name: "User Directory", path: "/dashboard/admin/users", icon: Users, show: userRole === "admin", forceUnlock: true },
  ];

  const handleMenuClick = (e, item) => {
    if (userRole === "admin" || item.forceUnlock || isFeaturesUnlocked) {
      setIsOpen(false);
      return;
    }
    // ইউজার যদি ইনঅ্যাক্টিভ হয় অথবা পেজ কানেক্ট না করে ফিচার ক্লিক করে
    e.preventDefault();
    setShowLockModal(true);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />}

      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-100 dark:border-zinc-900/80 lg:static lg:translate-x-0 transition-transform" style={{ backgroundColor: isDarkMode ? "#09090b" : "#ffffff" }}>
        <div className="flex h-20 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-900/80">
          <Logo />
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-400"><X size={18} /></button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
          {menuItems.filter(i => i.show).map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} onClick={(e) => handleMenuClick(e, item)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all relative ${
                  isActive ? "bg-blue-50/70 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                }`}
              >
                <Icon size={18} strokeWidth={2.5} />
                {item.name}
                {!item.forceUnlock && !isFeaturesUnlocked && userRole !== "admin" && (
                  <span className="ml-auto text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Lock</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info badge */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900/80">
          <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current Status</p>
            <p className="text-xs font-black mt-1 uppercase text-zinc-900 dark:text-zinc-100">
              {userPackage === "inactive" ? "❌ Inactive Plan" : `🎁 Plan: ${userPackage}`}
            </p>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-3 mt-3 rounded-lg px-3 py-2 text-sm font-bold text-zinc-500 hover:text-rose-500 transition-all"><LogOut size={18} /> Sign Out</button>
        </div>
      </aside>

      {/* 🚨 ফিচার লকড অ্যালার্ট মোডাল */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={24} />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">আপনি কোনো প্ল্যান কিনেননি!</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              ড্যাশবোর্ডের প্রিমিয়াম অটোমেশন ফিচারগুলো ব্যবহার করতে দয়া করে আমাদের যেকোনো একটি প্ল্যান বেছে নিন।
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={() => { setShowLockModal(false); router.push("/#pricing"); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md">
                প্ল্যানসমূহ দেখুন
              </button>
              <button onClick={() => setShowLockModal(false)} className="w-full py-3 text-sm font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                পরে দেখব
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}