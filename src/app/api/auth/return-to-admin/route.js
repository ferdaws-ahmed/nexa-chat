import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { setAuthCookies } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const originalAdminCookie = cookieStore.get('originalAdmin')?.value;

    if (!originalAdminCookie) {
      return NextResponse.json({ success: false, error: "No original admin session found" }, { status: 400 });
    }

    let originalAdmin;
    try {
      originalAdmin = JSON.parse(originalAdminCookie);
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid admin session data" }, { status: 400 });
    }

    const db = await getDb();
    const adminUser = await db.collection("users").findOne({ _id: new ObjectId(originalAdmin.id) });

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: "Original session is not an admin" }, { status: 403 });
    }

    // Set cookies back to the admin user
    const token = await setAuthCookies(adminUser, false);

    // Remove the originalAdmin cookie as we are back to being admin
    cookieStore.delete('originalAdmin');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        isImpersonating: false
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Return to Admin Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
