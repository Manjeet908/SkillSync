import express from "express";
import { getChatHistory, saveMessage } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/:userId1/:userId2", getChatHistory); // Get chat between two users
router.post("/", saveMessage); // Save a new message

export default router;