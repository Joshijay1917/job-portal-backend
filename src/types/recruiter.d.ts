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
    recruiterId: number;
    email: string;
    cname: string;
    owner: string;
    category?: Category | null;
    employee_size_min?: number;
    employee_size_max?: number;
    company_website?: string;
}