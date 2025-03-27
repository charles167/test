import connectDB from "@/config/db";
import Chat from "@/models/Chat"; // ✅ Import the Chat model
import { getAuth } from "@clerk/nextjs/server"; // ✅ Correct import for Clerk Auth
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { userId } = getAuth(req); // Extract userId from Clerk's authentication

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
            });
        }

        const { chatId, name } = await req.json(); // Destructure ChatId and name from the request body

        // Connect to the database and update the chat name
        await connectDB();
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId, userId }, // Ensure the chat belongs to the authenticated user
            { name }, // Update the name field
            { new: true } // Return the updated chat document
        );

        if (!updatedChat) {
            return NextResponse.json({
                success: false,
                message: "Chat not found or not accessible",
            });
        }

        return NextResponse.json({
            success: true,
            message: "Chat renamed successfully",
            data: updatedChat, // Return the updated chat data
        });
        
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
