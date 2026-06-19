import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(user.id) });

    // ১. ইউজার ইতিমধ্যে কোনো একটি পেইড প্ল্যানে থাকলে ট্রায়াল দেওয়া যাবে না
    if (currentUser.package && !['inactive', 'free'].includes(currentUser.package)) {
      return NextResponse.json({ error: 'আপনার অলরেডি একটি প্রিমিয়াম প্ল্যান সক্রিয় আছে।' }, { status: 400 });
    }

    // 🚨 ২. [CRITICAL SECURITY CHECK]: ইউজার আগে কখনো ফ্রি ট্রায়াল বাটন ক্লিক করেছিল কিনা?
    // আমরা ইউজারের অবজেক্টেই একটা ফ্ল্যাগ ট্র্যাক করব: `hasUsedTrial`
    if (currentUser.hasUsedTrial) {
      return NextResponse.json({ 
        error: 'আপনি ইতিমধ্যে একবার ফ্রি ট্রায়াল সুবিধাটি নিয়েছেন। নতুন করে আর ফ্রি ট্রায়াল নেওয়া সম্ভব নয়।' 
      }, { status: 400 });
    }

    // প্যাকেজ আপডেট করে 'free' করা হলো 
    // এবং সাথে সাথে `hasUsedTrial: true` করে দেওয়া হলো যেন এই ইউজার আর কখনো এই এপিআই হিট করতে না পারে।
    await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      { 
        $set: { 
          package: 'free',
          isPageConnected: false,
          packageExpiresAt: null, // পেজ কানেক্ট করার সময় সেট হবে
          trialStartedAt: null,
          hasUsedTrial: true // আজীবনের জন্য লক হয়ে গেল
        } 
      }
    );

    return NextResponse.json({ success: true, message: 'ফ্রি ট্রায়াল সেটআপ হয়েছে। পেজ কানেক্ট করুন।' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}