import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { pageId, customerPsid } = await req.json();
    const db = await getDb();

    if (!pageId || !customerPsid) {
      return NextResponse.json({ success: false, error: "pageId and customerPsid are required" }, { status: 400 });
    }

    const updateResult = await db.collection("appconfigs").updateOne(
      { pageId },
      {
        $set: {
          [`conversations.${customerPsid}.lastInteractionBy`]: "bot",
          [`conversations.${customerPsid}.lastInteractionTime`]: new Date(),
          [`conversations.${customerPsid}.isBotPaused`]: false,
        },
      },
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Conversation or app config not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Bot takeover resumed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Resume Chat Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
