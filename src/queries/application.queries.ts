import { query } from "../config/db.js";
import type { Status } from "../models/application.model.js";

export async function createApplication(data: { candidate_id: number, jobpost_id: number, cover_letter: string }) {
    try {
        const result = await query(
            `INSERT INTO applications (candidate_id, jobpost_id, cover_letter) 
             VALUES ($1, $2, $3) RETURNING *`,
            [data.candidate_id, data.jobpost_id, data.cover_letter]
        );

        return result.rows[0];

    } catch (err: any) {
        // PostgreSQL unique violation error code
        if (err.code === '23505') {
            throw new Error("Already applied to this job");
        }
        throw err;
    }
}

export async function findApplications(candidate_id: number, jobpost_id: number) {
    const result = await query(
        `SELECT * FROM applications WHERE candidate_id = $1 AND jobpost_id = $2`,
        [candidate_id, jobpost_id]
    );
    return result.rows;
}

export async function findOneApplication(candidate_id: number, jobpost_id: number) {
    const result = await query(
        `SELECT * FROM applications WHERE candidate_id = $1 AND jobpost_id = $2 LIMIT 1`,
        [candidate_id, jobpost_id]
    );
    return result.rows[0];
}

export async function getApplicationsByRecruiter(recruiterId: number) { //We need find this recruiter_id's all jobposts
    const result = await query(
        `SELECT 
            a.id AS application_id,
            a.status,
            a.created_at AS applied_at,
            jp.id AS job_id,
            jp.title,
            jp.description
        FROM applications a
        JOIN jobposts jp ON a.jobpost_id = jp.id
        WHERE jp.recruiter_id = $1`,
        [recruiterId]
    );
    return result.rows;
}

export async function getApplicationDetail(applicationId: number) {
    const result = await query(
        `SELECT 
            a.id AS application_id,
            a.status,
            a.cover_letter,
            c.id AS candidate_id,
            c.name,
            c.email
        FROM applications a
        JOIN candidates c ON a.candidate_id = c.id
        WHERE a.id = $1`,
        [applicationId]
    );
    return result.rows[0];
}

export async function updateApplicationStatus(id: number, status: Status) {
    const result = await query(
        `UPDATE applications SET status = $2 WHERE id = $1 RETURNING *`,
        [id, status]
    );
    return result.rows[0];
}