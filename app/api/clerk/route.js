// app/api/clerk/route.js
import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    console.log("Webhook received");

    // Connect to MongoDB
    await connectDB();
    console.log("Connected to MongoDB");

    // Initialize Svix webhook verifier
    const wh = new Webhook(process.env.SIGNING_SECRET);
    const svixHeaders = {
      "svix-id": req.headers.get("svix-id"),
      "svix-timestamp": req.headers.get("svix-timestamp"),
      "svix-signature": req.headers.get("svix-signature"),
    };

    // Log the timestamp and current time for debugging
    const timestamp = req.headers.get("svix-timestamp");
    console.log("Received timestamp:", timestamp);
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    console.log("Current time:", currentTime);

    // Check if timestamp is within acceptable range (e.g., 5 minutes)
    const timeDiff = currentTime - parseInt(timestamp);
    if (timeDiff > 300) { // 300 seconds = 5 minutes
      console.error("Webhook timestamp too old. Difference:", timeDiff);
      return new Response(JSON.stringify({ error: "Webhook timestamp too old" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Read raw request body
    const bodyText = await req.text();
    console.log("Raw request body:", bodyText);

    // Verify webhook signature
    let event;
    try {
      event = wh.verify(bodyText, svixHeaders);
    } catch (verifyError) {
      console.error("Webhook signature verification failed:", verifyError);
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Verified event:", event);

    // Extract user data from event
    const userData = {
      email: event.data.email_addresses ? event.data.email_addresses[0]?.email_address : "",
      name: `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim(),
      image: event.data.image_url || "",
    };

    // Process event based on type
    switch (event.type) {
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
        console.log("Unhandled event type:", event.type);
        break;
    }

    return new Response(
      JSON.stringify({ message: "Event processed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


