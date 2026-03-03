import mongoose, { Types } from "mongoose";

export interface SavedJobsType {
    _id: string,
    candidateId: Types.ObjectId,
    jobPostId: Types.ObjectId,
    createdAt: Date;
    updatedAt: Date;
}

const savedJobsSchema = new mongoose.Schema<SavedJobsType>({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true,
        index: true
    },
    jobPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost',
        required: true,
        index: true
    }
}, { timestamps: true })

savedJobsSchema.index(
    { candidateId: 1, jobPostId: 1 },
    { unique: true }
);

export const SavedJob = mongoose.model('SavedJob', savedJobsSchema)