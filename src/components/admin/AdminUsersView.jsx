"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthContext";
import {
  Users,
  Search,
  MoreHorizontal,
  Shield,
  User,
  ExternalLink,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
} from "lucide-react";

const API_URL = "/api";

const AdminUsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [impersonatingId, setImpersonatingId] = useState(null);
  const router = useRouter();
  const { setAuth } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/admin/users`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @next/next/no-sync-scripts
    fetchUsers();
  }, []);

  const handleImpersonate = async (userId) => {
    try {
      setImpersonatingId(userId);
      const response = await fetch(`${API_URL}/auth/login-bypass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setAuth(data.token, data.user);
        router.push("/dashboard/user");
      } else {
        alert(data.error || "Impersonation failed");
        setImpersonatingId(null);
      }
    } catch (err) {
      alert("Error during impersonation");
      setImpersonatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            Administration
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-4">
            User Directory
            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-xl font-semibold leading-relaxed">
            Monitor and manage all NexaChat users. Access user accounts instantly for support and troubleshooting.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 w-full transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm"
            />
          </div>
          <button className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-blue-600 dark:hover:text-white transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-400/5', border: 'border-blue-100 dark:border-blue-400/10' },
          { label: 'Active Pro', value: users.filter(u => u.subscription?.plan === 'pro').length, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-400/5', border: 'border-emerald-100 dark:border-emerald-400/10' },
          { label: 'Trialing', value: users.filter(u => u.subscription?.plan === 'free').length, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-400/5', border: 'border-amber-100 dark:border-amber-400/10' },
          { label: 'System Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-400/5', border: 'border-rose-100 dark:border-rose-400/10' },
        ].map((stat, i) => (
          <div key={i} className={`relative group p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/30 transition-all duration-500 overflow-hidden shadow-sm`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={80} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-zinc-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">User Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Account Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Join Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-8"><div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-64"></div></td>
                    <td className="px-8 py-8"><div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-32"></div></td>
                    <td className="px-8 py-8"><div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-40"></div></td>
                    <td className="px-8 py-8"><div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:border-blue-500/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all overflow-hidden shadow-inner">
                            {user.role === 'admin' ? <Shield size={24} /> : <User size={24} />}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${user.isVerified ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                        </div>
                        <div>
                          <div className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2 mt-0.5 font-semibold">
                            <Mail size={12} className="text-zinc-400" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${
                          user.subscription?.plan === 'pro' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : user.subscription?.plan === 'advanced'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}>
                          {user.subscription?.plan || 'Free'}
                        </span>
                        {user.role === 'admin' && (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 dark:text-rose-500 uppercase tracking-tighter">
                            <Shield size={10} />
                            System Admin
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2.5 font-semibold">
                        <Calendar size={16} className="text-zinc-400" />
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleImpersonate(user._id)}
                          disabled={impersonatingId === user._id}
                          className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                            ${impersonatingId === user._id
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                              : 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:opacity-90 active:scale-95 shadow-lg'
                            }
                          `}
                        >
                          {impersonatingId === user._id ? (
                            <div className="h-3 w-3 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                          ) : (
                            <ArrowRightLeft size={14} />
                          )}
                          Login
                        </button>
                        <button className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-blue-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-400">
                      <Users size={48} className="opacity-10" />
                      <p className="text-lg font-medium">No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersView;
