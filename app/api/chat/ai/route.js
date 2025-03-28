import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import axios from "axios";

// Google Gemini API URL and API Key from environment variables
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure this is in your .env file

export async function POST(req) {
  try {
    // Get the authenticated user
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Extract chatId and prompt from request body
    const { chatId, prompt } = await req.json();

    // Validate chatId and prompt
    if (!chatId || !prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "chatId and prompt (with a minimum of 5 characters) are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Find the chat in the database
    const chatData = await Chat.findOne({ userId, _id: chatId }).select("messages");

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

    // Prepare request body for Google Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
          ],
        },
      ],
    };

    // Send request to Google Gemini API
    let result;
    try {
      result = await axios.post(
        GEMINI_API_URL,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            key: GEMINI_API_KEY, // API key as a query parameter
          },
        }
      );
    } catch (aiError) {
      console.error("Error generating AI response:", aiError);
      return NextResponse.json(
        { success: false, message: "Failed to generate AI response" },
        { status: 500 }
      );
    }

    const response = result?.data?.contents?.[0]?.parts?.[0]?.text;

    if (!response) {
      console.error("No valid AI response received.");
      return NextResponse.json(
        { success: false, message: "No valid AI response received" },
        { status: 500 }
      );
    }

    // AI response successfully received
    const assistantMessage = {
      role: "assistant",
      content: response,
      timestamp: Date.now(),
    };

    // Add AI response to chat history and save
    chatData.messages.push(assistantMessage);
    await chatData.save();

    console.log("User prompt added:", userPrompt);
    console.log("Assistant message:", assistantMessage);

    return NextResponse.json({
      success: true,
      data: assistantMessage,
    });

  } catch (error) {
    console.error("Error during processing:", error);

    // Return a more detailed error message
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
