import mongoose from "mongoose";
import { query } from "../config/db.ts";
import dotenv from "dotenv";
import { Recruiter } from "../models/recruiter.model.ts";

dotenv.config();

async function seedRecruiters() {
    try {
        console.log("🚀 Connecting Mongo...");
        await mongoose.connect(process.env.MONGO_URI);

        console.log("📦 Fetching recruiters from Mongo...");
        const recruiters = await Recruiter.find();

        console.log("🔄 Seeding recruiters to PostgreSQL...");

        for (const rec of recruiters) {
            await query(
                `INSERT INTO recruiters (
          email,
          password,
          cname,
          owner,
          category,
          employee_size_min,
          employee_size_max,
          company_website,
          company_logo,
          profile_completed,
          email_verified,
          refresh_token
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (email) DO NOTHING
        `,
                [
                    rec.email,
                    rec.password, // already hashed
                    rec.cname,
                    rec.owner,
                    rec.category,
                    rec.employee_size?.min || 0,
                    rec.employee_size?.max || 0,
                    rec.company_website || null,
                    rec.company_logo || null,
                    rec.profile_completed || false,
                    rec.email_verified || false,
                    rec.refresh_token || null
                ]
            );
        }

        console.log("✅ Recruiters seeded successfully");
        process.exit(0);

    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

seedRecruiters();