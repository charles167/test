import { getAuth } from "@clerk/nextjs/server"; // Corrected Clerk import for Next.js
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

// POST API handler to create a new chat
export async function POST(req) {
  try {
    // Authenticate user
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { name = "New Chat" } = await req.json();

    // Validate name field
    if (!name.trim()) {
      return NextResponse.json(
        { success: false, message: "Chat name cannot be empty" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Create new chat
    const newChat = await Chat.create({
      userId,
      messages: [],
      name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Chat created successfully",
        chat: newChat.toObject(), // Convert to plain object
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while creating the chat" },
      { status: 500 }
    );
  }
}
