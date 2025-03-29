import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server"; // Corrected import
import { NextResponse } from "next/server";
import axios from "axios";
import mongoose from "mongoose";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure this is set in .env

export async function POST(req) {
  try {
    // Authenticate user
    const { userId } = getAuth(req); // Adjust for authentication

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Extract chatId and prompt from request body
    const { chatId, prompt } = await req.json();

    if (!chatId || !prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "chatId and prompt (min 5 characters) required" },
        { status: 400 }
      );
    }

    // Validate chatId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chat ID" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find chat in database
    const chatData = await Chat.findOne({ userId, _id: chatId }).select("messages").lean();
    if (!chatData) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    // Add user prompt to chat messages
    const userPrompt = { role: "user", content: prompt, timestamp: Date.now() };
    chatData.messages.push(userPrompt);

    // Send request to Google Gemini API
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Server error: Missing API key" },
        { status: 500 }
      );
    }

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    let result;
    try {
      result = await axios.post(GEMINI_API_URL, requestBody, {
        headers: { "Content-Type": "application/json" },
        params: { key: GEMINI_API_KEY },
      });
    } catch (aiError) {
      console.error("AI API Error:", aiError?.response?.data || aiError.message);
      return NextResponse.json(
        { success: false, message: aiError?.response?.data?.error?.message || "AI response failed" },
        { status: aiError?.response?.status || 500 }
      );
    }

    // Extract AI response safely
    const response =
      result?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI response unavailable";

    if (!response) {
      return NextResponse.json(
        { success: false, message: "No valid AI response" },
        { status: 500 }
      );
    }

    // Save AI response to chat
    const assistantMessage = { role: "assistant", content: response, timestamp: Date.now() };
    chatData.messages.push(assistantMessage);
    await Chat.updateOne({ _id: chatId }, { messages: chatData.messages });

    console.log("User Prompt:", userPrompt);
    console.log("AI Response:", assistantMessage);

    return NextResponse.json({ success: true, data: assistantMessage });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
