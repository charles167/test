import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Get user authentication
    const auth = await getAuth(req);
    const userId = auth?.userId;

    // Check if the user is authenticated
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Prepare the chat object
    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
    };

    // Connect to the database and create the chat
    await connectDB();
    const newChat = await Chat.create(chatData);

    // Return success response with the created chat data
    return NextResponse.json(
      { success: true, message: "Chat created", chat: newChat },
      { status: 201 }
    );
  } catch (error) {
    // Return error response
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
