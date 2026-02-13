export type RegisterCandidate = {
    fname: string;
    email: string;
    password: string;
    role: string;
}

export type candidateUpdateDetails = {
    candidateId: string
    fname: string
    email: string
    description: string
    experience_years: number
    resume?: string | null
    expected_salary: {
        min: number
        max: number
    }
    category: string | null
}