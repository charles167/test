const mongoose = require("mongoose");
const dotenv = require("dotenv").config()


const MONGODB_URI = process.env.MONGODB_URI || "your-fallback-mongodb-uri-here";

if (!MONGODB_URI) {
    console.error("❌ No MONGODB_URI found. Make sure it's in your .env file.");
    process.exit(1);
}



console.log("🔄 Connecting to MongoDB...");

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("✅ MongoDB Connected Successfully!");
        process.exit(0); // Exit after success
    })
    .catch((error) => {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Exit with error
    });
