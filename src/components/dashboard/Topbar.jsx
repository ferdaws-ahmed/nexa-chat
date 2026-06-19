"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";

export default function Topbar({ user, setSidebarOpen }) {
  const pathname = usePathname();

  // ইউআরএল পাথ থেকে ডাইনামিক হেডিং জেনারেট করা
  const getPageHeading = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Workspace Overview";

    const lastSegment = segments[segments.length - 1];
    return lastSegment.replace("-", " ");
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-200 dark:border-zinc-900/80 px-6 lg:px-10 bg-white dark:bg-[#09090b] transition-all duration-300 z-30">
      
      {/* বাম পাশ: মোবাইল মেনু টগল এবং ডাইনামিক টাইটেল */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden cursor-pointer transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-50 dark:bg-[#121214]"
        >
          <Menu size={18} />
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <span>Nexachat</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-zinc-400 dark:text-zinc-500">Dashboard</span>
          </div>
          
          <h1 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 capitalize tracking-tight">
            {getPageHeading()}
          </h1>
        </div>
      </div>
      
      {/* ডান পাশ: নোটিফিকেশন আইকন এবং নোড স্ট্যাটাস */}
      <div className="flex items-center gap-3">
        <div className="flex items-center mr-2">
          <ThemeToggle />
        </div>
        
        {/* রিয়েল-টাইম সিস্টেম স্ট্যাটাস ইন্ডিকেটর */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-100/60 dark:border-emerald-500/10 transition-all">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> 
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
        </div>

        {/* নোটিফিকেশন বেল */}
        <button 
          className="relative rounded-lg p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800 group shadow-sm bg-zinc-50 dark:bg-[#121214]"
        >
          <Bell size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
        </button>
      </div>
    </header>
  );
}