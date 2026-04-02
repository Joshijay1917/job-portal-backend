// PostgreSQL row types — these mirror the database schema exactly
export interface RecruiterRow {
    id: number;
    email: string;
    password: string;
    cname: string;
    owner: string;
    category: string | null;
    employee_size_min: number;
    employee_size_max: number;
    company_website: string | null;
    company_logo: string | null;
    profile_completed: boolean;
    email_verified: boolean;
    refresh_token: string | null;
    createdat: Date;
    updatedat: Date;
}

export interface CandidateRow {
    id: number;
    fname: string;
    email: string;
    password: string;
    description: string | null;
    experience_years_min: number;
    experience_years_max: number;
    resume_url: string | null;
    expected_salary_min: number;
    expected_salary_max: number;
    category: string | null;
    profile_completed: boolean;
    email_verified: boolean;
    refresh_token: string | null;
    createdat: Date;
    updatedat: Date;
}

export interface JobPostRow {
    id: number;
    recruiter_id: number;
    title: string;
    description: string;
    responsibilities: string[];
    experience_min: number;
    experience_max: number;
    salary_min: number;
    salary_max: number;
    location: string | null;
    job_type: string;
    category: string;
    is_active: boolean;
    createdat: Date;
    updatedat: Date;
}

export interface ApplicationRow {
    id: number;
    jobpost_id: number;
    candidate_id: number;
    status: string;
    cover_letter: string | null;
    createdat: Date;
    updatedat: Date;
}

export interface SkillRow {
    id: number;
    name: string;
}

export interface JobSkillRow {
    jobpost_id: number;
    skill_id: number;
}

export interface CandidateSkillRow {
    candidate_id: number;
    skill_id: number;
}

export interface SaveJobRow {
    id: number;
    candidate_id: number;
    jobpost_id: number;
    createdat: Date;
    updatedat: Date;
}