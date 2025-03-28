import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    // Get authentication data from Clerk
    const authData = getAuth(req);
    console.log("🔍 Auth Data:", authData);

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
    console.log("🔍 Connecting to MongoDB...");
    await connectDB();
    console.log("🔍 Connected to MongoDB");

    // Fetch user's chats from MongoDB
    try {
      const chats = await Chat.find({ userId }).select("-__v").lean();
      console.log("🔍 Found chats:", chats);
      return NextResponse.json({
        success: true,
        chats,
      });
    } catch (dbError) {
      console.error("🚨 Error fetching chats from MongoDB:", dbError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch chats", error: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("🚨 Error fetching auth data or connecting to DB:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
