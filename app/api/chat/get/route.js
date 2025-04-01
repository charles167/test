import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    // Get authentication data from Clerk
    const authData = getAuth(req);
    const { userId } = authData || {};

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Validate the userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Fetch user's chats from MongoDB
    const chats = await Chat.find({ userId }).select("-__v").lean();

    // Check if chats are found
    if (!chats || chats.length === 0) {
      return NextResponse.json(
        { success: true, message: "No chats available", chats: [] },
        { status: 200 }
      );
    }

    // Return success response with chats data
    return NextResponse.json({
      success: true,
      chats,
    });

  } catch (error) {
    console.error("🚨 Error fetching auth data or connecting to DB:", error.message);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
