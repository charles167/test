import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node"; // Correct Clerk import
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

// Initialize Clerk client with your API key (or use middleware)
const clerk = ClerkExpressWithAuth();

// POST API handler to create a new chat
export async function POST(req) {
  try {
    // Get the auth token from the request headers
    const authToken = req.headers["authorization"]?.split("Bearer ")[1]; // Extract the token correctly

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token with Clerk
    let user;
    try {
      user = await clerk.verifyToken(authToken); // Clerk SDK now handles token verification
    } catch (verificationError) {
      console.error("Token verification failed:", verificationError);
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Now you have the user ID
    const userId = user.id;

    // Parse request body
    const { name = "New Chat" } = await req.json(); // Allow dynamic chat name

    // Validate name field
    if (!name.trim()) {
      return NextResponse.json(
        { success: false, message: "Chat name cannot be empty" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB(); // Ensure that connection is successful

    // Prepare the chat object
    const chatData = {
      userId,
      messages: [],
      name,
    };

    // Create the chat in the database
    const newChat = await Chat.create(chatData);

    // Return success response with the created chat data
    return NextResponse.json(
      {
        success: true,
        message: "Chat created successfully",
        chat: newChat.toObject(), // Convert to plain object
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat:", error); // Log error message with stack trace

    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while creating the chat" },
      { status: 500 }
    );
  }
}
