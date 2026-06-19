import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const appConfig = await db
      .collection("appconfigs")
      .findOne({ userId: new ObjectId(authUser.id), isActive: true });
      
    return NextResponse.json({ success: true, appConfig }, { status: 200 });
  } catch (error) {
    console.error("Merchant Settings Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
