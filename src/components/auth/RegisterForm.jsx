'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/constants';
import VerifyOTPModal from './VerifyOTPModal';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('পাসওয়ার্ড দুটি মিলছে না');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setShowOTPModal(true);
      } else {
        setError(data.error || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      setError('সার্ভারের সাথে সংযোগ করা সম্ভব হচ্ছে না');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showOTPModal && (
        <VerifyOTPModal 
          email={formData.email} 
          onClose={() => setShowOTPModal(false)} 
        />
      )}
      <div className="w-full max-w-md mx-auto p-8 bg-card border border-border rounded-[2.5rem] shadow-xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">নতুন একাউন্ট</h2>
          <p className="text-foreground/60">নেক্সাচ্যাটে আপনার যাত্রা শুরু করুন</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">আপনার নাম</label>
            <input
              type="text"
              required
              className="w-full px-6 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              placeholder="পুরো নাম লিখুন"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">ইমেইল</label>
            <input
              type="email"
              required
              className="w-full px-6 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-6 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">পাসওয়ার্ড নিশ্চিত করুন</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full px-6 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'রেজিস্ট্রেশন করুন'}
          </button>
        </form>

        <p className="mt-8 text-center text-foreground/60">
          ইতিমধ্যে একাউন্ট আছে?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            লগইন করুন
          </Link>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
