import { QueryFilter } from 'mongoose'
import type { JobPostInternface } from '../models/jobpost.model.ts';

export enum Category {
    Sde = 'Software Developer',
    Uiux = 'UI/UX',
    Datascience = 'Data Science',
    Mobiledev = 'Mobile Dev',
    Aiml = 'AI/ML',
    Internship = 'Internship',
    Remote = 'Remote Job'
}

export enum JobType {
    Ftype = 'Full time',
    Ptype = 'Part time'
}

export type ApplyJobType = {
    candidateId: string;
    jobPostId: string;
}

export enum Role {
    Recruter = 'recruiter',
    Candidate = 'candidate'
}

export interface FilterType extends QueryFilter<JobPostInternface> {
    search?: string,
    jobtype?: JobType,
    experience_year?: string,
    category?: Category
}

export type EXPERIENCE_LEVELS = [
    { value: 'entry', find: {min:0, max:2} },
    { value: 'mid', find: {min:2, max:4} },
    { value: 'senior', find: {min:4, max:10}},
];