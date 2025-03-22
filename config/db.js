import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

export default async function connectDB() {
    if (cached.conn) return cached.conn; // Corrected typo

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then((mongoose) => mongoose);
    }

    try {
        cached.conn = await cached.promise;
        global.mongoose = cached; // Store connection globally
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        cached.promise = null; // Reset promise in case of failure
    }

    return cached.conn;
}
