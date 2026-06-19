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
    const appConfigs = await db
      .collection("appconfigs")
      .find({ userId: new ObjectId(authUser.id), isActive: true })
      .toArray();

    const pausedConversations = [];

    appConfigs.forEach((config) => {
      const conversations = config.conversations || {};
      Object.entries(conversations).forEach(([customerPsid, metadata]) => {
        if (metadata?.isBotPaused === true) {
          pausedConversations.push({
            pageId: config.pageId,
            customerPsid,
            lastInteractionBy: metadata.lastInteractionBy || "customer",
            lastInteractionTime: metadata.lastInteractionTime,
            isBotPaused: true,
          });
        }
      });
    });

    return NextResponse.json({ success: true, pausedConversations }, { status: 200 });
  } catch (error) {
    console.error("Live Chats Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
