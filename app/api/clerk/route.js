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

        // Initialize Svix webhook verifier
        const wh = new Webhook(process.env.SIGNING_SECRET);

        // Get headers from NextRequest
        const svixHeaders = {
            "svix-id": req.headers.get("svix-id"),
            "svix-timestamp": req.headers.get("svix-timestamp"),
            "svix-signature": req.headers.get("svix-signature"),
        };
        console.log("📌 Svix Headers:", svixHeaders);

        // Read raw request body (⚠️ Required for signature verification)
        const rawBody = await req.text();
        console.log("📜 Raw request body:", rawBody);

        // Verify webhook signature
        let event;
        try {
            event = wh.verify(rawBody, svixHeaders);
        } catch (error) {
            console.error("❌ Webhook verification failed:", error);
            return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
        }

        console.log("✅ Verified event:", event);
        const { data, type } = event;

        // Prepare user data
        const userData = {
            email: data?.email_addresses?.[0]?.email_address || "",
            name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
            image: data?.image_url || "",
        };

        switch (type) {
            case "user.created":
                await User.create(userData);
                console.log("🆕 User created:", userData);
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

        return NextResponse.json({ message: "Event received" }, { status: 200 });

    } catch (error) {
        console.error("🚨 Error processing webhook:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
