import { Router } from "express";
import { 
  getGlobalChatHistory, 
  getSkillChatHistory,
  sendGlobalMessage, 
  sendSkillMessage,
  getChatRooms,
  editMessage,
  deleteMessage,
  getPrivateChatHistory,
  sendPrivateMessage,
  getUserConversations,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Chat rooms
router.get("/rooms", getChatRooms); // Get all available chat rooms

// Global chat
router.get("/global", getGlobalChatHistory); // Get global chat history
router.post("/global", sendGlobalMessage); // Send global message

// Skill-specific chat
router.get("/skill/:skillId", getSkillChatHistory); // Get skill chat history
router.post("/skill/:skillId", sendSkillMessage); // Send skill message

// Private/Direct messaging
router.get("/private/:userId", getPrivateChatHistory); // Get private chat history with specific user
router.post("/private/:userId", sendPrivateMessage); // Send private message to specific user
router.get("/conversations", getUserConversations); // Get all user's conversations

// Message management
router.put("/message/:messageId", editMessage); // Edit message
router.delete("/message/:messageId", deleteMessage); // Delete message

export default router;