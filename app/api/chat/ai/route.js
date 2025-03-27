import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server"; // ✅ Fixed Import
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";  // Import GoogleGenAI

// Initialize Google GenAI client with your API key
const genAI = new GoogleGenAI({
  apiKey: process.env.GENAI_API_KEY, // Ensure this is in your .env file
});

export async function POST(req) {
  try {
    // Get the authenticated user information from the request
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Extract chatId and prompt from the request body
    const { chatId, prompt } = await req.json();

    if (!chatId || !prompt) {
      return NextResponse.json(
        { success: false, message: "chatId and prompt are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Find the chat document in the database
    const chatData = await Chat.findOne({ userId, _id: chatId });

    if (!chatData) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    // Add user message to chat history
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };
    chatData.messages.push(userPrompt);

    // Generate AI response using Google Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const assistantMessage = {
      role: "assistant",
      content: response.text(), // Correct way to retrieve response text
      timestamp: Date.now(),
    };

    // Add AI response to chat history
    chatData.messages.push(assistantMessage);
    await chatData.save();

    return NextResponse.json({
      success: true,
      data: assistantMessage,
    });

  } catch (error) {
    console.error("Error during processing:", error);

    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
