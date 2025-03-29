import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    // Get authentication data from Clerk
    const authData = getAuth(req);
    const { userId } = authData || {}; // Deconstruct userId from authData

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // If userId is a string but needs to be validated as ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        { success: false, message: "Database connection failed" },
        { status: 500 }
      );
    }

    // Fetch user's chats from MongoDB, excluding the __v field
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

    // Return a more specific error message for internal errors
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
