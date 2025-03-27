import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { auth } from "@clerk/nextjs"; // ✅ Correct import for Clerk Auth in Next.js App Router
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Get authenticated user ID
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectDB();

    // Fetch user's chats (excluding unnecessary fields)
    const chats = await Chat.find({ userId }, "-__v").lean();

    return NextResponse.json({
      success: true,
      data: chats.length ? chats : [], // Always return an array
    });

  } catch (error) {
    console.error("🚨 Error fetching chats:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch chats", error: error.message },
      { status: 500 }
    );
  }
}
