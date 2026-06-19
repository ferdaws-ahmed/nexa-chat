"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// আপনার প্রজেক্টের রিয়াল Auth Context হুক দিয়ে এটি রিপ্লেস করবেন
const useAuthMock = () => {
  return { user: { id: "123", package: "inactive" }, isAuthenticated: true }; 
};

const packages = [
  {
    name: 'ফ্রি ট্রায়াল',
    price: '৳০',
    rawPrice: 0,
    duration: '/৩ দিন',
    desc: 'প্ল্যাটফর্মের সব ফিচার পরখ করে দেখার চমৎকার সুযোগ।',
    features: [
      '১টি ফেসবুক পেজ কানেক্ট',
      'সব প্রিমিয়াম ফিচারে অ্যাক্সেস',
      '৩ দিন আনলিমিটেড টেস্টিং',
      'হাইব্রিড কিওয়ার্ড ও এআইরিনপ্লাই',
      'ইনস্ট্যান্ট সেটআপ সুবিধা',
    ],
    cta: 'ফ্রি ট্রায়াল শুরু করুন',
    popular: false,
    badge: 'টেস্ট ড্রাইভ',
  },
  {
    name: 'অটোমেটিক (Keywords)',
    price: '৳৩৯৯',
    rawPrice: 399,
    duration: '/মাস',
    desc: 'নির্দিষ্ট কিওয়ার্ড এবং কম খরচে অটোমেশন সেটআপের জন্য সেরা।',
    features: [
      '১টি ফেসবুক পেজ কানেক্ট',
      'আনলিমিটেড কিওয়ার্ড ভিত্তিক রিপ্লাই',
      'কাস্টম কুইক রিপ্লাই মেনু',
      'গ্রাহক ডাটাবেজ (Inbox CRM)',
      'মেসেজ ডেলিভারি রিপোর্ট',
      'অফিসিয়াল ইমেইল সাপোর্ট',
    ],
    cta: 'پ্যাকেজটি বেছে নিন',
    popular: false,
    badge: 'বাজেট ফ্রেন্ডলি',
  },
  {
    name: 'স্মার্ট অটোমেশন',
    price: '৳৫৯৯',
    rawPrice: 599,
    duration: '/মাস',
    desc: 'ইনবক্স মেসেজ এবং কমেন্ট থেকে সরাসরি ইনবক্সে অটো-রিপ্লাই সেটআপের জন্য পারফেক্ট।',
    features: [
      '১টি ফেসবুক পেজ কানেক্ট',
      'ইনবক্স অটো-মেসেজিং সিস্টেম',
      'পোস্টের কমেন্ট থেকে অটো-ইনবক্স',
      'পোস্ট আইডি লিঙ্কিং অটোমেশন',
      'আনলিমিটেড কিওয়ার্ড ম্যাচিং',
      'কাস্টম কমেন্ট রিপ্লাই টেক্সট',
    ],
    cta: 'অটোমেশন শুরু করুন',
    popular: false,
    badge: 'সবচেয়ে ডিমানিডং',
  },
  {
    name: 'এডভান্সড এআই রিপ্লাই',
    price: '৳৯৯৯',
    rawPrice: 999,
    duration: '/মাস',
    desc: 'স্মার্ট জেনারেটিভ এআই দিয়ে কমেন্ট ও মেসেজিং সেলস সম্পূর্ণ অটোমেট করুন।',
    features: [
      '১টি ফেসবুক পেজ কানেক্ট',
      'এডভান্সড AI (Gemini) চ্যাটবট',
      'কমেন্ট ও ইনবক্সের সমন্বিত AI রিপ্লাই',
      'স্মার্ট কিওয়ার্ড ফিল্টারিং (AI Cost Saver)',
      'কাস্টম এআই প্রম্পট ও ক্যাটালগ ট্রেনিং',
      'হিউম্যান হ্যান্ডওভার (Live Chat) সিস্টেম',
    ],
    cta: 'এআই পারফেকশন নিন',
    popular: true,
    badge: 'সেরা ভ্যালু',
  },
];

