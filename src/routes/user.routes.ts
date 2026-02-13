import { Router } from "express";
import { getPosts, getUserDetails, updateProfile } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.middleware.js";
import { allowRoles } from "../middlewares/allowedRoutes.middleware.js";

const router = Router()

router.route("/details").get(verifyJwt, getUserDetails)
router.route("/edit").put(verifyJwt, updateProfile)

router.route("/posts").get(verifyJwt, allowRoles("recruiter"), getPosts)

export default router