import mongoose, { Document, Types } from "mongoose";
import type { Category } from "../types/job.d.ts";

export interface RecruiterInterface extends Document {
    email: string;
    password: string;
    cname: string;
    owner: string;
    category?: Category | null;
    employee_size?: { min: number, max: number };
    company_website?: string;
    email_verified: boolean;
    refresh_token: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const RecruiterSchema = new mongoose.Schema<RecruiterInterface>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cname: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: null
    },
    employee_size: {
        type: { min: Number, max: Number }
    },
    company_website: {
        type: String,
        default: null
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    refresh_token: {
        type: String,
        default: null
    }
})

export const Recruiter = mongoose.model('Recruiter', RecruiterSchema)