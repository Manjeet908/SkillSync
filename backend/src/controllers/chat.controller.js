import Chat from "../models/chat.model.js";

// Get chat history between two users
export const getChatHistory = async (req, res) => {
  const { userId1, userId2 } = req.params;
  try {
    const messages = await Chat.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

// Save a new message
export const saveMessage = async (req, res) => {
  const { sender, receiver, message } = req.body;
  try {
    const newMessage = await Chat.create({ sender, receiver, message });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
};