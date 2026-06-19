import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const adminUser = await verifyAuth(req);
    // রোল চেকিং ডিফেন্স লজিক
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden! Admin Access Only' }, { status: 403 });
    }

    const { paymentId } = await req.json();
    if (!paymentId) return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });

    const db = await getDb();
    
    // ১. পেন্ডিং পেমেন্ট ডকুমেন্টটি খুঁজে বের করা
    const payment = await db.collection('payments').findOne({ _id: new ObjectId(paymentId) });
    if (!payment) return NextResponse.json({ error: 'পেমেন্ট রিকোয়েস্টটি পাওয়া যায়নি।' }, { status: 404 });
    if (payment.status !== 'pending') return NextResponse.json({ error: 'এই পেমেন্টটি ইতিমধ্যে হ্যান্ডেল করা হয়েছে।' }, { status: 400 });

    // ২. প্ল্যান অনুযায়ী সিস্টেম ইন্টারনাল কোড আইডেন্টিফিকেশন
    let internalPackageCode = 'keyword_only';
    if (payment.planName.includes('স্মার্ট')) internalPackageCode = 'smart_automation';
    if (payment.planName.includes('এডভান্সড')) internalPackageCode = 'advanced';

    // ৩. মেয়াদের হিসাব - প্ল্যান অ্যাক্টিভেশন ডেট থেকে ফিক্সড ৩০ দিন
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // ৪. ডাটাবেজ ট্রানজেকশন আপডেট (ইউজার ও পেমেন্ট টেবিল)
    await db.collection('payments').updateOne(
      { _id: new ObjectId(paymentId) },
      { $set: { status: 'received', approvedAt: new Date() } }
    );

    // 🚨 [UPDATE 2]: এখানে `isPageConnected` কে ট্রু (true) করা যাবে না। 
    // কারণ ইউজার পেমেন্ট করার পর তার কানেক্ট পেজে গিয়ে নিজের ফেসবুক পেজ নতুন করে কানেক্ট করতে হতে পারে।
    // পেমেন্ট রিলিজ হওয়া মানেই ইউজারের প্ল্যান বা প্যাকেজ আনলক হওয়া।
    await db.collection('users').updateOne(
      { _id: payment.userId },
      { 
        $set: { 
          package: internalPackageCode,
          packageExpiresAt: expiryDate,
          // ইউজার যদি ট্রায়াল মেয়াদে পেজ কানেক্ট করে থাকে তবে ওটাই থাকবে, নতুবা সে নিজে কানেক্ট করবে।
          // তাই এখানে isPageConnected হাত দেওয়া যাবে না। সাইডবার লজিক ইউজার প্যাকেজ দেখেই ফিচার আনলক করবে।
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: `সফলভাবে পেমেন্ট গ্রহণ করা হয়েছে। ইউজারের জন্য ${payment.planName} মেম্বারশিপ ৩০ দিনের জন্য অ্যাক্টিভ করা হলো।` 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}