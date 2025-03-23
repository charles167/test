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

    // ... (rest of your webhook processing logic)

    // For example, creating a user:
    const userData = {
      email: "test@example.com",
      name: "Test User",
      image: "https://example.com/image.png",
    };

    const user = await User.create(userData);
    console.log("User created:", user);

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
