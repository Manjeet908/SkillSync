import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getExploreSkills } from '../controllers/skill.controller.js'

const router = Router()

router.route("/explore").get(verifyJWT, getExploreSkills)

export default router