import { query } from "../config/db.js";
import type { RecruiterRow } from "../types/pg.js";

export async function findRecruiterByEmail(email: string): Promise<RecruiterRow | null> {
    const result = await query(
        'SELECT * FROM recruiters WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
}

export async function createRecruiter(data: { email: string, password: string, cname: string, owner: string }): Promise<RecruiterRow> {
    const result = await query(
        `INSERT INTO recruiters (email, password, cname, owner, profile_completed, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            data.email,
            data.password,
            data.cname,
            data.owner,
            false,
            false
        ]
    );
    return result.rows[0];
}

export async function updateRecruiter(id: number, data: Partial<RecruiterRow>): Promise<RecruiterRow> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

    const result = await query(
        `UPDATE recruiters SET ${setClause}, updatedat = NOW() WHERE id = $1 RETURNING *`,
        [id, ...values]
    );
    return result.rows[0];
}

export async function findRecruiterById(id: number): Promise<RecruiterRow | null> {
    const result = await query(
        'SELECT * FROM recruiters WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
}

export async function updateRecruiterRefreshToken(recruiterId: number, refreshToken: string | null): Promise<void> {
    await query(
        'UPDATE recruiters SET refresh_token = $1, updatedat = NOW() WHERE id = $2',
        [refreshToken, recruiterId]
    );
}

export async function updateRecruiterEmailVerified(recruiterId: number, emailVerified: boolean): Promise<void> {
    await query(
        'UPDATE recruiters SET email_verified = $1, updatedat = NOW() WHERE id = $2',
        [emailVerified, recruiterId]
    );
}

export async function updateRecruiterProfileCompleted(recruiterId: number, profileCompleted: boolean): Promise<void> {
    await query(
        'UPDATE recruiters SET profile_completed = $1, updatedat = NOW() WHERE id = $2',
        [profileCompleted, recruiterId]
    );
}

export async function updateRecruiterPassword(recruiterId: number, password: string): Promise<RecruiterRow> {
    const result = await query(
        'UPDATE recruiters SET password = $1, updatedat = NOW() WHERE id = $2 RETURNING *',
        [password, recruiterId]
    );
    return result.rows[0];
}

export async function getCandidateApplications(recruiterId: number) {
    const result = await query(
        `SELECT json_build_object(
            'id', jp.id,
            'title', jp.title
        ) as jobPostId,
        json_build_object(
            'id', c.id,
            'fname', c.fname,
            'email', c.email
        ) as candidateId, a.status FROM applications a
        JOIN jobposts jp ON a.jobpost_id = jp.id
        JOIN candidates c ON a.candidate_id = c.id
        WHERE jp.recruiter_id = $1
        ORDER BY a.createdat DESC`,
        [recruiterId]
    );
    return result.rows;
}

export async function getCandidateApplicationDetails(applicationId: number) {
    const result = await query(
        `SELECT json_build_object(
            'id', jp.id,
            'title', jp.title
        ) as jobPostId,
        json_build_object(
            'id', c.id,
            'fname', c.fname,
            'email', c.email,
            'description', c.description,
            'experience_years', c.experience_years,
            'resume', c.resume_url,
            'expected_salary', c.expected_salary,
            'category', c.category
        ) as candidateId, a.status FROM applications a
        JOIN jobposts jp ON a.jobpost_id = jp.id
        JOIN candidates c ON a.candidate_id = c.id
        WHERE a.id = $1`,
        [applicationId]
    );
    return result.rows[0] || null;
}