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