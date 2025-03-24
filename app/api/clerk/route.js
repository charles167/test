import { Webhook } from "svix";
import { buffer } from "micro";
import connectDB from "@/config/db";
import User from "@/models/User";

// Disable body parser for raw request body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Set max allowed time difference (5 minutes)
const MAX_TIME_DIFF = 300;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("🔔 Clerk webhook received");

  // Connect to MongoDB
  await connectDB();
  console.log("✅ Connected to MongoDB");

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("❌ Webhook secret is missing");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  // Read raw body for signature verification
  const body = await buffer(req);
  const headers = req.headers;

  // Extract required headers
  const svixId = headers["svix-id"];
  const svixTimestamp = headers["svix-timestamp"];
  const svixSignature = headers["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("❌ Missing webhook headers");
    return res.status(400).json({ error: "Missing webhook headers" });
  }

  // Timestamp validation (prevent replay attacks)
  const currentTime = Math.floor(Date.now() / 1000);
  const receivedTime = parseInt(svixTimestamp, 10);
  const timeDiff = Math.abs(currentTime - receivedTime);

  console.log(`⏳ Received timestamp: ${receivedTime}, Current: ${currentTime}, Difference: ${timeDiff}s`);

  if (timeDiff > MAX_TIME_DIFF) {
    console.error("⏰ Webhook timestamp too old");
    return res.status(400).json({ error: "Webhook timestamp too old" });
  }

  try {
    // Verify the webhook signature
    const wh = new Webhook(webhookSecret);
    const event = wh.verify(body.toString(), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    console.log("✅ Webhook verified successfully:", event.type);

    const email = event?.data?.email_addresses?.[0]?.email_address;
    if (!email) {
      console.error("❌ Missing email in event data");
      return res.status(400).json({ error: "Missing email in event" });
    }

    const userData = {
      email,
      name: `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim(),
      image: event.data.image_url || "",
    };

    switch (event.type) {
      case "user.created":
        try {
          const userExists = await User.findOne({ email });
          if (userExists) {
            console.log(`⚠️ User already exists: ${email}`);
            return res.status(400).json({ message: "User already exists" });
          }
          await User.create(userData);
          console.log("🎉 User created:", userData);
        } catch (dbError) {
          console.error("❌ Error saving user:", dbError);
          return res.status(500).json({ error: "Error saving user", details: dbError.message });
        }
        break;

      case "user.updated":
        try {
          await User.findOneAndUpdate({ email }, userData, { new: true });
          console.log("🔄 User updated:", userData);
        } catch (dbError) {
          console.error("❌ Error updating user:", dbError);
          return res.status(500).json({ error: "Error updating user", details: dbError.message });
        }
        break;

      case "user.deleted":
        try {
          await User.findOneAndDelete({ email });
          console.log("🗑️ User deleted:", email);
        } catch (dbError) {
          console.error("❌ Error deleting user:", dbError);
          return res.status(500).json({ error: "Error deleting user", details: dbError.message });
        }
        break;

      default:
        console.log("⚠️ Unhandled event type:", event.type);
    }

    return res.status(200).json({ message: "Event processed successfully" });
  } catch (error) {
    console.error("❌ Webhook verification failed:", error);
    return res.status(400).json({ error: "Webhook verification failed" });
  }
}
