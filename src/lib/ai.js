import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

/**
 * Key Pooling Mechanism
 */
const getGeminiKey = () => {
  const keys = Object.keys(process.env)
    .filter((key) => key.startsWith("GEMINI_KEY_"))
    .map((key) => process.env[key]);

  if (keys.length === 0) {
    if (process.env.GEMINI_KEY) return process.env.GEMINI_KEY;
    throw new Error("No Gemini API keys found");
  }

  return keys[Math.floor(Math.random() * keys.length)];
};

/**
 * Sends a message to Facebook Messenger
 */
export const sendMessengerMessage = async (pageAccessToken, recipientPsid, text) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`,
      {
        recipient: { id: recipientPsid },
        message: { text },
      }
    );
    console.log(`✅ Message sent to ${recipientPsid}`);
  } catch (error) {
    console.error("❌ Facebook API Error:", error.response?.data || error.message);
  }
};

/**
 * Evaluates and generates an AI reply using Gemini 1.5 Flash
 */
export const evaluateAiReply = async ({
  pageId,
  senderPsid,
  messageText,
  pageAccessToken,
  conversationContext,
}) => {
  try {
    const apiKey = getGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are a helpful AI assistant for a Facebook Page. 
      Your goal is to reply to customers in Bengali.
      
      CONTEXT:
      - Page ID: ${pageId}
      - Customer PSID: ${senderPsid}
      - Last Interaction By: ${conversationContext?.lastInteractionBy || 'None'}
      
      CUSTOMER MESSAGE:
      "${messageText}"
      
      INSTRUCTIONS:
      1. Analyze if the message requires a reply.
      2. If it's a greeting, common question, or business inquiry, set shouldReply to true.
      3. If it's gibberish or doesn't need a reply, set shouldReply to false.
      4. ALWAYS reply in Bengali.
      5. Keep replies professional, friendly, and concise.
      
      OUTPUT SCHEMA (Strict JSON):
      {
        "shouldReply": boolean,
        "replyText": "Bengali string"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let aiJson;
    try {
      aiJson = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Failed to parse Gemini JSON response:", responseText);
      return { success: false, error: "Invalid AI response format" };
    }

    if (aiJson.shouldReply && aiJson.replyText && pageAccessToken) {
      await sendMessengerMessage(pageAccessToken, senderPsid, aiJson.replyText);
    }

    return { success: true, ...aiJson };
  } catch (error) {
    console.error("❌ Gemini AI Error:", error.message);
    return { success: false, error: error.message };
  }
};
