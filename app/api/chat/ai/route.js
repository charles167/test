import { auth } from "@clerk/nextjs/server"; // Use 'auth' for server-side authentication
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    // Connect to the database
    await connectDB();

    // Get the authenticated user
    const { userId } = auth(); // Use 'auth()' for authentication

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { chatId, prompt } = await req.json();

    if (!chatId || !prompt) {
      return NextResponse.json(
        { success: false, message: "chatId and prompt are required" },
        { status: 400 }
      );
    }

    const chatData = await Chat.findOne({ userId, _id: chatId }).select("messages");

    if (!chatData) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    chatData.messages.push(userPrompt);

    // Prepare request to Gemini API
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    // Call the Gemini API to get the response
    const result = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: process.env.GEMINI_API_KEY, // Your API key
        },
      }
    );

    const response = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!response) {
      return NextResponse.json(
        { success: false, message: "Failed to generate AI response" },
        { status: 500 }
      );
    }

    const assistantMessage = {
      role: "assistant",
      content: response,
      timestamp: Date.now(),
    };

    chatData.messages.push(assistantMessage);
    await chatData.save();

    return NextResponse.json({
      success: true,
      data: assistantMessage,
    });
  } catch (error) {
    console.error("Error in chat/ai:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}
