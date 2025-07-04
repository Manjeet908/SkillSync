import { Router } from "express";
import {
    toggleFollow,
    toggleNotify,
    getCreatorFollowers,
    getUserFollowings,
    checkIsFollowing
} from "../controllers/follow.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes, change if required
router.route("/get-creator-followers/:username").get(getCreatorFollowers);
router.route("/get-user-followings/:username").get(getUserFollowings);

// secure routes
router.route("/toggle-follow/:username").post(verifyJWT, toggleFollow);
router.route("/toggle-notify/:username").post(verifyJWT, toggleNotify);
router.route("/check-following/:username").get(verifyJWT, checkIsFollowing);

export default router;