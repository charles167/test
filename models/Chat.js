import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    messages: [
      {
        role: {
          type: String,
          required: true,
          enum: ["user", "assistant", "system"], // Restricts values
        },
        content: { type: String, required: true, trim: true },
        timestamp: { type: Date, default: Date.now }, // Uses Date instead of Number
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Model assignment to prevent model recompilation issues
const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;
