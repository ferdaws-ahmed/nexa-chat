import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth'; 
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    // ১. টোকেন এবং ইউজার সেশন ভেরিফাই করা
    const userSession = await verifyAuth(req);

    if (!userSession) {
      return NextResponse.json(
        { success: false, error: "ইউজার লগইন করা নেই অথবা সেশন এক্সপায়ার হয়েছে।" }, 
        { status: 401 }
      );
    }

    // ২. ডাটাবেজ থেকে লেটেস্ট ডাটা রিড করা (ক্যাশিং এড়াতে সরাসরি কুয়েরি)
    const db = await getDb();
    const dbUser = await db.collection('users').findOne({ _id: new ObjectId(userSession.id) });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "ইউজার ডেটা খুঁজে পাওয়া যায়নি।" }, 
        { status: 404 }
      );
    }

    // 🔍 ডেভলপার চেক: ডাটাবেজে যদি ভুল ডেটা থাকে, তা সামলানোর জন্য কঠোর টাইপ-কাস্টিং
    // ইউজার ম্যানুয়ালি মেটা ক্রেডেনশিয়াল সাবমিট না করা পর্যন্ত এটি সবসময় false থাকবে।
    const actualPageConnectionStatus = Boolean(dbUser.isPageConnected && dbUser.fbPageAccessToken && dbUser.fbPageId);

    // ৩. ফ্রন্টএন্ডের স্টেট রিকোয়ারমেন্ট অনুযায়ী নিখুঁত রেসপন্স ম্যাপিং
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role?.toLowerCase() || 'user',
        
        // প্যাকেজ এবং সাবস্ক্রিপশন হ্যান্ডলিং
        package: dbUser.subscription?.plan || dbUser.package || "inactive",
        packageExpiresAt: dbUser.subscription?.endDate || dbUser.packageExpiresAt || null,
        trialStartedAt: dbUser.subscription?.startDate || dbUser.trialStartedAt || null,

        // 🛡️ অত্যন্ত সুরক্ষিত ফেসবুক কানেকশন স্টেট (যাতে ভুল ডাটা পাস না হয়)
        isPageConnected: actualPageConnectionStatus,
        fbPageName: actualPageConnectionStatus ? (dbUser.fbPageName || "ফেসবুক পেজ সচল আছে") : "",
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/user/me route:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে ডাটাবেস বা নেটওয়ার্ক চেক করুন।" 
      }, 
      { status: 500 }
    );
  }
}