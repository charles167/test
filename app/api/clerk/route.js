import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    console.log("🔗 Webhook received");

    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Get current server timestamp (in seconds)
    const serverTimestamp = Math.floor(Date.now() / 1000);

    // Get headers from request
    const svixHeaders = {
      "svix-id": req.headers.get("svix-id"),
      "svix-timestamp": req.headers.get("svix-timestamp"),
      "svix-signature": req.headers.get("svix-signature"),
    };

    console.log("📌 Svix Headers:", svixHeaders);
    console.log("🕒 Server Timestamp:", serverTimestamp);
    console.log("🕒 Svix Timestamp:", svixHeaders["svix-timestamp"]);

    // Read raw request body
    const rawBody = await req.text();
    console.log("📌 Raw request body:", rawBody);

    // ✅ Verify webhook signature
    const wh = new Webhook(process.env.SIGNING_SECRET, {
      tolerance: 300, // 5-minute tolerance
    });

    let event;
    try {
      event = wh.verify(rawBody, svixHeaders);
    } catch (verifyError) {
      console.error("❌ Webhook signature verification failed:", verifyError);
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), { status: 400 });
    }

    console.log("✅ Verified event:", event);

    return new Response(JSON.stringify({ message: "Event processed successfully" }), { status: 200 });
  } catch (error) {
    console.error("🚨 Error processing webhook:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed", details: error.message }), { status: 500 });
  }
}
