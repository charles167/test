import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server"; // ✅ Use getAuth for App Router
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Get authenticated user ID
    const { userId } = getAuth(req); // ✅ Fix: Use getAuth(req) instead of auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectDB();

    // Fetch user's chats
    const chats = await Chat.find({ userId }).select("-__v").lean();

    return NextResponse.json({
      success: true,
      chats, // Return the chats array directly
    });

  } catch (error) {
    console.error("🚨 Error fetching chats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chats", error: error.message },
      { status: 500 }
    );
  }
}
