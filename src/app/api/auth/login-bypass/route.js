import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { setAuthCookies, verifyAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await req.json();
    const db = await getDb();

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    
    // Save original admin info before switching
    const originalAdmin = {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role
    };

    cookieStore.set('originalAdmin', JSON.stringify(originalAdmin), {
      httpOnly: false, // Accessible by client to show the "Return to Admin" banner
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Set cookies for the target user (impersonation)
    const token = await setAuthCookies(targetUser, true);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isImpersonating: true
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Impersonation Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
