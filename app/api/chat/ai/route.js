import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";  // Import GoogleGenAI

// Initialize Google GenAI client with your API key
const ai = new GoogleGenAI({
  apiKey: process.env.GENAI_API_KEY, // Make sure to add this in your .env file
});

export async function POST(req) {
  try {
    // Get the authenticated user information from the request
    const { userId } = getAuth(req);

    // Check if the user is authenticated
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      }, { status: 401 });
    }

    // Extract chatId and prompt from the request body
    const { chatId, prompt } = await req.json();

    // Check if chatId and prompt are provided
    if (!chatId || !prompt) {
      return NextResponse.json({
        success: false,
        message: "chatId and prompt are required",
      }, { status: 400 });
    }

    // Connect to the database
    await connectDB();

    // Find the chat document in the database based on userId and chatId
    const chatData = await Chat.findOne({ userId, _id: chatId });

    // Check if the chat data exists
    if (!chatData) {
      return NextResponse.json({
        success: false,
        message: "Chat not found",
      }, { status: 404 });
    }

    // Create a user message object
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    // Add user message to the chat
    chatData.messages.push(userPrompt);

    // Call the Google GenAI API to get a chat completion
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Specify the Gemini model
      contents: prompt,
    });

    // Create the assistant's response message
    const assistantMessage = {
      role: "assistant",
      content: response.text, // Get the text response from Gemini
      timestamp: Date.now(),
    };

    // Add assistant message to the chat
    chatData.messages.push(assistantMessage);

    // Save the updated chat data
    await chatData.save();

    // Return success response with the assistant's message
    return NextResponse.json({
      success: true,
      data: assistantMessage,
    });

  } catch (error) {
    console.error("Error during processing:", error); // Log the error for debugging

    // Return error response
    return NextResponse.json({
      success: false,
      message: error.message || "An unexpected error occurred",
    }, { status: 500 });
  }
}
