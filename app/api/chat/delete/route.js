import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function DELETE(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { chatId } = await req.json();
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chatId format" },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedChat = await Chat.findOneAndDelete({ _id: chatId, userId });
    if (!deletedChat) {
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
      { success: false, message: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
