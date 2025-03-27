import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // Import to validate ObjectId

export async function DELETE(req) {
  try {
    // Get user authentication
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

    // Delete the chat document
    const deletedChat = await Chat.deleteOne({ _id: chatId, userId });

    if (deletedChat.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Chat not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Chat deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting chat:", error);

    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while deleting the chat" },
      { status: 500 }
    );
  }
}
