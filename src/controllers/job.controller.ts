import { JobService } from "../services/job.service.js";
import { RecruiterService } from "../services/recruiter.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const JobPost = asyncHandler(async (req, res) => {
    const id = req.user?.id
    if(!id) {
        throw new ApiError(400, 'Recruiter id not found!')
    }
    
    const post = await JobService.post(req.body, id)

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

export const getJobPostDetails = asyncHandler(async (req, res) => {
    const id = req.params.id as string
    let candidateId = null
    if(req.user) {
        const userId = req.user.id
        candidateId = req.user.role === 'candidate' ? userId : null
    }

    const details = await JobService.getDetails(id, candidateId)

    console.log('Details:', details)

    res
    .status(200)
    .json(
        new ApiResponse(200, details, "Get details successfully!")
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

export const filterJobs = asyncHandler(async (req, res) => {
    console.log('Get req:', { page: req.query, body: req.body })
    const page = req.query.page
    const jobs = await JobService.filterJobs(req.body, page ? Number(page) : 1)

    console.log('Filtered:', jobs)

    res
    .status(200)
    .json(
        new ApiResponse(200, jobs, "Filtered jobs successfully!")
    )
})

export const DeleteJobPost = asyncHandler(async (req, res) => {
    const id = req.query.jobpostId as string

    if(!id) {
        throw new ApiError(400, 'JobpostId not found!')
    }

    const doc = await RecruiterService.deletePost(id)

    res
    .status(200)
    .json(
        new ApiResponse(200, doc, 'DeleteJobPost successfully!')
    )
})