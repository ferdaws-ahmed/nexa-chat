import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    // ১. ইউজার অথেনটিকেশন চেক
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ২. ফ্রন্টএন্ড থেকে আসা ম্যানুয়াল ডেটা রিসিভ করা
    const { appId, pageId, accessToken, requestedPlan } = await req.json();

    if (!appId || !pageId || !accessToken) {
      return NextResponse.json({ error: 'সবকটি ফিল্ড (App ID, Page ID, Token) আবশ্যিক।' }, { status: 400 });
    }

    const db = await getDb();
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(user.id) });

    // 🌐 ৩. মেটা গ্রাফ এপিআই (Meta Graph API) কল করে লাইভ টোকেন ভেরিফিকেশন করা
    const fbVerificationUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=name,category,followers_count&access_token=${accessToken}`;
    
    let fbMetadata;
    try {
      const fbResponse = await fetch(fbVerificationUrl);
      const fbData = await fbResponse.json();

      // ❌ যদি ইউজার ভুল আইডি বা টোকেন দেয়, ফেসবুকের রিয়াল এরর মেসেজটি ক্লায়েন্টকে ব্যাক করা হবে
      if (fbData.error) {
        return NextResponse.json({ 
          error: `মেটা ভেরিফিকেশন এরর: ${fbData.error.message || "আপনার দেওয়া টোকেন বা পেজ আইডি সঠিক নয়।"}` 
        }, { status: 400 });
      }

      fbMetadata = fbData; // ফেসবুক থেকে রিয়াল পেজের ডেটা সফলভাবে পাওয়া গেল
    } catch (err) {
      return NextResponse.json({ error: "ফেসবুক সার্ভারের সাথে কানেক্ট করা যাচ্ছে না।" }, { status: 502 });
    }

    const livePageName = fbMetadata.name || 'Connected Page';

    // 🚨 ৪. [CRITICAL SECURITY CHECK]: এই ফেসবুক পেজটি আগে কেউ ফ্রি ট্রায়ালে ব্যবহার করেছে কিনা?
    const isTrialAlreadyUsed = await db.collection('used_trials').findOne({ fbPageId: pageId });

    // ইউজার যদি ফ্রি প্ল্যানে থাকে এবং পেজটি ইতিমধ্যে ব্ল্যাকলিস্টেড বা ট্রায়ালড হয়ে থাকে
    const currentPack = currentUser.package || requestedPlan || 'free';
    if (currentPack === 'free' && isTrialAlreadyUsed) {
      return NextResponse.json({ 
        error: `দুঃখিত! "${livePageName}" ফেসবুক পেজটিতে আগে একবার ফ্রি ট্রায়াল ব্যবহার করা হয়েছে। সিস্টেম সিকিউরিটি অনুযায়ী এই পেজে আর ফ্রি ট্রায়াল সচল করা সম্ভব নয়। দয়া করে আমাদের যেকোনো একটি প্রিমিয়াম প্ল্যান পারচেজ করুন।` 
      }, { status: 400 });
    }

    // ৫. ডাটাবেজ আপডেটের প্রাথমিক ফিল্ডসমূহ প্রস্তুতকরণ
    let updateFields = {
      isPageConnected: true,
      fbAppId: appId,
      fbPageId: pageId,
      fbPageAccessToken: accessToken,
      fbPageName: livePageName,
      // মেটাডাটা অবজেক্টটি ইউজারের ডকুমেন্টে পুশ করা হচ্ছে
      fbMetadata: {
        id: fbMetadata.id,
        category: fbMetadata.category,
        followers_count: fbMetadata.followers_count
      }
    };

    // যদি ইউজার ফ্রি প্ল্যানে থাকে এবং এই প্রথম পেজ কানেক্ট করে, তবে ৩ দিনের কাউন্টডাউন শুরু হবে
    if (currentPack === 'free' && !currentUser.trialStartedAt) {
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(now.getDate() + 3); // ফিক্সড ৩ দিন ভ্যালিডিটি

      updateFields.package = 'free';
      updateFields.trialStartedAt = now;
      updateFields.packageExpiresAt = expiresAt;

      // 🔒 গ্লোবাল 'used_trials' কালেকশনে এই ইউনিক ফেসবুক পেজ আইডিটি আজীবনের জন্য লক করা
      await db.collection('used_trials').insertOne({
        fbPageId: pageId,
        fbPageName: livePageName,
        userId: new ObjectId(user.id),
        userEmail: user.email,
        usedAt: now
      });
    }

    // ইউজারের ডাটাবেজ ডকুমেন্ট আপডেট
    await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      { $set: updateFields }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'ফেসবুক পেজ সফলভাবে মেটার মাধ্যমে ভেরিফাই ও কানেক্ট করা হয়েছে।' 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}