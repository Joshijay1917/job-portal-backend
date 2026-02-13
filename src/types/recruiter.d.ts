export type RegisterRecruiter = {
    owner: string;
    email: string;
    password: string;
    cname: string;
    role: string;
}

export type LoginRecruiter = {
    email: string;
    password: string;
}

export type recruiterUpdateDetails = {
    recruiterId: string;
    email: string;
    cname: string;
    owner: string;
    category?: Category | null;
    employee_size?: { min: number, max: number };
    company_website?: string;
}