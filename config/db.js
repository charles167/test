import mongoose from "mongoose";

// Use global caching to prevent multiple connections in development
let cached = global.mongoose || { conn: null, promise: null };

export default async function connectDB() {
    if (cached.conn) return cached.conn; // Return cached connection if exists

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then((mongoose) => mongoose);
    }

    try {
        cached.conn = await cached.promise;
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        process.exit(1); // Exit process if connection fails
    }

    global.mongoose = cached; // Store the connection globally

    return cached.conn;
}
