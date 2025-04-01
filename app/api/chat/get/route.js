import { NextResponse } from "next/server";
import Chat from "@/models/Chat";

export async function GET(req) {
  try {
    const chats = await Chat.find();
    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}
