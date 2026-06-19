"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  Globe,
  Settings,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Link2,
  ExternalLink,
  Info,
  Key,
  Database,
  RefreshCw,
  X,
} from "lucide-react";

const FacebookIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const API_URL = "/api";

const MerchantSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/user/settings`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.appConfig);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch page configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleDisconnect = async () => {
    if (!config?._id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_URL}/dashboard/user/settings/disconnect`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({ appConfigId: config._id }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setConfig(null);
        setShowDeleteModal(false);
      } else {
        alert(data.error || "Disconnect failed");
      }
    } catch (err) {
      alert("Error during disconnect");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Globe className="text-indigo-600 dark:text-indigo-500" />
          Page Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Manage your Facebook Page integration and bot credentials.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
          <div className="h-64 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
        </div>
      ) : config ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Config Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm transition-colors">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-all"></div>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-500 shadow-xl">
                  <FacebookIcon size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    {config.pageId}
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-widest mt-1">
                    Connected Facebook Page
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/30 border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <Key size={12} />
                    Page Access Token
                  </div>
                  <div className="text-foreground font-mono text-xs truncate bg-white dark:bg-slate-950 p-2 rounded-lg border border-gray-200 dark:border-slate-800">
                    {config.pageAccessToken?.slice(0, 30)}...
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/30 border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <Shield size={12} />
                    Webhook Verify Token
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-mono text-xs truncate bg-white dark:bg-slate-950 p-2 rounded-lg border border-gray-200 dark:border-slate-800">
                    {config.webhookVerifyToken}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      Webhook Active
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                      Listening for real-time events
                    </p>
                  </div>
                </div>
                <button className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {/* AI Settings Section */}
            <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm transition-colors">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
                <Database
                  size={20}
                  className="text-indigo-600 dark:text-indigo-500"
                />
                Bot Intelligence
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/30 border border-gray-200 dark:border-slate-800 group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Settings size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        Gemini 1.5 Flash
                      </div>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">
                        Default AI Model for low-latency replies
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20">
                    Recommended
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info/Actions */}
          <div className="space-y-6">
            <div className="bg-rose-50 dark:bg-rose-600/5 border border-rose-200 dark:border-rose-500/20 rounded-[2.5rem] p-8 shadow-sm transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-rose-600/20">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Danger Zone
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">
                Disconnecting your page will stop all AI interactions and wipe
                local configuration. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-4 rounded-2xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
              >
                Disconnect Page
              </button>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm transition-colors">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 mb-4">
                <Info
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">
                  Documentation
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                Need help connecting your page? Check our{" "}
                <a
                  href="#"
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  Setup Guide <ExternalLink size={10} />
                </a>{" "}
                for detailed instructions.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-slate-900/20 border border-gray-200 dark:border-slate-800 border-dashed p-20 rounded-[3rem] text-center">
          <div className="w-20 h-20 rounded-4xl bg-white dark:bg-slate-950 flex items-center justify-center text-gray-300 dark:text-gray-700 mx-auto mb-6 border border-gray-200 dark:border-slate-800 shadow-sm">
            <Link2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-foreground">
            No Page Connected
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
            Integrate your Facebook Page with NexaChat to start automating your
            customer support with premium AI.
          </p>
          <button className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3 mx-auto">
            <FacebookIcon size={20} />
            Connect Facebook Page
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-600 dark:text-gray-400 hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-600/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-500 mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-2xl font-bold text-foreground text-center">
              Confirm Disconnect
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm mt-3 leading-relaxed">
              Are you sure you want to disconnect{" "}
              <span className="text-foreground font-bold">
                {config?.pageId}
              </span>
              ? This will immediately stop the AI from replying to your
              customers.
            </p>

            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={handleDisconnect}
                disabled={isDeleting}
                className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isDeleting ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                {isDeleting ? "Disconnecting..." : "Yes, Disconnect Page"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-foreground font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantSettings;
