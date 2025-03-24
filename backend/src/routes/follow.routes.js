import { Router } from "express";
import {
    toggleFollow,
    toggleEmailNotify,
    getCreatorFollowers,
    getUserFollowings
} from "../controllers/follow.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes, change if required
router.route("/get-creator-followers/:creatorId").get(getCreatorFollowers);
router.route("/get-user-followings").get(getUserFollowings);

// secure routes
router.route("/toggle-follow/:creatorId").post(verifyJWT, toggleFollow);
router.route("/toggle-email-notify/:creatorId").post(verifyJWT, toggleEmailNotify);

export default router;