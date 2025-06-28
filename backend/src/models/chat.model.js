import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Add username field
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Chat", chatSchema);