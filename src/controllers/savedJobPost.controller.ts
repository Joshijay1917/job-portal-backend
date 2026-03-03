import { SavedJobsService } from "../services/savedJobPost.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllSavedJobPosts = asyncHandler(async (req, res) => {
    const userId = req.user.id

    const posts = await SavedJobsService.getPosts(userId)

    res
    .status(200)
    .json(
        new ApiResponse(200, posts, 'Get all saved posts!')
    )
})

export const saveJobPost = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const jobPostId = req.body.jobPostId as string

    const saved = await SavedJobsService.savePost(userId, jobPostId)

    res
    .status(200)
    .json(
        new ApiResponse(200, saved, 'Save job post successfully!')
    )
})

export const deleteSavedJobPost = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const jobPostId = req.params.jobPostId as string

    const result = await SavedJobsService.deletePost(userId, jobPostId)

    res
    .status(200)
    .json(
        new ApiResponse(200, result, 'Delete from saved jobs!')
    )
})