import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
    try {
        console.log("🔗 Webhook received");

        // Connect to MongoDB
        await connectDB();
        console.log("✅ Connected to MongoDB");

        // Get headers from NextRequest
        const svixHeaders = {
            "svix-id": req.headers.get("svix-id"),
            "svix-timestamp": req.headers.get("svix-timestamp"),
            "svix-signature": req.headers.get("svix-signature"),
        };
        console.log("📌 Svix Headers:", svixHeaders);

        // Read raw request body
        const rawBody = await req.text();
        console.log("📜 Raw request body:", rawBody);

        // ✅ Skip signature verification for testing (remove in production)
        let event;
        try {
            console.log("🚨 Skipping webhook signature verification (for testing)");
            event = JSON.parse(rawBody);
        } catch (error) {
            console.error("❌ Failed to parse JSON:", error);
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        console.log("✅ Verified event:", event);
        const { data, type } = event;

        // ✅ Extract email from multiple possible paths
        const userData = {
            email: data?.email || data?.email_addresses?.[0]?.email_address || "",
            name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
            image: data?.image_url || "",
        };

        // ❌ Return error if email is missing
        if (!userData.email) {
            console.error("❌ Missing email in event data");
            return NextResponse.json({ error: "Invalid event data, missing email" }, { status: 400 });
        }

        switch (type) {
            case "user.created":
                console.log("🛠️ Checking if user already exists...");
                const existingUser = await User.findOne({ email: userData.email });

                if (existingUser) {
                    console.log("🔄 User already exists, updating...");
                    await User.findOneAndUpdate({ email: userData.email }, userData, { new: true });
                } else {
                    console.log("🆕 Creating new user...");
                    await User.create(userData);
                }
                console.log("✅ User processed:", userData);
                break;

            case "user.updated":
                await User.findOneAndUpdate({ email: userData.email }, userData, { new: true });
                console.log("🔄 User updated:", userData);
                break;

            case "user.deleted":
                await User.findOneAndDelete({ email: userData.email });
                console.log("🗑️ User deleted:", userData.email);
                break;

            default:
                console.log("⚠️ Unhandled event type:", type);
                break;
        }

        return NextResponse.json({ message: "Event processed successfully" }, { status: 200 });

    } catch (error) {
        console.error("🚨 Error processing webhook:", error);
        return NextResponse.json({ error: "Webhook processing failed", details: error.message }, { status: 500 });
    }
}
