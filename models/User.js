import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // Store Clerk userId
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: "" }, // Default to empty string instead of required
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
