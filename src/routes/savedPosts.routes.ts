import { Router } from "express";
import { deleteSavedJobPost, getAllSavedJobPosts, saveJobPost } from "../controllers/savedJobPost.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.middleware.js";
import { allowRoles } from "../middlewares/allowedRoutes.middleware.js";

const router = Router()

router.route('/').get(verifyJwt, allowRoles('candidate'), getAllSavedJobPosts)
router.route('/').post(verifyJwt, allowRoles('candidate'), saveJobPost)
router.route('/:jobPostId').delete(verifyJwt, allowRoles('candidate'), deleteSavedJobPost)

export default router