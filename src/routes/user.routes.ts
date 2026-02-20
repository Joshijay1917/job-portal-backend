import { Router } from "express";
import { getAppDetail, getApplications, getAppliedJobs, getPosts, getUserDetails, updateAppStatus, updateProfile } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.middleware.js";
import { allowRoles } from "../middlewares/allowedRoutes.middleware.js";

const router = Router()

router.route("/details").get(verifyJwt, getUserDetails)
router.route("/edit").put(verifyJwt, updateProfile)

router.route("/posts").get(verifyJwt, allowRoles("recruiter"), getPosts)
router.route("/applied-posts").get(verifyJwt, allowRoles("candidate"), getAppliedJobs)

router.route("/applications").get(verifyJwt, allowRoles('recruiter'), getApplications)
router.route("/applications/:applicationId").get(verifyJwt, allowRoles('recruiter'), getAppDetail)
router.route("/applications/update").post(verifyJwt, allowRoles('recruiter'), updateAppStatus)

export default router