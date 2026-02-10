import { Router } from "express";
import { verifyToken } from "../controllers/email.controller.js";

const router = Router()

router.route('/verify').post(verifyToken)

export default router