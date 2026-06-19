import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planName, amount, tnxId, senderNumber, screenshotUrl } = await req.json();

    if (!planName || !amount || !tnxId || !senderNumber) {
      return NextResponse.json({ error: 'দয়া করে সব তথ্য সঠিকভাবে পূরণ করুন।' }, { status: 400 });
    }

    const db = await getDb();

    // 🚨 [UPDATE 1]: ইউজার অলরেডি একটা পেমেন্ট রিকোয়েস্ট পেন্ডিং রেখেছে কিনা চেক
    const pendingPayment = await db.collection('payments').findOne({ 
      userId: new ObjectId(user.id), 
      status: 'pending' 
    });
    
    if (pendingPayment) {
      return NextResponse.json({ 
        error: 'আপনার একটি পেমেন্ট রিকোয়েস্ট ইতিমধ্যে পেন্ডিং আছে। সেটি অ্যাপ্রুভ হওয়ার আগে নতুন রিকোয়েস্ট পাঠানো যাবে না।' 
      }, { status: 400 });
    }

    // একই ট্রানজেকশন আইডি ইতিমধ্যে ডাটাবেজে আছে কিনা ভ্যালিডেশন
    const existingTxn = await db.collection('payments').findOne({ tnxId: tnxId.trim() });
    if (existingTxn) {
      return NextResponse.json({ error: 'এই ট্রানজেকশন আইডিটি ইতিমধ্যে ব্যবহার করা হয়েছে।' }, { status: 400 });
    }

    const paymentDoc = {
      userId: new ObjectId(user.id),
      userName: user.name,
      userEmail: user.email,
      planName,
      amount: Number(amount),
      tnxId: tnxId.trim(),
      senderNumber,
      screenshotUrl: screenshotUrl || null,
      status: 'pending',
      createdAt: new Date()
    };

    await db.collection('payments').insertOne(paymentDoc);

    return NextResponse.json({ 
      success: true, 
      message: 'আপনার পেমেন্ট রিকোয়েস্টটি পেন্ডিং অবস্থায় আছে। অ্যাডমিন ভেরিফাই করার পর প্ল্যান চালু হবে।' 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}