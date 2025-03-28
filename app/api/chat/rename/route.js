import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // Import mongoose to validate ObjectId

export async function POST(req) {
  try {
    // Authenticate the user
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { chatId, name } = await req.json();

    // Validate input fields
    if (!chatId || !name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "ChatId and name are required, and name must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chatId format" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Find and update the chat
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId }, // Ensure the chat belongs to the authenticated user
      { name: name.trim() }, // Trim to remove leading/trailing spaces
      { new: true, runValidators: true } // Return updated chat & enforce validation
    ).lean();

    if (!updatedChat) {
      return NextResponse.json(
        { success: false, message: "Chat not found or unauthorized access" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Chat renamed successfully", data: updatedChat },
      { status: 200 }
    );

  } catch (error) {
    console.error("🚨 Error renaming chat:", error); // Log the full error for debugging

    // Return a sanitized error message for client-side consumption
    return NextResponse.json(
      { success: false, message: "Failed to rename chat. Please try again later." },
      { status: 500 }
    );
  }
}
