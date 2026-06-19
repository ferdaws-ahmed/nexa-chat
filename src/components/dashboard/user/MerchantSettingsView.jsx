"use client";

import React, { useState, useEffect } from "react";
import { Settings, RefreshCw, Unlink, CheckCircle2, ShieldAlert, AlertCircle } from "lucide-react";

export default function MerchantSettingsView() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [error, setError] = useState("");

  // সেটিংস ডাটা ফেচ করা
  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dashboard/user/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setConfig(data.config);
      } else {
        setError(data.error || "কনফিগারেশন লোড করতে সমস্যা হয়েছে");
      }
    } catch (err) {
      setError("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ফেসবুক পেজ ডিসকানেক্ট হ্যান্ডলার
  const handleDisconnectPage = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি ফেসবুক পেজটি ডিসকানেক্ট করতে চান? এর ফলে এআই রেসপন্স করা বন্ধ করে দেবে।")) {
      return;
    }

    setDisconnectLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dashboard/user/settings/disconnect", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setConfig(null);
        alert("ফেসবুক পেজটি সফলভাবে ডিসকানেক্ট করা হয়েছে");
      } else {
        alert(data.error || "ডিসকানেক্ট করা যায়নি");
      }
    } catch (err) {
      alert("একটি নেটওয়ার্ক ত্রুটি ঘটেছে");
    } finally {
      setDisconnectLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Integration Settings</h2>
          <p className="text-xs text-zinc-400 mt-1">
            আপনার ফেসবুক পেজ এবং এআই বটের গ্লোবাল কনফিগারেশন ম্যানেজ করুন।
          </p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-blue-500" : ""} />
          Sync Status
        </button>
      </div>

      {/* ত্রুটি বার্তা */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* লোডিং স্টেট */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-32 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse" />
          <div className="h-24 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse" />
        </div>
      ) : !config || !config.fbPageId ? (
        /* কোনো পেজ কানেক্ট করা না থাকলে */
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 text-center space-y-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 border border-zinc-800">
            <Settings size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-300">কোনো পেজ কানেক্ট করা নেই</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              আপনার মেটা ফেসবুক মেসেঞ্জার অটোমেশন সচল করতে অনবোর্ডিং ফ্লো থেকে পেজ কানেক্ট করুন।
            </p>
          </div>
        </div>
      ) : (
        /* সংযুক্ত পেজের তথ্য ও অ্যাকশন */
        <div className="space-y-6">
          {/* কানেক্টেড পেজ কার্ড */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Facebook Messenger Active</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Page ID: <span className="font-mono">{config.fbPageId}</span></p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                Connected
              </span>
            </div>
          </div>

          {/* ডেঞ্জার জোন (Disconnect Button) */}
          <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1 text-rose-400 mt-0.5">
                <ShieldAlert size={18} />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-semibold text-rose-400">Danger Zone</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  পেজ ডিসকানেক্ট করলে ফেসবুক থেকে আসা সব নতুন মেসেজের জন্য এআই রেসপন্স লক হয়ে যাবে এবং ওয়েবহুক হ্যান্ডলিং নিষ্ক্রিয় হবে।
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-rose-500/10 flex justify-end">
              <button
                onClick={handleDisconnectPage}
                disabled={disconnectLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-rose-600/5"
              >
                <Unlink size={14} />
                {disconnectLoading ? "Disconnecting..." : "Disconnect Page"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}