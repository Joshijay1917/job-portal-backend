import { JobService } from "../services/job.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const JobPost = asyncHandler(async (req, res) => {
    const post = await JobService.post(req.body)

    res
    .status(201)
    .json(
        new ApiResponse(201, post, 'Job post successfully!')
    )
})

export const getJobPosts = asyncHandler(async (req, res) => {
    const page = req.query.page
    const posts = await JobService.get(Number(page))

    res
    .status(200)
    .json(
        new ApiResponse(200, posts, "Get posts successfully!")
    )
})

export const ApplyJobPost = asyncHandler(async (req, res) => {
    const appli = await JobService.ApplyJob(req.body)

    if(!appli) {
        throw new ApiError(500, 'Failed to get application!')
    }

    res
    .status(201)
    .json(
        new ApiResponse(201, appli, 'Applied to jobpost!')
    )
})