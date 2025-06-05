import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"

import {
    getUserNotifications,
    markAsReadMany,
    markAllAsRead,
    deleteReadNotifications
} from "../controllers/notification.controller.js"

const router = Router()

router.route("/user-notifications").get(verifyJWT, getUserNotifications)
router.route("/mark-read-many").patch(verifyJWT, markAsReadMany)
router.route("/mark-read-all").patch(verifyJWT, markAllAsRead)
router.route("/delete-read").delete(verifyJWT, deleteReadNotifications)

export default router