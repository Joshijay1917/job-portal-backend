import { Router } from "express";
import { login, logout, refreshToken, register, userDetails } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.middleware.js";

const router = Router()

router.route("/register").post(register)
router.route("/login").post(login)

router.route("/logout").post(verifyJwt, logout)
router.route("/me").get(verifyJwt, userDetails)
router.route("/refresh").get(refreshToken)

export default router