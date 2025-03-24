import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";

const MAX_TIME_DIFF = 300; // 5 minutes in seconds

export async function POST(req) {
  try {
    console.log("🔔 Webhook received");

    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Ensure signing secret is available
    if (!process.env.SIGNING_SECRET) {
      console.error("❌ SIGNING_SECRET is missing");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500 });
    }

    // Initialize Svix webhook verifier
    const wh = new Webhook(process.env.SIGNING_SECRET);

    // Extract headers
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing required headers");
      return new Response(JSON.stringify({ error: "Missing required headers" }), { status: 400 });
    }

    // Convert timestamp and check validity
    const timestamp = parseInt(svixTimestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTime - timestamp);

    console.log(`⏳ Received timestamp: ${timestamp}, Current time: ${currentTime}, Difference: ${timeDiff}s`);

    if (timeDiff > MAX_TIME_DIFF) {
      console.error("⏰ Webhook timestamp too old");
      return new Response(JSON.stringify({ error: "Webhook timestamp too old" }), { status: 400 });
    }

    // Read raw request body properly
    const bodyBuffer = await req.arrayBuffer();
    const bodyText = new TextDecoder().decode(bodyBuffer);

    // Verify webhook signature
    let event;
    try {
      event = wh.verify(bodyText, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (verifyError) {
      console.error("❌ Webhook signature verification failed:", verifyError);
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), { status: 400 });
    }

    console.log("✅ Webhook signature verified");

    // Extract user data
    const email = event?.data?.email_addresses?.[0]?.email_address || null;
    if (!email) {
      console.error("❌ Missing email address in event data");
      return new Response(JSON.stringify({ error: "Missing email in event" }), { status: 400 });
    }

    const userData = {
      email,
      name: `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim(),
      image: event.data.image_url || "",
    };

    // Process event
    switch (event.type) {
      case "user.created":
        try {
          const userExists = await User.findOne({ email: userData.email });
          if (userExists) {
            console.log(`⚠️ User already exists with email: ${userData.email}`);
            return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 });
          }
          await User.create(userData);
          console.log("🎉 User created:", userData);
        } catch (dbError) {
          console.error("❌ Error saving user to database:", dbError);
          return new Response(JSON.stringify({ error: "Error saving user to database", details: dbError.message }), { status: 500 });
        }
        break;

      case "user.updated":
        try {
          await User.findOneAndUpdate({ email: userData.email }, userData, { new: true });
          console.log("🔄 User updated:", userData);
        } catch (dbError) {
          console.error("❌ Error updating user:", dbError);
          return new Response(JSON.stringify({ error: "Error updating user", details: dbError.message }), { status: 500 });
        }
        break;

      case "user.deleted":
        try {
          await User.findOneAndDelete({ email: userData.email });
          console.log("🗑️ User deleted:", userData.email);
        } catch (dbError) {
          console.error("❌ Error deleting user:", dbError);
          return new Response(JSON.stringify({ error: "Error deleting user", details: dbError.message }), { status: 500 });
        }
        break;

      default:
        console.log("⚠️ Unhandled event type:", event.type);
        break;
    }

    return new Response(JSON.stringify({ message: "Event processed successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed", details: error.message }), { status: 500 });
  }
}
