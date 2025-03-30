import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch user chats using userId directly as it is a string
    const chats = await Chat.find({ userId }).select("-__v").lean();

    // Handle case if no chats are found
    if (!chats || chats.length === 0) {
      return NextResponse.json(
        { success: false, message: "No chats found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, chats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chats:", error);

    // Add more specific error handling for DB connection failure
    if (error.name === "MongoNetworkError") {
      return NextResponse.json(
        { success: false, message: "Database connection failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
