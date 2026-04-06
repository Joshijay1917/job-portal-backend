export type RegisterCandidate = {
    fname: string;
    email: string;
    password: string;
    role: string;
}

export type candidateUpdateDetails = {
    candidateId: number
    fname: string
    email: string
    description: string
    experience_years: number
    resume?: string | null
    expected_salary: number
    category: string | null
}