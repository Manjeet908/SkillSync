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
router.route("/get-creator-followers/:username").get(getCreatorFollowers);
router.route("/get-user-followings/:username").get(getUserFollowings);

// secure routes
router.route("/toggle-follow/:username").post(verifyJWT, toggleFollow);
router.route("/toggle-email-notify/:username").post(verifyJWT, toggleEmailNotify);

export default router;