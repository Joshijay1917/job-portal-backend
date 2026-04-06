import { pool, query } from "../config/db.js";
import type { PgFilterType } from "../types/job.js";
import type { JobPostRow } from "../types/pg.js";

export async function createJobpost(data: { recruiter_id: number, title: string, description: string, responsibilities: string[], skills: string[], category: string, experience_min: number, experience_max: number, location: string, job_type: string, salary_min: number, salary_max: number }): Promise<JobPostRow> {

    const result = await query(
        `INSERT INTO jobposts (recruiter_id, title, description, responsibilities, skills, category, experience_min, experience_max, location, job_type, salary_min, salary_max)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
            data.recruiter_id,
            data.title,
            data.description,
            data.responsibilities,
            data.category,
            data.experience_min,
            data.experience_max,
            data.location,
            data.job_type,
            data.salary_min,
            data.salary_max
        ]
    );
    return result.rows[0];
}

export async function getJobPostsPaginated(page: number, limit: number): Promise<JobPostRow[]> {
    const result = await query(
        `SELECT * FROM jobposts LIMIT $1 OFFSET $2`,
        [limit, (page - 1) * limit]
    );
    return result.rows;
}

export async function getJobPostsByRecruiterId(recruiter_id: number): Promise<JobPostRow[]> {
    const result = await query(
        `SELECT json_build_object('id', r.id, 'cname', r.cname, 'company_logo', r.company_logo) as "recruiterId", jp.* FROM jobposts jp JOIN recruiters r ON jp.recruiter_id = r.id WHERE recruiter_id = $1`,
        [recruiter_id]
    );
    return result.rows;
}

export async function countJobPosts(): Promise<number> {
    const result = await query(
        `SELECT COUNT(*) FROM jobposts`
    );
    return Number(result.rows[0].count);
}

export async function getJobPostDetails(job_id: number, candidate_id: number) {
    const result = await query(
        `SELECT jp.*, r.cname AS recruiter_name,
            CASE
                WHEN a.id IS NOT NULL THEN true
                ELSE false
            END AS "hasApplied"
        FROM jobposts jp
        JOIN recruiters r ON jp.recruiter_id = r.id
        LEFT JOIN applications a ON a.job_id = jp.id AND a.candidate_id = $2
        WHERE jp.id = $1`,
        [job_id, candidate_id]
    );
    const row = result.rows[0];
    if (!row) throw new Error("Job post not found");
    return {
        jobPost: {
            ...row,
            recruiter_name: undefined
        },
        recruiter: {
            cname: row.recruiter_name
        },
        hasApplied: row.hasApplied
    }
}

export async function deleteJobPost(job_id: number): Promise<void> {
    const result = await query(
        `DELETE FROM jobposts WHERE id = $1`,
        [job_id]
    );
    if (result.rowCount === 0) throw new Error("Job post not found");
}

export async function filterJobs(filters: PgFilterType, page: number) {
    const values: any[] = [];
    let whereClauses: string[] = [];

    if (filters.search) {
        values.push(`%${filters.search}%`);
        whereClauses.push(`title ILIKE $${values.length} OR description ILIKE $${values.length}`);
    }

    if (filters.jobtype) {
        values.push(filters.jobtype);
        whereClauses.push(`job_type = $${values.length}`);
    }

    if (filters.experience) {
        values.push(filters.experience);
        whereClauses.push(`experience_min <= $${values.length} AND experience_max >= $${values.length}`);
    }

    if (filters.category) {
        values.push(filters.category);
        whereClauses.push(`category = $${values.length}`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const limit = 10;
    const offset = (page - 1) * limit;

    const dataQuery = `
    SELECT jp.*
    FROM jobposts jp
    ${whereSQL}
    ORDER BY jp.created_at DESC
    LIMIT $${limit}
    OFFSET $${offset}`;

    const countQuery = `
    SELECT COUNT(*) FROM jobposts jp
    ${whereSQL}
  `;

    const [dataResult, countResult] = await Promise.all([
        query(dataQuery, values),
        query(countQuery, values),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
        posts: dataResult.rows,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}