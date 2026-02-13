import { Applications } from "../models/application.model.js";
import { Candidate } from "../models/candidate.model.js";
import { JobPost, type JobPostInternface } from "../models/jobpost.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import type { ApplyJobType } from "../types/job.js";
import { ApiError } from "../utils/ApiError.js";
import { sendCandidateApplication } from "./email.service.js";

export class JobService {
    static async post(data: JobPostInternface) {
        const { recruiterId } = data

        if(!recruiterId) {
            throw new ApiError(400, 'Recruiter Id is required!')
        }

        const recruiter = await Recruiter.findById(recruiterId)
        if(!recruiter || !recruiter.profile_completed) {
            throw new ApiError(403, 'Recruiter profile is not found or completed!')
        }

        const jobPost = JobPost.create({
            ...data
        })

        return jobPost
    }

    static async get(page: number) {
        const skip = (page - 1) * 10
        const [posts, total] = await Promise.all([
            JobPost.find({})
                .skip(skip)
                .limit(10)
                .sort({ createdAt: -1 }),

            JobPost.countDocuments()
        ])
        return {posts, total, page, totalPages: Math.ceil(total/10)}
    }

    static async ApplyJob({ candidateId, jobPostId }: ApplyJobType) {
        if(!candidateId) {
            throw new ApiError(400, 'Candidate id not founded')
        }

        const candidate = await Candidate.findById(candidateId)
        if(!candidate || !candidate.profile_completed) {
            throw new ApiError(403, 'Candidate profile not found or completed!')
        }

        const id = await sendCandidateApplication(jobPostId, candidate)

        const application = await Applications.create({
            candidateId,
            jobPostId
        })

        return application
    }
}