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

        // ✅ Extract user data from multiple possible paths
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
                    const updatedUser = await User.findOneAndUpdate(
                        { email: userData.email },
                        userData,
                        { new: true }
                    );
                    console.log("✅ Updated user in MongoDB:", updatedUser);
                } else {
                    console.log("🆕 Creating new user...");
                    const newUser = await User.create(userData);
                    console.log("✅ New user saved in MongoDB:", newUser);
                }
                break;

            case "user.updated":
                console.log("🔄 Updating user...");
                const updatedUser = await User.findOneAndUpdate(
                    { email: userData.email },
                    userData,
                    { new: true }
                );
                console.log("✅ User updated in MongoDB:", updatedUser);
                break;

            case "user.deleted":
                console.log("🗑️ Deleting user...");
                await User.findOneAndDelete({ email: userData.email });
                console.log("✅ User deleted:", userData.email);
                break;

            case "session.created":
                console.log(`📌 New session created for user ID: ${data.user_id}`);

                // 🛠️ Fetch user details from Clerk API if only user_id is provided
                if (!userData.email) {
                    console.log("🔍 Fetching user details from Clerk API...");
                    const clerkResponse = await fetch(
                        `https://api.clerk.com/v1/users/${data.user_id}`,
                        {
                            headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
                        }
                    );

                    if (!clerkResponse.ok) {
                        console.error("❌ Failed to fetch user from Clerk:", await clerkResponse.text());
                        return NextResponse.json({ error: "Failed to fetch user from Clerk" }, { status: 500 });
                    }

                    const clerkUser = await clerkResponse.json();
                    userData.email = clerkUser.email_addresses?.[0]?.email_address || "";
                    userData.name = `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim();
                    userData.image = clerkUser.image_url || "";

                    if (!userData.email) {
                        console.error("❌ Clerk API did not return a valid email.");
                        return NextResponse.json({ error: "No email found for session user" }, { status: 400 });
                    }

                    console.log("✅ Clerk User Data:", userData);
                }

                // Save or update user in MongoDB after fetching
                console.log("🛠️ Checking if user already exists...");
                const sessionUser = await User.findOne({ email: userData.email });

                if (sessionUser) {
                    console.log("🔄 User already exists, updating...");
                    const updatedUser = await User.findOneAndUpdate(
                        { email: userData.email },
                        userData,
                        { new: true }
                    );
                    console.log("✅ Updated user from session:", updatedUser);
                } else {
                    console.log("🆕 Creating new user from session...");
                    const newUser = await User.create(userData);
                    console.log("✅ New user saved from session:", newUser);
                }

                return NextResponse.json({ message: "Session processed successfully" }, { status: 200 });

            default:
                console.error(`❌ Unhandled event type: ${type}`);
                return NextResponse.json({ error: `Unhandled event type: ${type}` }, { status: 400 });
        }

        return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

    } catch (error) {
        console.error("🚨 Error processing webhook:", error);
        return NextResponse.json({ error: "Webhook processing failed", details: error.message }, { status: 500 });
    }
}
