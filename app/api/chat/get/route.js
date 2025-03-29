import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    // Get authentication data from Clerk
    const { userId } = getAuth(req);

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Fetch user's chats from MongoDB, excluding the __v field
    const chats = await Chat.find({ userId }).select("-__v").lean();

    // Return chats (empty array if none found)
    return NextResponse.json(
      { success: true, chats },
      { status: 200 }
    );

  } catch (error) {
    console.error("🚨 Error fetching chats:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
