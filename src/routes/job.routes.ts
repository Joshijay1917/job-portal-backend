import { Router } from "express";
import { ApplyJobPost, getJobPosts, JobPost } from "../controllers/job.controller.js";

const router = Router()

router.route("/").get(getJobPosts)
router.route("/post").post(JobPost)
router.route("/apply").post(ApplyJobPost)

export default router