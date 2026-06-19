'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../logo/Logo';
import ThemeToggle from '../theme/ThemeToggle';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // ডার্ক মোড ট্র্যাক করার স্টেট
  const dropdownRef = useRef(null);

  const userRole = user?.role?.toLowerCase();
  const dashboardLink = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/user';

  useEffect(() => {
    // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ করার লজিক
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // HTML ট্যাগে 'dark' ক্লাস আছে কিনা তা মনিটর করার জন্য এই ইফেক্ট
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // শুরুতে একবার চেক করবে
    checkTheme();

    // থিম টগল বাটনে ক্লিক করলে যেন নববার বুঝতে পারে, সেজন্য একটি Observer বসানো হলো
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <nav 
      className="sticky top-0 z-50 w-full border-b border-zinc-200/60 dark:border-zinc-800/80 backdrop-blur-md shadow-sm shadow-zinc-200/20 dark:shadow-none transition-all"
      // ডার্ক মোড ট্রু হলে ট্রান্সপারেন্ট বা ডার্ক কালার হবে, লাইট মোড হলে একদম পিওর সাদা হবে
      style={{ backgroundColor: isDarkMode ? 'rgba(9, 9, 11, 0.8)' : '#ffffff' }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 ml-4">
          <ThemeToggle />

          {isAuthenticated && user ? (
            /* Logged In State */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User size={16} />
                </div>
                <span className="text-sm font-medium hidden sm:inline max-w-[100px] truncate">
                  {user?.name || 'আমার প্রোফাইল'}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">রোল</p>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 capitalize">{userRole}</p>
                  </div>

                  <Link
                    href={dashboardLink}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    ড্যাশবোর্ড
                  </Link>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer mt-1"
                  >
                    <LogOut size={16} />
                    লগআউট
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out State */
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/10 active:scale-95"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;