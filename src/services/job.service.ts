import { Applications } from "../models/application.model.js";
import { Candidate } from "../models/candidate.model.js";
import { JobPost, type JobPostInternface } from "../models/jobpost.model.js";
import type { ApplyJobType } from "../types/job.js";
import { ApiError } from "../utils/ApiError.js";
import { sendCandidateApplication } from "./email.service.js";

export class JobService {
    static async post(data: JobPostInternface) {
        const { recruiterId } = data

        if(!recruiterId) {
            throw new ApiError(400, 'Recruiter Id is required!')
        }

        const jobPost = JobPost.create({
            ...data
        })

        return jobPost
    }

    static async get() {
        const posts = JobPost.find({})
        return posts
    }

    static async ApplyJob({ candidateId, jobPostId }: ApplyJobType) {
        if(!candidateId) {
            throw new ApiError(400, 'Candidate id not founded')
        }

        const candidate = await Candidate.findById(candidateId)
        if(!candidate) {
            throw new ApiError(400, 'Candidate not found!')
        }

        const id = await sendCandidateApplication(jobPostId, candidate)

        const application = await Applications.create({
            candidateId,
            jobPostId
        })

        return application
    }
}