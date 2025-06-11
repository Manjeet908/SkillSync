import { Router } from 'express'
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    updateWantToBeHired,
    addToInterestedSkills,
    removeFromInterestedSkills,
    updateLocation,
    forgotPassword,
    resetPassword,
    getUserProfile,
    suggestUsers
} from '../controllers/user.controller.js'

const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/auth/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password/:token").patch(resetPassword)


//secure routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").put(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/update-cover-image").put(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/update-want-to-be-hired").put(verifyJWT, updateWantToBeHired)
router.route("/add-interested-skills").patch(verifyJWT, addToInterestedSkills)
router.route("/remove-interested-skills").patch(verifyJWT, removeFromInterestedSkills)
router.route("/update-location").put(verifyJWT, updateLocation)
router.route("/get-user-profile/:username").get(verifyJWT, getUserProfile)
router.route("/suggest-people").get(verifyJWT, suggestUsers)


export default router