import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from "axios";
import mongoose from "mongoose";
import { headers } from "next/headers";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    // Ensure DB connection
    await connectDB();

    // Get user authentication
    const { userId } = getAuth({ headers: headers() });
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { chatId, prompt } = await req.json();
    if (!chatId || !prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "chatId and prompt (min 5 characters) required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chat ID" },
        { status: 400 }
      );
    }

    // Fetch existing chat
    const chatData = await Chat.findOne({ userId, _id: chatId }).select("messages").lean();
    if (!chatData) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    // Add user prompt to messages
    const userPrompt = { role: "user", content: prompt, timestamp: Date.now() };
    chatData.messages.push(userPrompt);

    // Call AI API
    let aiResponse;
    try {
      const { data } = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI response unavailable";
    } catch (aiError) {
      console.error("AI API Error:", aiError?.response?.data || aiError.message);
      return NextResponse.json(
        { success: false, message: aiError?.response?.data?.error?.message || "AI response failed" },
        { status: aiError?.response?.status || 500 }
      );
    }

    // Store AI response
    const assistantMessage = { role: "assistant", content: aiResponse, timestamp: Date.now() };
    chatData.messages.push(assistantMessage);
    await Chat.updateOne({ _id: chatId }, { messages: chatData.messages });

    return NextResponse.json({ success: true, data: assistantMessage });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
