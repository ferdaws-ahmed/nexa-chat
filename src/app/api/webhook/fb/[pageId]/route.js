import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { evaluateAiReply } from '@/lib/ai';

/**
 * @desc    Verify Facebook Webhook
 */
export async function GET(req, { params }) {
  try {
    const { pageId } = await params;
    const { searchParams } = new URL(req.url);
    
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (!mode || !token) return new NextResponse("Bad Request", { status: 400 });

    const db = await getDb();
    const config = await db.collection("appconfigs").findOne({ pageId });

    if (!config) return new NextResponse("Page configuration not found", { status: 404 });

    if (mode === "subscribe" && token === config.webhookVerifyToken) {
      console.log(`✅ Webhook verified for Page ID: ${pageId}`);
      return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
  } catch (error) {
    console.error("Webhook Verification Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * @desc    Handle Incoming Facebook Messages & Echoes
 */
export async function POST(req, { params }) {
  try {
    const { pageId } = await params;
    const body = await req.json();
    const db = await getDb();

    if (body.object !== "page") return new NextResponse("Not Found", { status: 404 });

    const entry = Array.isArray(body.entry) ? body.entry[0] : null;
    if (!entry) return new NextResponse("Bad Request", { status: 400 });

    const messaging = entry.messaging?.[0];
    if (!messaging) return new NextResponse("EVENT_RECEIVED", { status: 200 });

    const senderPsid = messaging.sender?.id;
    const recipientPsid = messaging.recipient?.id;
    const message = messaging.message;

    // 1. Detect Moderator Activity (Echo Message)
    if (message?.is_echo) {
      const customerPsid = recipientPsid;
      console.log(`👤 Moderator reply detected for PSID: ${customerPsid}. Pausing bot for 5m.`);
      
      await db.collection("appconfigs").updateOne(
        { pageId },
        {
          $set: {
            [`conversations.${customerPsid}.lastInteractionBy`]: "moderator",
            [`conversations.${customerPsid}.lastInteractionTime`]: new Date(),
            [`conversations.${customerPsid}.isBotPaused`]: true,
          }
        }
      );
      return new NextResponse("MODERATOR_ECHO_HANDLED", { status: 200 });
    }

    // 2. Handle Incoming Customer Message
    if (senderPsid && message && !message.is_echo) {
      const config = await db.collection("appconfigs").findOne({ pageId, isActive: true });
      if (!config) return new NextResponse("Not Found", { status: 404 });

      const conversation = config.conversations?.[senderPsid] || {};
      const lastInteractionTime = conversation.lastInteractionTime ? new Date(conversation.lastInteractionTime) : null;
      const now = new Date();
      
      const isPaused = conversation.isBotPaused === true;
      const cooldownMs = 5 * 60 * 1000;
      const isWithinCooldown = lastInteractionTime && (now - lastInteractionTime < cooldownMs);

      if (isPaused && isWithinCooldown) {
        const remainingSecs = Math.ceil((cooldownMs - (now - lastInteractionTime)) / 1000);
        console.log(`⏳ AI Suppressed: Human takeover active for PSID ${senderPsid} (${remainingSecs}s left)`);
        return new NextResponse("HUMAN_CONTROL_ACTIVE", { status: 200 });
      }

      const messageText = message.text || "";
      if (!messageText) return new NextResponse("NON_TEXT_MESSAGE_IGNORED", { status: 200 });

      console.log(`🤖 Processing AI reply for PSID ${senderPsid}: "${messageText}"`);
      
      await evaluateAiReply({
        pageId,
        senderPsid,
        messageText,
        pageAccessToken: config.pageAccessToken,
        conversationContext: conversation
      });

      await db.collection("appconfigs").updateOne(
        { pageId },
        {
          $set: {
            [`conversations.${senderPsid}.lastInteractionBy`]: "bot",
            [`conversations.${senderPsid}.lastInteractionTime`]: new Date(),
            [`conversations.${senderPsid}.isBotPaused`]: false,
          }
        }
      );

      return NextResponse.json({ status: "SUCCESS" }, { status: 200 });
    }

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
