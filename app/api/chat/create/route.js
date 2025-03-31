import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import sanitize from "sanitize-html"; // Ensure this package is installed
import { headers } from "next/headers";

export async function POST(req) {
  try {
    // Establish DB connection
    await connectDB();

    // Authenticate user
    const { userId } = getAuth({ headers: headers() });
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { name, message } = await req.json();
    if (!name || !message) {
      return NextResponse.json(
        { success: false, message: "Name and message are required" },
        { status: 400 }
      );
    }

    // Trim and sanitize inputs
    const sanitizedName = sanitize(name.trim());
    const sanitizedMessage = sanitize(message.trim());

    // Validate length
    if (sanitizedMessage.length > 500) {
      return NextResponse.json(
        { success: false, message: "Message is too long (max 500 characters)" },
        { status: 400 }
      );
    }

    if (sanitizedName.length === 0) {
      return NextResponse.json(
        { success: false, message: "Name cannot be empty" },
        { status: 400 }
      );
    }

    // Create new chat entry
    const newChat = new Chat({
      userId,
      name: sanitizedName,
      messages: [{ role: "user", content: sanitizedMessage, timestamp: Date.now() }],
    });

    await newChat.save();

    return NextResponse.json(
      { success: true, message: "Chat created successfully", data: newChat },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { success: false, message: "Unexpected error while creating chat" },
      { status: 500 }
    );
  }
}
