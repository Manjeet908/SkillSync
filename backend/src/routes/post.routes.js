import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import {
    createPost,
    togglePublish,
    deletePost,
    getPostById,
    getAllPosts,
    getUserPosts
} from "../controllers/post.controller.js"

const router = Router()

// secure routes
router.route("/create-post").post(verifyJWT,
    upload.fields([
        {
            name: "media",
            maxCount: 5
        }
    ]),
    createPost
)

router.route("/get-post/:id").get(verifyJWT, getPostById)
router.route("/get-all-posts").get(verifyJWT, getAllPosts)
router.route("/toggle-publish/:id").put(verifyJWT, togglePublish)
router.route("/delete-post/:id").delete(verifyJWT, deletePost)
router.route("/get-user-posts").get(verifyJWT, getUserPosts)

export default router