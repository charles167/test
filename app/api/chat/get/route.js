import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Get authentication data from Clerk
    const authData = getAuth(req);
    console.log("🔍 Auth Data:", authData);

    const { userId } = authData || {};

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Fetch user's chats
    const chats = await Chat.find({ userId }).select("-__v").lean();

    return NextResponse.json({
      success: true,
      chats,
    });

  } catch (error) {
    console.error("🚨 Error fetching chats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chats", error: error.message },
      { status: 500 }
    );
  }
}
