"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "../logo/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      className="w-full relative border-t border-zinc-100 dark:border-zinc-900/80 mt-auto transition-all duration-300 overflow-hidden"
      style={{ backgroundColor: isDarkMode ? "#09090b" : "#ffffff" }}
    >
      {/* ইউনিক ব্যাকগ্রাউন্ড গ্রিড ইফেক্ট (যা ফুটারকে প্রিমিয়াম লুক দেবে) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* নববারের সাথে ১০০% নিখুঁত এলাইনমেন্ট */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        
        {/* মেইন লেআউট */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-zinc-100 dark:border-zinc-900/50">
          
          {/* কলাম ১: লোগো ও ইন্টেলিজেন্ট স্লোগান (Takes 6 columns) */}
          <div className="md:col-span-6 space-y-4">
            <div className="inline-block transform hover:scale-[1.01] transition-transform">
              <Logo />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium max-w-sm leading-relaxed">
              নেক্সট-জেনারেশন এআই চ্যাটবট সলিউশন। কাস্টমার সাপোর্ট অটোমেট করুন এবং আপনার ব্যবসার প্রবৃদ্ধি নিশ্চিত করুন।
            </p>
          </div>

          {/* কলাম ২: কোম্পানি লিংকস (Takes 3 columns) */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-500 uppercase tracking-[0.1em]">
              কোম্পানি
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/about" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  যোগাযোগ করুন
                </Link>
              </li>
            </ul>
          </div>

          {/* কলাম ৩: লিগ্যাল লিংকস (Takes 3 columns) */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-500 uppercase tracking-[0.1em]">
              আইনি তথ্য
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/privacy" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  প্রাইভেসি পলিসি
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  টার্মস অফ সার্ভিস
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* বটম বার: কপিরাইট এবং আপনার নাম */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* কপিরাইট */}
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 order-2 sm:order-1">
            © {currentYear} <span className="text-zinc-700 dark:text-zinc-300 font-bold">নেক্সাচ্যাট</span>. সর্বস্বত্ব সংরক্ষিত।
          </p>
          
          {/* ক্রেডিট ব্যাজ (Made by Alif Mahmud) */}
          <div 
  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800/60 text-[11px] font-medium text-zinc-900 dark:text-zinc-400 order-1 sm:order-2 shadow-sm transition-all duration-200"
  // ক্লাসের bg-white বাদ দিয়ে সরাসরি এখানে ডাইনামিক ব্যাকগ্রাউন্ড সেট করা হলো
  style={{ backgroundColor: isDarkMode ? "rgba(24, 24, 27, 0.5)" : "#ffffff" }} 
>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>
  Made by{" "}
  <span 
    className="font-bold"
    // লাইট মোডে একদম ডিপ ব্ল্যাক (zinc-950) এবং ডার্ক মোডে উজ্জ্বল সাদা (zinc-100) কালার লক করা হলো
    style={{ color: isDarkMode ? "#f4f4f5" : "#09090b" }}
  >
    Alif Mahmud
  </span>
</span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;