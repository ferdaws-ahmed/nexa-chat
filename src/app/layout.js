import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthContext";
 // <-- থিম প্রোভাইডার ইম্পোর্ট করুন
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import ThemeProvider from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "নেক্সাচ্যাট - আপনার ব্যবসার এআই সহকারী",
  description:
    "নেক্সাচ্যাট দিয়ে আপনার গ্রাহক সেবা স্বয়ংক্রিয় করুন এবং ব্যবসার প্রবৃদ্ধি বৃদ্ধি করুন।",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning // Next.js থিম সুইচের জন্য এটি দরকারি
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 
        আপডেট ১: <head> এর ভেতরের ম্যানুয়াল <script> ট্যাগটি সম্পূর্ণ ফেলে দেওয়া হয়েছে।
        next-themes লাইব্রেরি এই স্ক্রিপ্টের কাজটি ব্যাকগ্রাউন্ডে আমাদের চেয়েও নিখুঁতভাবে করবে,
        যার ফলে স্ক্রিন ফ্লাশ (Flicker) হওয়ার কোনো চান্স থাকবে না।
      */}
      <head /> 
      
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300"
      >
        <AuthProvider>
          {/* আপডেট ২: থিম প্রোভাইডার দিয়ে লেআউটকে র‍্যাপ করা হলো */}
          <ThemeProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}