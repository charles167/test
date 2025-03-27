import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Get user authentication
    const { userId } = getAuth(req);

    // Check if the user is authenticated
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { name = "New Chat" } = await req.json(); // Allow dynamic chat name

    // Prepare the chat object
    const chatData = {
      userId,
      messages: [],
      name,
    };

    // Connect to the database and create the chat
    await connectDB();
    const newChat = await Chat.create(chatData);

    // Return success response with the created chat data
    return NextResponse.json(
      { success: true, message: "Chat created successfully", chat: newChat },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat:", error); // Debugging log

    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while creating the chat" },
      { status: 500 }
    );
  }
}
