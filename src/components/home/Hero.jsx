import Link from 'next/link';
import { PlayCircle, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32 bg-background">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            এআই চালিত ফেসবুক মডারেশন এখন বাংলায়
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.2] md:leading-[1.1]">
            ফেসবুক পেজ ম্যানেজমেন্টে নিয়ে আসুন <span className="text-primary">এআই ম্যাজিক</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            নেক্সাচ্যাট আপনার ফেসবুক ইনবক্স সামলাবে একদম মানুষের মতো। কোনো ফেসবুক অ্যাপ রিভিউ ছাড়াই সেটআপ করুন আপনার নিজস্ব স্মার্ট চ্যাটবট।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              ফ্রি ট্রায়াল শুরু করুন
              <ArrowRight size={20} />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground border border-border rounded-full text-lg font-bold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
              <PlayCircle size={20} />
              ডেমো দেখুন
            </button>
          </div>

          <div className="pt-12 flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Trusted by placeholder icons */}
            <span className="text-sm font-bold uppercase tracking-widest">Trusted by 500+ BD Business Owners</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
