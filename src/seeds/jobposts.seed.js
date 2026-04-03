import mongoose from "mongoose";
import { query } from "../config/db.ts";
import dotenv from "dotenv";
import { JobPost } from "../models/jobpost.model.ts";

dotenv.config();

const cleanArray = (arr = []) =>
  arr.map(item =>
    item.replace(/"/g, "").replace(/,/g, "").trim()
  );

async function seedJobPosts() {
  try {
    console.log("🚀 Connecting Mongo...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("📦 Fetching jobs from Mongo...");
    const jobs = await JobPost.find()

    // console.log("📦 Fetching recruiters from Postgres...");
    // const recruitersRes = await query(`SELECT id, email, cname FROM recruiters`);

    // const recruiters = recruitersRes.rows;

    // 🧠 Create mapping (IMPORTANT)
    const recruiterMap = {};

    // If you have original mongo data, map manually
    recruiterMap["6989b34600e65b972e543506"] = 1;
    recruiterMap["69a1262c5e33d079ba9c70fb"] = 2;
    recruiterMap["69aaca11510980fc426334a3"] = 3;
    recruiterMap["69aaca11510980fc426334a4"] = 4;
    recruiterMap["69aaca11510980fc426334a5"] = 5;
    recruiterMap["69aaca11510980fc426334a6"] = 6;
    recruiterMap["69aaca11510980fc426334a7"] = 7;
    recruiterMap["69aaca11510980fc426334a8"] = 8;
    recruiterMap["69aaca11510980fc426334a9"] = 9;
    recruiterMap["69aaca11510980fc426334aa"] = 10;

    console.log("🔄 Seeding jobposts...");

    for (const job of jobs) {
      const mongoRecruiterId = job.recruiterId?.toString();

      const recruiterId = recruiterMap[mongoRecruiterId];

      if (!recruiterId) {
        console.log("❌ Skipping job (no recruiter):", job.title);
        continue;
      }

      const responsibilities = cleanArray(job.responsibilities);
      const skills = cleanArray(job.skills);

      await query(
        `INSERT INTO jobposts (
          recruiter_id,
          title,
          description,
          responsibilities,
          experience_min,
          experience_max,
          salary_min,
          salary_max,
          location,
          job_type,
          category
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        `,
        [
          recruiterId,
          job.title,
          job.description,
          responsibilities,
          job.experience_required?.min || 0,
          job.experience_required?.max || 0,
          job.salary?.min || 0,
          job.salary?.max || 0,
          job.location,
          job.type,
          job.category
        ]
      );
    }

    console.log("✅ Jobposts seeded successfully");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

seedJobPosts();