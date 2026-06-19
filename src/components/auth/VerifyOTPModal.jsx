'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';
import { API_URL } from '@/lib/constants';

const VerifyOTPModal = ({ email, onClose }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('৬ ডিজিটের ওটিপি প্রদান করুন');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (data.success) {
        // Update auth context (handles cookies and localStorage)
        setAuth(data.token, data.user);

        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/user');
        }
      } else {
        setError(data.error || 'ভেরিফিকেশন ব্যর্থ হয়েছে');
      }
    } catch (err) {
      setError('সার্ভারের সাথে সংযোগ করা সম্ভব হচ্ছে না');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
            <ShieldCheck size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">ইমেল ভেরিফিকেশন</h2>
          <p className="text-foreground/60 leading-relaxed">
            আমরা আপনার ইমেইল <span className="font-bold text-primary">{email}</span> এ একটি ওটিপি কোড পাঠিয়েছি।
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <label className="text-sm font-bold text-foreground/50 uppercase tracking-widest">ওটিপি কোড দিন</label>
            <input
              type="text"
              maxLength="6"
              required
              className="w-full text-center text-3xl font-black tracking-[0.5em] px-6 py-5 bg-secondary border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'ভেরিফাই করুন'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-foreground/50">
          কোড পাননি? <button className="text-primary font-bold hover:underline">আবার পাঠান</button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTPModal;
