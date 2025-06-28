import Chat from "../models/chat.model.js";

// Get global chat history
export const getChatHistory = async (req, res) => {
  try {
    const messages = await Chat.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

// Save a new global message
export const saveMessage = async (req, res) => {
  const { username, message } = req.body;
  try {
    const newMessage = await Chat.create({ username, message });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
};