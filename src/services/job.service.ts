import { Applications } from "../models/application.model.js";
import { Candidate } from "../models/candidate.model.js";
import { JobPost, type JobPostInternface } from "../models/jobpost.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import { SavedJob, type SavedJobsType } from "../models/savedjobs.model.js";
import type { ApplyJobType, FilterType } from "../types/job.ts"
import { ApiError } from "../utils/ApiError.js";

const EXPERIENCE_LEVELS = [
    { value: 'entry', find: { min: 0, max: 2 } },
    { value: 'mid', find: { min: 2, max: 4 } },
    { value: 'senior', find: { min: 4, max: 10 } },
];

export class JobService {
    static async post(data: JobPostInternface, recruiterId: string) {
        if (!recruiterId) {
            throw new ApiError(400, 'Recruiter Id is required!')
        }

        const recruiter = await Recruiter.findById(recruiterId)
        if (!recruiter || !recruiter.profile_completed) {
            throw new ApiError(403, 'Recruiter profile is not found or completed!')
        }

        const jobPost = JobPost.create({
            ...data,
            recruiterId,
            logo_url: recruiter?.company_website || null,
        })

        return jobPost
    }

    static async get(page: number, candidateId: string | null) {
        const skip = (page - 1) * 10
        const [posts, total] = await Promise.all([
            JobPost.find({})
                .skip(skip)
                .limit(10)
                .sort({ createdAt: -1 })
                .select("logo_url title category type salary createdAt updatedAt")
                .populate({
                    path: "recruiterId",
                    select: "cname"
                })
                .lean<JobPostInternface[]>(),

            JobPost.countDocuments()
        ])

        let savedSet = new Set<string>();
        let modifiedPosts = posts;

        if(candidateId) {
            const saved = await SavedJob.find({
                candidateId,
                jobPostId: { $in: posts.map(p => p._id) }
            }).select("jobPostId").lean<SavedJobsType[]>();

            savedSet = new Set(
                saved.map(s => s.jobPostId.toString())
            );

            modifiedPosts = posts.map(post => ({
                ...post,
                isSaved: savedSet.has(post._id.toString())
            }))
        }

        return { posts: modifiedPosts, total, page, totalPages: Math.ceil(total / 10) }
    }

    static async getDetails(id: string, candidateId: string | null) {
        if(!id) {
            throw new ApiError(400, 'Job Id is required!')
        }

        const jobPost = await JobPost.findById(id).populate({
            path: 'recruiterId',
            select: 'cname'
        })
        if(!jobPost) {
            throw new ApiError(500, 'Failed to find job post!')
        }

        let app = null
        if(candidateId) {
            app = await Applications.findOne({ candidateId, jobPostId: id })
        }

        return {jobPost, hasApplied: app ? true : false };
    }

    static async ApplyJob({ candidateId, jobPostId }: ApplyJobType) {
        if (!candidateId) {
            throw new ApiError(400, 'Candidate id not founded')
        }

        const applied = await Applications.find({ candidateId, jobPostId })
        if(applied && applied.length != 0) {
            throw new ApiError(403, 'You already applied to this job!')
        }

        const candidate = await Candidate.findById(candidateId)
        if (!candidate || !candidate.profile_completed) {
            throw new ApiError(403, 'Candidate profile not found or completed!')
        }

        // const id = await sendCandidateApplication(jobPostId, candidate)

        const application = await Applications.create({
            candidateId,
            jobPostId
        })

        return application
    }

    static async filterJobs(filters: FilterType, page: number) {
        const query: FilterType = {};
        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: "i" } },
                { description: { $regex: filters.search, $options: "i" } },
            ];
        }

        if (filters.jobtype) {
            query.type = filters.jobtype
        }

        if (filters.category) {
            query.category = filters.category
        }

        if (filters.experience) {
            const level = EXPERIENCE_LEVELS.find((ex) => ex.value === filters.experience)

            if (level) {
                query["experience_required.min"] = { $lte: level.find.max };
                query["experience_required.max"] = { $gte: level.find.min };
            }

        }

        const skip = (page - 1) * 10
        const [posts, total] = await Promise.all([
            JobPost.find(query)
                .skip(skip)
                .limit(10)
                .sort({ createdAt: -1 }),

            JobPost.countDocuments(query)
        ])
        return { posts, total, page, totalPages: Math.ceil(total / 10) }
    }
}