const Pricing = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthMock();
  
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleActionClick = (pkg) => {
    if (!isAuthenticated) {
      toast.error("দয়া করে প্রথমে লগইন করুন।");
      router.push('/login');
      return;
    }

    if (pkg.name === 'ফ্রি ট্রায়াল') {
      setShowFreeModal(true);
    } else {
      router.push(`/dashboard/checkout?plan=${encodeURIComponent(pkg.name)}&price=${pkg.rawPrice}`);
    }
  };

 const handleConfirmFreeTrialRedirect = () => {
  setIsRedirecting(true);
  toast.success("আপনাকে ফেসবুক পেজ কানেক্ট পেজে নিয়ে যাওয়া হচ্ছে...");
  
  setShowFreeModal(false);
  setIsRedirecting(false);
  
  // 🎯 এখানে সিক্রেট ফ্ল্যাগ এবং প্যাকেজের নাম কুয়েরি হিসেবে পাঠানো হচ্ছে
  router.push('/dashboard/user/connect-page?fromPricing=true&plan=free');
};

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> আমাদের প্যাকেজসমূহ
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
             সহজ এবং সাশ্রয়ী প্ল্যান
          </h2>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">
            আপনার ফেসবুক পেজের মেসেজ ভলিউম এবং এআই-এর প্রয়োজনীয়তা অনুযায়ী সঠিক প্ল্যানটি বেছে নিন।
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-[2.5rem] border transition-all duration-500 flex flex-col justify-between group ${
                pkg.popular
                  ? 'bg-card border-primary shadow-2xl shadow-primary/15 lg:scale-105 z-10 ring-4 ring-primary/5'
                  : 'bg-card/60 backdrop-blur-md border-border hover:border-primary/40 hover:shadow-xl hover:shadow-secondary/20'
              }`}
            >
              <div
                className={`absolute top-0 left-8 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm ${
                  pkg.popular
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground border border-border'
                }`}
              >
                {pkg.badge}
              </div>

              <div>
                <div className="mb-6 pt-2">
                  <h3 className="text-xl font-black mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black tracking-tight text-foreground">
                      {pkg.price}
                    </span>
                    <span className="text-xs font-bold text-foreground/50">
                      {pkg.duration}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/60 min-h-[48px]">
                    {pkg.desc}
                  </p>
                </div>

                <hr className="border-border my-4" />

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2.5 text-sm">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                          pkg.popular
                            ? 'bg-primary/20 text-primary'
                            : 'bg-secondary text-foreground/70'
                        }`}
                      >
                        <Check size={9} strokeWidth={4} />
                      </div>
                      <span className="text-foreground/80 font-medium leading-tight">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleActionClick(pkg)}
                className={`w-full py-3.5 rounded-xl font-black text-xs tracking-wide transition-all duration-300 ${
                  pkg.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {pkg.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 📥 ফ্রি ট্রায়াল সেটআপ রিডাইরেকশন মোডাল */}
      {showFreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl max-w-md w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">পেজ সেটআপ সম্পন্ন করুন</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
              ৩ দিনের ফ্রি ট্রায়ালটি সক্রিয় করতে প্রথমে আপনার ফেসবুক পেজটি ইন্টিগ্রেট করতে হবে। <span className="font-bold text-blue-600 dark:text-blue-400">সফলভাবে পেজ কাস্টম ক্রেডেনশিয়াল দিয়ে কানেক্ট হওয়ার মুহূর্ত থেকে</span> আপনার কাউন্টডাউন ও ফ্রি ট্রায়াল লাইভ শুরু হবে।
            </p>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowFreeModal(false)} 
                disabled={isRedirecting}
                className="w-full py-3 text-sm font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                পরে করব
              </button>
              <button 
                onClick={handleConfirmFreeTrialRedirect}
                disabled={isRedirecting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> রিডাইরেক্ট হচ্ছে...
                  </>
                ) : (
                  "পেজ কানেক্ট করতে যাই"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pricing;