import { NextResponse } from "next/server";
import connectDB from "@/utils/db"; // Ensure you have a proper DB connection file
import Chat from "@/models/Chat";

export async function GET(req) {
  try {
    await connectDB(); // Ensure MongoDB is connected before querying
    const chats = await Chat.find();
    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}
