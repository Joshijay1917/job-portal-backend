import type { Document, Types } from "mongoose";
import mongoose from "mongoose";

enum Status {
    Applied = 'Applied',
    Shortlisted = 'Shortlisted',
    Rejected = 'Rejected'
}

export interface applicationInterface extends Document {
    candidateId: Types.ObjectId;
    jobPostId: Types.ObjectId;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const applicationSchema = new mongoose.Schema<applicationInterface>({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true
    },
    jobPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost',
        required: true
    },
    status: {
        type: String,
        default: Status.Applied
    }
}, { timestamps: true })

export const Applications = mongoose.model('Application', applicationSchema)