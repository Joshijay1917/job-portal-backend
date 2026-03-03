import { SavedJob } from "../models/savedjobs.model.js";
import { ApiError } from "../utils/ApiError.js";

export class SavedJobsService {
    static async getPosts( candidateId: string ) {
        const posts = await SavedJob.find({ candidateId })
        .populate({
            path: 'jobPostId',
            select: 'logo_url title type recruiterId',
            populate: {
                path: 'recruiterId',
                select: 'cname'
            }
        })
        .lean();

        return posts;
    }

    static async savePost(candidateId: string, jobPostId: string) {
        if(!candidateId || !jobPostId) {
            throw new ApiError(400, 'Required Ids not found!')
        }

        const post = await SavedJob.create({ candidateId, jobPostId })

        return post
    }

    static async deletePost(candidateId: string, jobPostId: string) {
        if(!candidateId || !jobPostId) {
            throw new ApiError(400, 'Required Ids not found!')
        }

        const post = await SavedJob.deleteOne({ candidateId, jobPostId })

        return post
    }
}