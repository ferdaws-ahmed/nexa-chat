"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link2, CheckCircle2, Clock, Loader2, RefreshCw, ArrowRight, Lock, Key, LayoutGrid, Info, Users, Tag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// 🛡️ মূল ইন্টারফেস মডিউল
function ConnectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ১. কুয়েরি প্যারামিটার থেকে ডাটা রিড
  const fromPricing = searchParams.get('fromPricing') === 'true';
  const selectedPlan = searchParams.get('plan');

  const [user, setUser] = useState({
    package: 'inactive', 
    isPageConnected: false,
    fbPageName: '',
    packageExpiresAt: null,
    fbMetadata: null 
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // ম্যানুয়াল ইনপুট স্টেট
  const [fbCredentials, setFbCredentials] = useState({
    appId: '',
    pageId: '',
    accessToken: ''
  });

  // ইউজার প্রোফাইল লোড
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/user/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      setUser((prev) => ({ ...prev, package: 'inactive' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // লাইভ কাউন্টডাউন টাইমার
  useEffect(() => {
    if (!user.packageExpiresAt) return;
    const interval = setInterval(() => {
      const difference = new Date(user.packageExpiresAt) - new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user.packageExpiresAt]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // 💡 Permanent Access Token বা ID পেস্ট করার সময় যেন কোনো এক্সট্রা স্পেস বা নিউলাইন এরর না ঘটায়
    setFbCredentials(prev => ({ ...prev, [name]: value.replace(/\s+/g, '') }));
  };

  // 🚀 ম্যানুয়াল সাবমিশন এবং রিয়াল মেটা ভেরিফিকেশন হ্যান্ডলার
  const handleManualConnect = async (e) => {
    e.preventDefault();
    if (!fbCredentials.appId || !fbCredentials.pageId || !fbCredentials.accessToken) {
      toast.error("অনুগ্রহ করে সবকটি ইনপুট ফিল্ড সঠিকভাবে পূরণ করুন।");
      return;
    }

    setIsConnecting(true);
    const loadingToast = toast.loading("মেটা ডেভেলপার এপিআই ভেরিফাই করা হচ্ছে...");

    try {
      const response = await axios.post('/api/facebook/connect', {
        ...fbCredentials,
        requestedPlan: selectedPlan || 'free'
      });
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success("অভিনন্দন! পেজটি সফলভাবে মেটার মাধ্যমে ভেরিফাইড হয়েছে।");
        window.location.reload(); 
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || "ভুল আইডি বা টোকেন দেওয়া হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // 🛡️ সিকিউরিটি গেটওয়ে: ইউজার যদি ডিরেক্ট সাইডবার থেকে আসে এবং পেজ আগে থেকে কানেক্ট করা না থাকে
  if (!fromPricing && !user.isPageConnected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <div className="bg-card border border-border p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground">কোনো প্যাকেজ সিলেক্ট করা নেই!</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              ফেসবুক পেজ কানেক্ট বা অটোমেশন সেটআপ করতে প্রথমে আপনাকে যেকোনো একটি ফ্রি বা পেইড প্যাকেজ বেছে নিতে হবে।
            </p>
          </div>
          <button 
            onClick={() => router.push('/#pricing')} 
            className="w-full py-4 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            প্যাকেজ সিলেক্ট করতে যান <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-foreground">ফেসবুক পেজ অটোমেশন সেটআপ</h1>
        <p className="text-sm text-foreground/60 mt-1">কাস্টম মেটা গ্রাফ ক্রেডেনশিয়াল ভেরিফিকেশন প্যানেল।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Main Connection Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {user.isPageConnected ? (
            /* 🟢 Connected UI: পেজ কানেক্ট হলে মেটাডাটা সহ এটি শো করবে */
            <div className="space-y-6">
              <div className="bg-card border border-emerald-500/20 p-6 rounded-[2rem] bg-emerald-500/5 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-foreground">{user.fbPageName}</h4>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">সফলভাবে সংযুক্ত (এআই বট সচল আছে)</p>
                  </div>
                </div>

                {/* 📊 ফেসবুক পেজের মেটাডাটা ডিসপ্লে গ্রিড */}
                {user.fbMetadata && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-card/50 border border-border p-4 rounded-2xl flex items-center gap-3">
                      <Users size={20} className="text-primary" />
                      <div>
                        <span className="block text-[10px] font-bold text-foreground/40 uppercase">মোট ফলোয়ার</span>
                        <span className="text-sm font-black text-foreground">{user.fbMetadata.followers_count ?? '0'}</span>
                      </div>
                    </div>
                    <div className="bg-card/50 border border-border p-4 rounded-2xl flex items-center gap-3">
                      <Tag size={20} className="text-primary" />
                      <div>
                        <span className="block text-[10px] font-bold text-foreground/40 uppercase">ক্যাটাগরি</span>
                        <span className="text-sm font-black text-foreground line-clamp-1">{user.fbMetadata.category || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-card/50 border border-border p-4 rounded-2xl flex items-center gap-3">
                      <Info size={20} className="text-primary" />
                      <div>
                        <span className="block text-[10px] font-bold text-foreground/40 uppercase">পেজ আইডি</span>
                        <span className="text-xs font-mono font-bold text-foreground/70">{user.fbMetadata.id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowManualForm(!showManualForm)}
                className="inline-flex items-center gap-2 text-xs font-bold border border-border bg-secondary text-foreground px-5 py-3.5 rounded-xl hover:bg-foreground hover:text-background transition-all"
              >
                <RefreshCw size={14} /> কনফিগারেশন পরিবর্তন / আপডেট করুন
              </button>
            </div>
          ) : (
            /* 🔴 Disconnected UI */
            <div className="bg-card border border-border rounded-[2rem] p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Link2 size={32} />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-lg font-black text-foreground">অটোমেশন ইন্টিগ্রেশন পেন্ডিং</h4>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  আপনার নির্বাচিত প্ল্যানটি চালু করতে এবং মেটা এআই কি-ওয়ার্ড ইঞ্জিন অ্যাক্টিভেট করতে নিচের বাটনে ক্লিক করে ম্যানুয়ালি পেজ কানেক্ট সম্পন্ন করুন।
                </p>
              </div>

              {!showManualForm && (
                <button
                  onClick={() => setShowManualForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg shadow-blue-600/10 transition-all"
                >
                  ম্যানুয়ালি মেটা ক্রেডেনশিয়াল সেটআপ করুন
                </button>
              )}
            </div>
          )}

          {/* 📝 ড্রপডাউন ফর্ম */}
          {showManualForm && (
            <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="border-b border-border pb-3">
                <h3 className="text-md font-black text-foreground flex items-center gap-2">
                  <Key size={18} className="text-primary" /> মেটা গ্রাফ ক্রেডেনশিয়াল ফর্ম
                </h3>
              </div>

              <form onSubmit={handleManualConnect} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                      <LayoutGrid size={14} className="text-foreground/40" /> Facebook App ID
                    </label>
                    <input 
                      type="text" 
                      name="appId"
                      value={fbCredentials.appId}
                      onChange={handleInputChange}
                      placeholder="যেমন: 154879632541"
                      className="w-full px-4 py-3 text-sm bg-secondary/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                      <Link2 size={14} className="text-foreground/40" /> Facebook Page ID
                    </label>
                    <input 
                      type="text" 
                      name="pageId"
                      value={fbCredentials.pageId}
                      onChange={handleInputChange}
                      placeholder="যেমন: 102547896321"
                      className="w-full px-4 py-3 text-sm bg-secondary/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                    <Key size={14} className="text-foreground/40" /> Permanent Page Access Token
                  </label>
                  <textarea 
                    name="accessToken"
                    value={fbCredentials.accessToken}
                    onChange={handleInputChange}
                    placeholder="EAAZB..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm bg-secondary/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-foreground"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-4 rounded-xl shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> মেটা গ্রাফ এপিআই চেক করা হচ্ছে...
                    </>
                  ) : (
                    "ক্রেডেনশিয়াল ভেরিফাই এবং কানেক্ট করুন"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Package Meta & Counter Card */}
        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-wider">নির্বাচিত প্যাকেজ</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full mt-2 capitalize">
              {user.package === 'inactive' ? '🎁 ৩ দিনের ফ্রি ট্রায়াল (পেন্ডিং)' : `⚡ ${user.package}`}
            </div>
          </div>

          <hr className="border-border" />

          <div>
            <h4 className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={14} className="text-foreground/50" /> মেয়াদের কাউন্টডাউন
            </h4>

            {user.packageExpiresAt ? (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-secondary/60 p-2 rounded-xl"><span className="block text-lg font-black text-foreground">{timeLeft.days}</span><span className="text-[9px] font-bold text-foreground/40">দিন</span></div>
                <div className="bg-secondary/60 p-2 rounded-xl"><span className="block text-lg font-black text-foreground">{timeLeft.hours}</span><span className="text-[9px] font-bold text-foreground/40">ঘণ্টা</span></div>
                <div className="bg-secondary/60 p-2 rounded-xl"><span className="block text-lg font-black text-foreground">{timeLeft.minutes}</span><span className="text-[9px] font-bold text-foreground/40">মিনিট</span></div>
                <div className="bg-secondary/60 p-2 rounded-xl"><span className="block text-lg font-black text-foreground">{timeLeft.seconds}</span><span className="text-[9px] font-bold text-foreground/40">সেকেন্ড</span></div>
              </div>
            ) : (
              <div className="text-xs text-foreground/50 italic py-2">
                ⚠️ পেজটি মেটা এপিআই দ্বারা সফলভাবে ভেরিফাই হওয়ার পর কাউন্টডাউন শুরু হবে।
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// 📦 ২. Next.js useSearchParams() সেফটি হ্যান্ডলিংয়ের জন্য মেইন এক্সপোর্ট র‍্যাপার
export default function ConnectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <ConnectPageContent />
    </Suspense>
  );
}