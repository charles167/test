import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    // Authenticate the user
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { chatId, name } = await req.json();

    // Validate input fields
    if (!chatId || !name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "chatId and a valid name are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Find and update the chat
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId }, // Ensure the chat belongs to the authenticated user
      { name: name.trim() }, // Trim input to prevent unnecessary spaces
      { new: true, runValidators: true } // Return updated chat & enforce validation
    ).lean();

    // Check if the chat was found and updated
    if (!updatedChat) {
      return NextResponse.json(
        { success: false, message: "Chat not found or unauthorized access" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Chat renamed successfully", data: updatedChat },
      { status: 200 }
    );

  } catch (error) {
    console.error("🚨 Error renaming chat:", error);

    return NextResponse.json(
      { success: false, message: "An error occurred while renaming the chat" },
      { status: 500 }
    );
  }
}
