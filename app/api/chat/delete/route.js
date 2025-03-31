import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { headers } from "next/headers";

export async function DELETE(req) {
  try {
    // Ensure DB connection
    await connectDB();

    // Authenticate user
    const { userId } = getAuth({ headers: headers() });
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { chatId } = await req.json();

    if (!chatId || typeof chatId !== "string" || !mongoose.Types.ObjectId.isValid(chatId.trim())) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing chatId" },
        { status: 400 }
      );
    }

    // Trim chatId to remove extra spaces
    const trimmedChatId = chatId.trim();

    // Find and delete chat
    const deletedChat = await Chat.findOneAndDelete({ _id: trimmedChatId, userId });

    if (!deletedChat) {
      return NextResponse.json(
        { success: false, message: "Chat not found or unauthorized access" },
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
      { success: false, message: "An unexpected error occurred while deleting chat" },
      { status: 500 }
    );
  }
}
