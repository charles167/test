import mongoose from "mongoose";
import { Chat } from "@/models/Chat";
import { User } from "@/models/User";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req) {
  try {
    // Ensure database connection
    await connectDB();

    // Authenticate user
    const { userId } = getAuth({ headers: headers() });
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Trim and validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId.trim())) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }

    // Find user and exclude sensitive fields
    const user = await User.findById(userId.trim()).select("-password -__v").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user chats
    const chats = await Chat.find({ userId: userId.trim() }).select("-__v").lean();

    return NextResponse.json({ success: true, chats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
