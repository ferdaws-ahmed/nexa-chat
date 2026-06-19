import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const db = await getDb();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Name, email and password are required" }, { status: 400 });
    }

    const userExists = await db.collection("users").findOne({ email });
    if (userExists) {
      return NextResponse.json({ success: false, error: "এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ এখানে পরিবর্তন করা হয়েছে: নতুন ইউজারের ডিফল্ট স্টেট এখন 'inactive'
    const userPayload = {
      name,
      email,
      password: hashedPassword,
      role: "user",
      subscription: {
        plan: "inactive",          // 👈 প্রথমে প্ল্যান ইনঅ্যাক্টিভ থাকবে
        startDate: null,          // 👈 কোনো স্টার্ট ডেট থাকবে না
        endDate: null,            // 👈 কোনো এন্ড ডেট থাকবে না (তাই কাউন্টডাউন শুরু হবে না)
        isActive: false,          // 👈 এটি এখন ফলস থাকবে
        dailyAiQuotaUsed: 0,
        dailyAiQuotaLimit: 0,     // 👈 ইনঅ্যাক্টিভ অবস্থায় কোনো কোটা থাকবে না
      },
      isPageConnected: false,     // ফেসবুক পেজ কানেকশনের ডিফল্ট স্টেট
      fbPageName: "",
      isVerified: false,
      otp,
      otpExpire,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { insertedId } = await db.collection("users").insertOne(userPayload);

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px;">
        <h2 style="color: #3b82f6; text-align: center;">নেক্সাচ্যাটে স্বাগতম!</h2>
        <p>প্রিয় ${name},</p>
        <p>নেক্সাচ্যাটে একাউন্ট তৈরি করার জন্য আপনাকে ধন্যবাদ। আপনার ইমেইলটি ভেরিফাই করতে নিচের ওটিপি (OTP) কোডটি ব্যবহার করুন:</p>
        <div style="text-align: center; margin: 30px 0;">
          <h1 style="background-color: #f1f5f9; color: #3b82f6; padding: 15px; border-radius: 10px; font-size: 32px; letter-spacing: 5px; border: 2px dashed #3b82f6; display: inline-block;">${otp}</h1>
        </div>
        <p style="text-align: center; color: #ef4444; font-weight: bold;">এই কোডটি ১০ মিনিটের জন্য কার্যকর থাকবে।</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">এটি একটি স্বয়ংক্রিয় ইমেইল, দয়া করে এখানে রিপ্লাই দিবেন না।</p>
      </div>
    `;

    try {
      await sendEmail({
        email,
        subject: "নেক্সাচ্যাট ইমেইল ভেরিফিকেশন",
        message,
      });

      return NextResponse.json({
        success: true,
        message: "আপনার ইমেইলে একটি ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে। অনুগ্রহ করে চেক করুন।",
      }, { status: 201 });
    } catch (err) {
      console.error("SMTP ERROR:", err);
      await db.collection("users").deleteOne({ _id: insertedId });
      return NextResponse.json({
        success: false,
        error: "ভেরিফিকেশন ইমেইল পাঠানো সম্ভব হয়নি।",
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}