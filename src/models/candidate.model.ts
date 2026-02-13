import type { Document, Types } from "mongoose";
import type { Category } from "../types/job.d.ts";
import mongoose from "mongoose";

export interface CandidateInternface extends Document {
    fname: string;
    email: string;
    password: string;
    description?: string;
    experience_years?: number;
    resume?: string;
    expected_salary?: { min: number, max: number };
    category?: Category | null;
    email_verified: boolean;
    profile_completed: boolean;
    refresh_token: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const candidateSchema = new mongoose.Schema<CandidateInternface>({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    experience_years: {
        type: Number,
        default: 0
    },
    resume: {
        type: String,
        default: null
    },
    expected_salary: {
        type: { min: Number, max: Number }
    },
    category: {
        type: String,
        default: null
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    profile_completed: {
        type: Boolean,
        default: false
    },
    refresh_token: {
        type: String,
        default: null
    }
}, { timestamps: true })

export const Candidate = mongoose.model('Candidate', candidateSchema)