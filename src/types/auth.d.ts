import type { Role } from "./job.js";

export type RegisterBody = RecruiterRegister | CandidateRegister

interface BaseUser {
    email: string;
    password: string;
    role: Role
}

interface RecruiterRegister extends BaseUser {
    role: Role.Recruter;
    cname: string;
    owner: string;
}

interface CandidateRegister extends BaseUser {
    role: Role.Candidate;
    fname: string;
}

export type LoginBody = {
    email: string;
    password: string;
}