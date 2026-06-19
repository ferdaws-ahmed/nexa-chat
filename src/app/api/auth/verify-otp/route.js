import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { setAuthCookies } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    const db = await getDb();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "ইমেল এবং ওটিপি প্রদান করুন" }, { status: 400 });
    }

    const user = await db.collection("users").findOne({
      email,
      otp,
      otpExpire: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "ভুল ওটিপি অথবা ওটিপি-র মেয়াদ শেষ হয়ে গেছে" }, { status: 400 });
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date(),
        },
        $unset: {
          otp: "",
          otpExpire: "",
        },
      },
    );

    const verifiedUser = await db.collection("users").findOne({ _id: new ObjectId(user._id) });
    const token = await setAuthCookies(verifiedUser);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: verifiedUser._id.toString(),
        name: verifiedUser.name,
        email: verifiedUser.email,
        role: verifiedUser.role,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
