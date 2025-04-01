import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server"; // Correct Clerk import for Next.js API routes
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // Import mongoose to validate ObjectId

export async function DELETE(req) {
  try {
    // Authenticate user
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "chatId is required" },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chatId format" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Find and delete the chat document
    const deletedChat = await Chat.findOneAndDelete({ _id: chatId, userId });

    if (!deletedChat) {
      return NextResponse.json(
        { success: false, message: "Chat not found or unauthorized" },
        { status: 404 }
      );
    }

    // Return success message
    return NextResponse.json(
      { success: true, message: "Chat deleted successfully", chatId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting chat:", error.stack); // Log full error for debugging

    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while deleting the chat" },
      { status: 500 }
    );
  }
}
