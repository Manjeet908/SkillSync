import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import {
    createPost,
    togglePublish,
    deletePost,
    getPostById,
    getAllPosts
} from "../controllers/post.controller.js"

const router = Router()

router.route("/get-post/:id").get(getPostById)
router.route("/get-all-posts").get(getAllPosts)

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
router.route("/toggle-publish/:id").put(verifyJWT, togglePublish)
router.route("/delete-post/:id").delete(verifyJWT, deletePost)

export default router