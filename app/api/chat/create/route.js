import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import sanitize from "sanitize-html";  // Import sanitize library (if using)

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { name, message } = await req.json();
    
    if (!name || !message) {
      return NextResponse.json(
        { success: false, message: "Name and initial message are required" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitize(name);
    const sanitizedMessage = sanitize(message);

    // Optional: Add length validation for message
    if (sanitizedMessage.length > 500) {
      return NextResponse.json(
        { success: false, message: "Message is too long" },
        { status: 400 }
      );
    }

    const newChat = new Chat({
      userId,
      name: sanitizedName,
      messages: [
        { role: "user", content: sanitizedMessage, timestamp: Date.now() },
      ],
    });

    await newChat.save();

    return NextResponse.json(
      { success: true, message: "Chat created successfully", data: newChat },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create chat" },
      { status: 500 }
    );
  }
}
