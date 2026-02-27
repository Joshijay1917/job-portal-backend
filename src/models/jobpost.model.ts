import type { Document, Types } from "mongoose";
import type { Category, JobType } from "../types/job.d.ts";
import type { CandidateInternface } from "./candidate.model.js";
import mongoose from "mongoose";

export interface JobPostInternface extends Document {
    recruiterId: Types.ObjectId;
    logo_url: string | null;
    title: string;
    description: string;
    responsibilities: string[];
    skills: string[];
    experience_required?: { min: number, max: number };
    salary: { min: number, max: number };
    category: Category;
    type: JobType;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

const jobPostSchema = new mongoose.Schema<JobPostInternface>({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    },
    logo_url: {
        type: String,
        default: null
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    responsibilities: {
        type: [String],
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    experience_required: {
        type: { min: Number, max: Number },
        default: null
    },
    salary: {
        type: { min: Number, max: Number },
        required: true
    },
    category: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    location: {
        type: String
    }
}, { timestamps: true })

export const JobPost = mongoose.model('JobPost', jobPostSchema)