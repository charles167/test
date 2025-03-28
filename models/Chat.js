import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Chat name must be at least 3 characters long"],
      maxlength: [100, "Chat name must not exceed 100 characters"],
    },
    messages: [
      {
        role: {
          type: String,
          required: true,
          enum: ["user", "assistant", "system"],
        },
        content: {
          type: String,
          required: true,
          trim: true,
          validate: [content => content.trim().length > 0, 'Message content cannot be empty'],
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexes for performance
ChatSchema.index({ userId: 1 });
ChatSchema.index({ createdAt: -1 });

// Model assignment to prevent model recompilation issues
const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;
