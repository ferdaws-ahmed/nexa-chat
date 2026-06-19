import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { setAuthCookies } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log(`[Login] Attempt for: ${email}`);
    
    const db = await getDb();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন" }, { status: 400 });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      console.log(`[Login] User not found: ${email}`);
      return NextResponse.json({ success: false, error: "ভুল ইমেইল বা পাসওয়ার্ড" }, { status: 401 });
    }

    if (!user.isVerified) {
      console.log(`[Login] User not verified: ${email}`);
      return NextResponse.json({ success: false, error: "অনুগ্রহ করে আপনার ইমেল ভেরিফাই করুন।" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[Login] Password mismatch: ${email}`);
      return NextResponse.json({ success: false, error: "ভুল ইমেইল বা পাসওয়ার্ড" }, { status: 401 });
    }

    const token = await setAuthCookies(user);
    console.log(`[Login] Success: ${email} (${user.role})`);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Login Error Details:", error);
    return NextResponse.json({ 
      success: false, 
      error: "সার্ভারে সমস্যা হয়েছে। ডাটাবেস কানেকশন চেক করুন।",
      details: error.message 
    }, { status: 500 });
  }
}
