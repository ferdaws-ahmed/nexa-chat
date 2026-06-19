import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const db = await getDb();
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0, otp: 0, otpExpire: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("Admin Users Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
