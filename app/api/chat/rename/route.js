import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PATCH(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { chatId, name } = await req.json();
    if (!chatId || !name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "chatId and a valid name are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { name: name.trim() },
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
