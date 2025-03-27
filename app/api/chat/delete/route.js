import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";

export async function DELETE(req) {
    try {
        // Get user authentication
        const { userId } = getAuth(req);
        const { chatId } = await req.json();

        // Check authentication
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User not authenticated" },
                { status: 401 }
            );
        }

        // Validate chatId
        if (!chatId) {
            return NextResponse.json(
                { success: false, message: "chatId is required" },
                { status: 400 }
            );
        }

        // Connect to the database and delete the chat
        await connectDB();
        const deletedChat = await Chat.deleteOne({ _id: chatId, userId });

        if (deletedChat.deletedCount === 0) {
            return NextResponse.json(
                { success: false, message: "Chat not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Chat deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
