import { Router } from "express";
import { ApplyJobPost, filterJobs, getJobPosts, JobPost } from "../controllers/job.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.middleware.js";
import { allowRoles } from "../middlewares/allowedRoutes.middleware.js";

const router = Router()

router.route("/").get(getJobPosts)
router.route("/post").post(verifyJwt, allowRoles('recruiter'), JobPost)
router.route("/apply").post(verifyJwt, allowRoles('candidate'), ApplyJobPost)
router.route("/filter").post(filterJobs)

export default router