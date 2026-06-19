"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CreditCard, CheckCircle2, ArrowLeft, Loader2, Copy } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL থেকে প্ল্যান এবং প্রাইস গেট করা
  const planName = searchParams.get('plan') || 'স্মার্ট অটোমেশন';
  const amount = searchParams.get('price') || '৫৯৯';

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  // আপনার পার্সোনাল/মার্চেন্ট বিকাশ নাম্বার
  const bkashNumber = "017XXXXXXXX"; 

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(bkashNumber);
    toast.success("বিকাশ নাম্বারটি কপি করা হয়েছে!");
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        planName,
        amount: Number(amount),
        tnxId: data.tnxId,
        senderNumber: data.senderNumber,
        screenshotUrl: "" // যদি ক্লাউডিনারি ইন্টিগ্রেশন পরে করেন, এখানে ইমেজ লিঙ্ক বসবে
      };

      const response = await axios.post('/api/payment/checkout', payload);
      
      if (response.data.success) {
        toast.success(response.data.message, { duration: 6000 });
        router.push('/dashboard'); // অথবা পেন্ডিং স্ট্যাটাস দেখানোর পেজে পুশ করুন
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "পেমেন্ট সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-card border border-border rounded-[2rem] p-6 sm:p-10 shadow-xl relative">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> ফিরে যান
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-pink-500/10 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">ম্যানুয়াল বিকাশ পেমেন্ট</h2>
          <p className="text-sm text-foreground/60 mt-1">NexaChat প্রিমিয়াম সাবস্ক্রিপশন চালু করুন</p>
        </div>

        {/* Plan Summary Badge */}
        <div className="bg-secondary/40 border border-border rounded-2xl p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">নির্বাচিত প্ল্যান</p>
            <h4 className="text-lg font-black text-foreground mt-0.5">{planName}</h4>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">মোট প্রদেয়</p>
            <h4 className="text-2xl font-black text-primary mt-0.5">৳{amount}</h4>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-pink-500/5 border border-pink-500/20 rounded-2xl p-4 mb-6 space-y-3">
          <h5 className="text-sm font-bold text-pink-600 flex items-center gap-2">বিকাশ পেমেন্ট নিয়মাবলী:</h5>
          <ol className="text-xs text-foreground/70 space-y-2 list-decimal list-inside leading-relaxed">
            <li>নিচে দেওয়া বিকাশ নাম্বারে <span className="font-bold text-pink-600">Send Money</span> করুন।</li>
            <li>টাকা পাঠানোর পর বিকাশ থেকে প্রাপ্ত <span className="font-bold">Transaction ID (TrxID)</span> এবং আপনার নাম্বারটি নিচের ফর্মে ইনপুট দিন।</li>
          </ol>
          <div className="pt-2 flex items-center justify-between border-t border-pink-500/10 mt-2">
            <span className="text-xs font-medium text-foreground/60">বিকাশ (Personal):</span>
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl">
              <span className="text-sm font-bold tracking-wider text-foreground">{bkashNumber}</span>
              <button onClick={handleCopyNumber} className="text-foreground/40 hover:text-primary transition-colors">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">বিকাশ সেন্ডার নাম্বার</label>
            <input 
              type="text"
              placeholder="01XXXXXXXXX"
              className={`w-full bg-secondary/50 border rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.senderNumber ? 'border-destructive' : 'border-border'}`}
              {...register("senderNumber", { 
                required: "বিকাশ নাম্বার দেওয়া বাধ্যতামূলক", 
                pattern: { value: /^01[3-9]\d{8}$/, message: "সঠিক বাংলাদেশি মোবাইল নাম্বার দিন" } 
              })}
            />
            {errors.senderNumber && <span className="text-xs text-destructive mt-1 block">{errors.senderNumber.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">ট্রানজেকশন আইডি (TrxID)</label>
            <input 
              type="text"
              placeholder="A1B2C3D4E5"
              className={`w-full bg-secondary/50 border rounded-xl px-4 py-3.5 text-sm font-medium tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase ${errors.tnxId ? 'border-destructive' : 'border-border'}`}
              {...register("tnxId", { required: "Transaction ID দেওয়া বাধ্যতামূলক", minLength: { value: 8, message: "TrxID সর্বনিম্ন ৮ অক্ষরের হতে হবে" } })}
            />
            {errors.tnxId && <span className="text-xs text-destructive mt-1 block">{errors.tnxId.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground font-black text-sm py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} /> পেমেন্ট ভেরিফাই করা হচ্ছে...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} /> পেমেন্ট ইনফো সাবমিট করুন
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}