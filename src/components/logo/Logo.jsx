import Link from 'next/link';
import { Bot } from 'lucide-react';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-3 group select-none">
      {/* 🔮 AI আইকন কনটেইনার */}
      <div className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-950 border border-white/10 shadow-lg transition-all duration-500 group-hover:border-primary/50 group-hover:scale-105">
        
        {/* নিয়ন গ্লো ইফেক্ট */}
        <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <Bot 
          size={26} 
          className="text-primary relative z-10 transition-transform duration-500 group-hover:rotate-12" 
          strokeWidth={2.5}
        />

        {/* নিচের স্ক্যানিং লাইন */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary/50 rounded-full group-hover:w-6 transition-all duration-500" />
      </div>

      {/* ✍️ ব্র্যান্ড টেক্সট */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center">
          <span className="text-2xl font-black tracking-tighter text-foreground">
            নেক্সা
          </span>
          <span className="text-2xl font-black tracking-tighter text-primary ml-0.5">
            চ্যাট
          </span>
          {/* একটি ছোট প্রিমিয়াম ডট */}
          <div className="ml-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
        
        <span className="text-[10px] font-bold tracking-[0.25em] text-foreground/40 uppercase group-hover:text-primary/60 transition-colors duration-300">
          AI AUTOMATION
        </span>
      </div>
    </Link>
  );
};

export default Logo;