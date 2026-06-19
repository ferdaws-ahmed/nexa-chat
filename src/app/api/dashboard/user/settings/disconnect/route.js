import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function DELETE(req) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { appConfigId } = await req.json();
    const db = await getDb();

    if (!appConfigId) {
      return NextResponse.json({ success: false, error: "appConfigId is required" }, { status: 400 });
    }

    const result = await db
      .collection("appconfigs")
      .updateOne(
        { _id: new ObjectId(appConfigId), userId: new ObjectId(authUser.id) },
        { $set: { isActive: false } },
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "App config not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Facebook page disconnected successfully" }, { status: 200 });
  } catch (error) {
    console.error("Disconnect Page Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
