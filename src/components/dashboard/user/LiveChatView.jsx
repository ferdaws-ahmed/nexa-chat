"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, Play, User, Clock, AlertCircle } from "lucide-react";

export default function LiveChatView() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // ব্যাকএন্ড থেকে পজড চ্যাট ডাটা নিয়ে আসা
  const fetchLiveChats = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dashboard/user/live-chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setConversations(data.pausedConversations || []);
      } else {
        setError(data.error || "ডাটা লোড করতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      setError("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveChats();
  }, []);

  // মানুষের থেকে নিয়ন্ত্রণ বটের কাছে ফিরিয়ে দেওয়া
  const handleResumeBot = async (pageId, customerPsid) => {
    setActionLoading(customerPsid);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dashboard/user/live-chats/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pageId, customerPsid }),
      });
      const data = await res.json();

      if (data.success) {
        setConversations((prev) => prev.filter((c) => c.customerPsid !== customerPsid));
      } else {
        alert(data.error || "বট চালু করা যায়নি");
      }
    } catch (err) {
      alert("একটি ত্রুটি ঘটেছে");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Live Interventions</h2>
          <p className="text-xs text-zinc-400 mt-1">
            যেসব চ্যাটে মডারেটর মেসেজ দিয়েছেন এবং এআই বট বর্তমানে ৫ মিনিটের জন্য পজ হয়ে আছে।
          </p>
        </div>
        <button
          onClick={fetchLiveChats}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-blue-500" : ""} />
          Refresh
        </button>
      </div>

      {/* এরর রেন্ডারিং */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* মেইন বডি */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 border border-zinc-800 mb-4">
            <MessageSquare size={20} />
          </div>
          <h3 className="text-sm font-medium text-zinc-300">কোনো চ্যাট পজ করা নেই</h3>
          <p className="text-xs text-zinc-500 max-w-xs mt-1 px-4">
            এই মুহূর্তে সব কাস্টমারের সাথে আপনার এআই অ্যাসিস্ট্যান্ট সফলভাবে চ্যাট পরিচালনা করছে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversations.map((chat) => (
            <div
              key={chat.customerPsid}
              className="flex flex-col justify-between rounded-2xl border border-zinc-900 bg-zinc-900/50 p-5 hover:border-zinc-800 transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/10">
                      <User size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-zinc-200 font-mono">
                        ID: {chat.customerPsid.slice(0, 12)}...
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Page: {chat.pageId}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                    Paused
                  </span>
                </div>

                <div className="space-y-2 rounded-xl bg-zinc-950 p-3 border border-zinc-900/50 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Stopped By:</span>
                    <span className="text-zinc-300 font-medium capitalize">{chat.lastInteractionBy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Clock size={12} /> Stopped At:
                    </span>
                    <span className="text-zinc-400 font-mono">
                      {chat.lastInteractionTime
                        ? new Date(chat.lastInteractionTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleResumeBot(chat.pageId, chat.customerPsid)}
                disabled={actionLoading === chat.customerPsid}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-blue-600/5"
              >
                <Play size={12} fill="currentColor" />
                {actionLoading === chat.customerPsid ? "Resuming..." : "Resume AI Bot"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}