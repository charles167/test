import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }
    console.log("Connecting to MongoDB:", process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Options are optional in Mongoose v6+
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ MongoDB connected successfully");
    return conn;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error; // Optionally rethrow to let the calling API handle it
  }
};

export default connectDB;
