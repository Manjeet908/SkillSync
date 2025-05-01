import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    togglePostLike,
    toggleCommentLike,
    getLikedPosts
} from "../controllers/like.controller.js";

const router = Router();

router.post("/post/:postId", verifyJWT, togglePostLike);
router.post("/comment/:commentId", verifyJWT, toggleCommentLike);
router.get("/posts", verifyJWT, getLikedPosts);

export default router;