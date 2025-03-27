import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    deleteComment,
    getPostComments   
} from "../controllers/comment.controller.js";

const router = Router();

router.post("/new/:postId", verifyJWT, addComment);
router.delete("/delete/:commentId", verifyJWT, deleteComment);
router.get("/:postId", verifyJWT, getPostComments);

export default router;