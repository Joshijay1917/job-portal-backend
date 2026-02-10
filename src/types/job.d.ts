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
    Ftype = 'Full Time',
    Ptype = 'Part Time'
}

export type ApplyJobType = {
    candidateId: string;
    jobPostId: string;
}

export enum Role {
    Recruter = 'recruiter',
    Candidate = 'candidate'
}