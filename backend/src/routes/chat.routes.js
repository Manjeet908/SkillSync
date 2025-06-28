import express from "express";
import { getChatHistory, saveMessage } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/", getChatHistory); // Get global chat history
router.post("/", saveMessage); // Save a new global message

export default router;