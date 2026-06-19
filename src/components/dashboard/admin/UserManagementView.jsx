"use client";

import React, { useState, useEffect } from "react";
import { Users, Shield, User, RefreshCw, AlertCircle } from "lucide-react";

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dashboard/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || "ইউজার লিস্ট লোড করা সম্ভব হয়নি");
      }
    } catch (err) {
      setError("সার্ভারের সাথে কানেকশন এরর ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white">System User Directory</h2>
          <p className="text-xs text-zinc-400 mt-1">
            ডাটাবেজে রেজিস্টার্ড সকল মার্চেন্ট ও এডমিনিস্ট্রেটর অ্যাকাউন্টগুলোর তালিকা।
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-blue-500" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ইউজার ডাটা টেবিল কন্টেইনার */}
      <div className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/20">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-zinc-900 bg-zinc-900/50 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">System Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-transparent text-zinc-300">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan="3" className="px-6 py-5"><div className="h-5 rounded bg-zinc-900" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-xs text-zinc-500">
                    সিস্টেমে কোনো ইউজার খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                          <User size={14} />
                        </div>
                        <span className="font-medium text-zinc-200">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border ${
                        item.role === "admin" 
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/10" 
                          : "bg-zinc-900 text-zinc-400 border-zinc-800"
                      }`}>
                        {item.role === "admin" ? <Shield size={10} /> : null}
                        <span className="capitalize">{item.role}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}