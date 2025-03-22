import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";

export async function POST(req) {
    try {
        console.log("Webhook received");

        // Connect to database
        await connectDB();
        console.log("Connected to MongoDB");

        const wh = new Webhook(process.env.SIGNING_SECRET);
        const headerPayload = headers();

        const svixHeaders = {
            "svix-id": headerPayload.get("svix-id"),
            "svix-timestamp": headerPayload.get("svix-timestamp"),
            "svix-signature": headerPayload.get("svix-signature"),
        };

        // Read raw request body
        const body = await req.text();
        console.log("Raw request body:", body);

        // Verify webhook signature
        const { data, type } = wh.verify(body, svixHeaders);
        console.log("Verified data:", data);
        console.log("Event type:", type);

        // Prepare user data
        const userData = {
            email: data.email_addresses[0]?.email_address || "",
            name: `${data.first_name} ${data.last_name}`.trim(),
            image: data.image_url || "",
        };

        switch (type) {
            case "user.created":
                await User.create(userData);
                console.log("User created:", userData);
                break;

            case "user.updated":
                await User.findOneAndUpdate({ email: userData.email }, userData, { new: true });
                console.log("User updated:", userData);
                break;

            case "user.deleted":
                await User.findOneAndDelete({ email: userData.email });
                console.log("User deleted:", userData.email);
                break;

            default:
                console.log("Unhandled event type:", type);
                break;
        }

        return new Response(JSON.stringify({ message: "Event received" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
