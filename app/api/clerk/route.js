import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers"; // Correct import

export async function POST(req) { // Correct function declaration
    try {
        const wh = new Webhook(process.env.SIGNING_SECRET);

        // Get headers from request
        const headerPayload = headers();
        const svixHeaders = {
            "svix-id": headerPayload.get("svix-id"),
            "svis-timestamp":(await headerPayload).get("svix-timestamp")
            "svix-signature": headerPayload.get("svix-signature"),
        };

        // Get the payload and verify it
        const payload = await req.json();
        const body = JSON.stringify(payload);
        const { data, type } = wh.verify(body, svixHeaders);

        // Prepare the user data to be saved in the database
        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            name: `${data.first_name} ${data.last_name}`, // Correct string interpolation
            image: data.image_url,
        };

        // Connect to the database
        await connectDB();

        // Handle different event types
        switch (type) {
            case "user.created":
                await User.create(userData);
                break;

            case "user.updated": // Fixed duplicate case
                await User.findByIdAndUpdate(data.id, userData, { new: true });
                break;

            case "user.deleted":
                await User.findByIdAndDelete(data.id);
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
