import { pool, query } from "../config/db.js";
import type { CandidateRow } from "../types/pg.js";

export async function createCandidate(data: { email: string, password: string, fname: string }): Promise<CandidateRow> {
    const result = await query(
        `INSERT INTO candidates (email, password, fname, profile_completed, email_verified)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
            data.email,
            data.password,
            data.fname,
            false,
            false
        ]
    );
    return result.rows[0];
}

export async function findCandidateById(id: number): Promise<CandidateRow | null> {
    const result = await query(
        'SELECT * FROM candidates WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
}

export async function findCandidateByEmail(email: string): Promise<CandidateRow | null> {
    const result = await query(
        'SELECT * FROM candidates WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
}

export async function updateCandidate(id: number, data: Partial<CandidateRow>): Promise<CandidateRow> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

    const result = await query(
        `UPDATE candidates SET ${setClause}, updatedat = NOW() WHERE id = $1 RETURNING *`,
        [id, ...values]
    );
    return result.rows[0];
}

export async function updateCandidateRefreshToken(candidateId: number, refreshToken: string | null): Promise<void> {
    await query(
        'UPDATE candidates SET refresh_token = $1, updatedat = NOW() WHERE id = $2',
        [refreshToken, candidateId]
    );
}

export async function updateCandidateEmailVerified(candidateId: number, emailVerified: boolean): Promise<void> {
    await query(
        'UPDATE candidates SET email_verified = $1, updatedat = NOW() WHERE id = $2',
        [emailVerified, candidateId]
    );
}

export async function updateCandidateProfileCompleted(candidateId: number, profileCompleted: boolean): Promise<void> {
    await query(
        'UPDATE candidates SET profile_completed = $1, updatedat = NOW() WHERE id = $2',
        [profileCompleted, candidateId]
    );
}

export async function updateCandidatePassword(candidateId: number, password: string): Promise<CandidateRow> {
    const result = await query(
        'UPDATE candidates SET password = $1, updatedat = NOW() WHERE id = $2 RETURNING *',
        [password, candidateId]
    );
    return result.rows[0];
}

export async function getAppliedJobs(candidateId: number): Promise<any[]> {
    const result = await query(
        `SELECT 
    j.id, j.title, j.category, j.job_type, j.salary_min, j.salary_max,
    j.createdat, j.updatedat,
    a.id as application_id, a.status,
    (SELECT COUNT(*) FROM applications WHERE jobpost_id = j.id) as total_applied
FROM applications a
JOIN jobposts j ON a.jobpost_id = j.id
WHERE a.candidate_id = $1
ORDER BY a.createdat DESC
`,
        [candidateId]
    );
    return result.rows;
}

export async function getSavedJobs(candidateId: number): Promise<any[]> {
    const result = await query(
        'SELECT * FROM saved_jobs WHERE candidate_id = $1',
        [candidateId]
    );
    return result.rows;
}