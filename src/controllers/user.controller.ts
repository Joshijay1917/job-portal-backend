import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Recruiter, type RecruiterInterface } from "../models/recruiter.model.js";
import { Candidate, type CandidateInternface } from "../models/candidate.model.js";
import { CandidateService } from "../services/candidate.service.js";
import { RecruiterService } from "../services/recruiter.service.js";

export const getUserDetails = asyncHandler(async (req, res) => {
    const id = req.user?.id
    const role = req.user?.role

    
    let details = null
    if(role === 'recruiter') {
        console.log('Get Recruiter details:', { id, role })
        details = await Recruiter.findById(id).select("-password -refresh_token")
    } else {
        console.log('Get Candidate details:', { id, role })
        details = await Candidate.findById(id).select("-password -refresh_token")
    }

    if(!details) {
        throw new ApiError(400, 'Failed to get user details!')
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, details, 'Get user details!')
    )
})

export const updateProfile = asyncHandler(async (req, res) => {
    const role = req.user?.role
    const id = req.user?.id

    let updated = null
    let isComplete = false
    if(role === 'recruiter') {
        updated = await RecruiterService.updateDetails({ recruiterId: id, ...req.body}) as RecruiterInterface
        if(!updated) {
            throw new ApiError(400, 'User not found!')
        }
        isComplete = await RecruiterService.isRecruiterProfileComplete(updated)
    } else {
        updated = await CandidateService.updateDetails({ candidateId: id, ...req.body}) as CandidateInternface
        if(!updated) {
            throw new ApiError(400, 'User not found!')
        }
        isComplete = await CandidateService.isCandidateProfileComplete(updated) 
    }

    if(isComplete && !updated.profile_completed) {
        updated.profile_completed = true
        await updated.save({ validateBeforeSave: false })
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, updated, 'Profile updated!')
    )
})

export const getPosts = asyncHandler(async (req, res) => {
    const id = req.user.id

    const posts = await RecruiterService.getAllPosts(id)
    
    res
    .status(200)
    .json(
        new ApiResponse(200, posts, 'Get all posts successfully!')
    )
})

export const getAppliedJobs = asyncHandler(async (req, res) => {
    const id = req?.user?.id || null
    const posts = await CandidateService.getAppliedJobs(id);

    res
    .status(200)
    .json(
        new ApiResponse(200, posts, 'Get all posts!')
    )
})

export const getApplications = asyncHandler(async (req, res) => {
    const id = req.user.id as string

    if(!id) {
        throw new ApiError(400, 'Recriter Id not found!')
    }

    const candidates = await RecruiterService.getAllApplications(id)

    res
    .status(200)
    .json(
        new ApiResponse(200, candidates, 'Get all Applications!')
    )
})

export const getAppDetail = asyncHandler(async (req, res) => {
    const applicationId = req.params.applicationId as string

    if(!applicationId) {
        throw new ApiError(400, 'Application Id not found!')
    }

    const app = await RecruiterService.getApplicationDetails(applicationId)

    res
    .status(200)
    .json(
        new ApiResponse(200, app, 'Get application details!')
    )
})

export const updateAppStatus = asyncHandler(async (req, res) => {
    const { appId, status } = req.body

    if(!appId || !status) {
        throw new ApiError(400, 'Required fields not found!')
    }

    const updatedApp = await RecruiterService.updateStatus(appId, status)

    res
    .status(200)
    .json(
        new ApiResponse(200, updatedApp, 'Application Status Updated!')
    )
})