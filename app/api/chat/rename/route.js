import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import sanitize from "sanitize-html";
import { headers } from "next/headers";

export async function PATCH(req) {
  try {
    // Authenticate user
    const { userId } = getAuth({ headers: headers() });
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const { chatId, name } = await req.json();

    // Validate chatId
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chatId format" },
        { status: 400 }
      );
    }

    // Validate name input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "A valid name is required" },
        { status: 400 }
      );
    }

    // Sanitize the name to prevent XSS attacks
    const sanitizedName = sanitize(name.trim());

    // Update chat name
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { name: sanitizedName },
      { new: true, runValidators: true }
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
    console.error("Error renaming chat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to rename chat" },
      { status: 500 }
    );
  }
}
