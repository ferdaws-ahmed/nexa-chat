"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { API_URL } from "@/lib/constants";

const LoginFormContent = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setVerifiedSuccess(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("সার্ভার থেকে সঠিক ডাটা পাওয়া যায়নি (Non-JSON)। ডেভেলপার কনসোল চেক করুন।");
      }

      if (res.ok && data.success) {
        // Update auth context and localStorage
        setAuth(data.token, data.user);

        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/user");
        }
      } else {
        setError(data.error || data.details || "লগইন করতে সমস্যা হয়েছে");
      }
    } catch (err) {
      console.error("Login Fetch Error:", err);
      // Detailed error message for network or other failures
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError("সার্ভারের সাথে সংযোগ করা সম্ভব হচ্ছে না। আপনার ইন্টারনেট কানেকশন বা সার্ভার স্ট্যাটাস চেক করুন।");
      } else {
        setError(err.message || "সার্ভারের সাথে সংযোগ করা সম্ভব হচ্ছে না");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card border border-border rounded-[2.5rem] shadow-xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-foreground mb-2">স্বাগতম!</h2>
        <p className="text-foreground/60">আপনার একাউন্টে লগইন করুন</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl text-center">
          {error}
        </div>
      )}

      {verifiedSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-2xl flex items-center justify-center gap-2">
          <CheckCircle2 size={18} />
          আপনার ইমেল সফলভাবে ভেরিফাইড হয়েছে! এখন লগইন করুন।
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80 ml-1">
            ইমেইল
          </label>
          <input
            type="email"
            required
            className="w-full px-6 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            placeholder="example@mail.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80 ml-1">
            পাসওয়ার্ড
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-6 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "লগইন করুন"}
        </button>
      </form>

      <p className="mt-8 text-center text-foreground/60">
        একাউন্ট নেই?{" "}
        <Link
          href="/register"
          className="text-primary font-bold hover:underline"
        >
          রেজিস্ট্রেশন করুন
        </Link>
      </p>
    </div>
  );
};

const LoginForm = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto p-8 bg-card border border-border rounded-[2.5rem] shadow-xl text-center">
          লোড হচ্ছে...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
};

export default LoginForm;
