import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative bg-primary rounded-[3rem] overflow-hidden p-8 md:p-16 text-center text-primary-foreground shadow-2xl shadow-primary/30">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
              <MessageSquare size={40} />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              আজই আপনার পেজকে এআই দিয়ে শক্তিশালী করুন
            </h2>
            
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              ৫ মিনিটেরও কম সময়ে সেটআপ করুন এবং আপনার কাস্টমারদের দিন এক অসাধারণ অভিজ্ঞতা। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-10 py-5 bg-white text-primary rounded-full text-lg font-bold hover:bg-opacity-90 transition-all shadow-xl"
              >
                এখনই শুরু করুন
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-10 py-5 bg-primary-foreground/10 border border-white/20 backdrop-blur-sm rounded-full text-lg font-bold hover:bg-white/10 transition-all"
              >
                আমাদের সাথে কথা বলুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
