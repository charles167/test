import { NextResponse } from "next/server";
import Chat from "@/models/Chat"; // Import the chat model

export async function POST(req) {
  try {
    const { userId, message } = await req.json();
    const newChat = new Chat({ userId, messages: [{ text: message }] });
    await newChat.save();
    return NextResponse.json({ success: true, chat: newChat });
  } catch (error) {
    console.error("❌ Error creating chat:", error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
