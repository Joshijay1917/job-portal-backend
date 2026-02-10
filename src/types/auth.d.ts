import type { RegisterCandidate } from "./candidate.js";
import type { RegisterRecruiter } from "./recruiter.js";

export type RegisterBody =
    | {
        owner: string;
        email: string;
        password: string;
        cname: string;
        role: string;
        fname: string;
    }
    | {
        fname: string;
        owner: string;
        email: string;
        password: string;
        cname: string;
        role: string;
    }

export type LoginBody = {
    email: string;
    password: string;
}

export type logoutBody = {
    id: string,
    email: string,
    email_verified: boolean
}