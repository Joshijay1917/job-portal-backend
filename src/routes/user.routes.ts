import { Router } from "express";
import { forgotPassword, loginUser, refreshToken, registerUser, userDetails } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/forgot-password").post(forgotPassword)

router.route("/me").get(verifyJwt, userDetails)
router.route("/refresh").get(refreshToken)

export default router