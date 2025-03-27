import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { auth } from "@clerk/nextjs/server"; // ✅ Correct import for Clerk Auth in Next.js App Router
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { userId } = auth(); // ✅ Correct function to get user ID

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
            }, { status: 401 });
        }

        // Connect to MongoDB and fetch user's chats
        await connectDB();
        const data = await Chat.find({ userId });

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error("🚨 Error fetching chats:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
