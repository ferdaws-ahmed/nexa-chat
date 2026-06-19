import { Clock, Zap, ShieldCheck, UserCog, MessageSquareText, BarChart3 } from 'lucide-react';

const features = [
  {
    title: '২৪/৭ অটো রিপ্লাই',
    desc: 'আপনার পেজে মেসেজ আসার সাথে সাথেই এআই উত্তর দিবে, দিনের যেকোনো সময়।',
    icon: Clock,
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    title: 'হিউম্যান-লাইক ডিলে',
    desc: 'ফেসবুক পেজ ব্যান হওয়া রোধ করতে মেসেজ টাইপ করার সময় মানুষের মতো ডিলে ব্যবহার করে।',
    icon: Zap,
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    title: 'হ্যান্ডওভার প্রোটোকল',
    desc: 'জটিল কোনো প্রশ্ন আসলে সাথে সাথে হিউম্যান মডারেটরের কাছে চ্যাট ট্রান্সফার করার সিস্টেম।',
    icon: UserCog,
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    title: 'কাস্টম অ্যাপ ইন্টিগ্রেশন',
    desc: 'আপনার নিজস্ব ফেসবুক অ্যাপ ব্যবহারের সুবিধা, যা আপনার ডাটাকে রাখবে ১০০% নিরাপদ।',
    icon: ShieldCheck,
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    title: 'স্মার্ট মেসেজ এনালাইসিস',
    desc: 'গ্রাহকের মুড এবং ইনটেন্ট বুঝে সঠিক এবং প্রাসঙ্গিক উত্তর দেওয়ার ক্ষমতা।',
    icon: MessageSquareText,
    color: 'bg-rose-500/10 text-rose-500',
  },
  {
    title: 'বিস্তারিত রিপোর্ট',
    desc: 'প্রতিদিন কতগুলো মেসেজ আসলো এবং এআই কতগুলো হ্যান্ডেল করলো তার পূর্ণাঙ্গ রিপোর্ট।',
    icon: BarChart3,
    color: 'bg-cyan-500/10 text-cyan-500',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            কেন নেক্সাচ্যাট আপনার ব্যবসার জন্য সেরা?
          </h2>
          <p className="text-lg text-foreground/60">
            আমরা শুধু চ্যাটবট নই, আমরা আপনার ব্যবসার ভার্চুয়াল অ্যাসিস্ট্যান্ট।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                {feature.title}
              </h3>
              <p className="text-foreground/60 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
