import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    // Check if the user is authenticated, and return an error if not
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
    }

    // Prepare the chat to be saved in the database
    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
    };

    // Connect to the database and create a new chat
    await connectDB();
    await Chat.create(chatData);

    // Return success response
    return NextResponse.json({ success: true, message: "Chat created" });
  } catch (error) {
    // Return error response
    return NextResponse.json({ success: false, error: error.message || "An error occurred" }, { status: 500 });
  }
}
