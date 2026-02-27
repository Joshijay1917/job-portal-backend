import {
  Candidate,
  type CandidateInternface,
} from "../models/candidate.model.js";
import type { LoginBody, RegisterBody } from "../types/auth.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { verifyEmailOtp } from "./email.service.js";
import { Recruiter } from "../models/recruiter.model.js";
import type { candidateUpdateDetails } from "../types/candidate.js";
import { Applications } from "../models/application.model.js";
import { JobPost, type JobPostInternface } from "../models/jobpost.model.js";
import mongoose from "mongoose";

export class CandidateService {
  static async register(data: RegisterBody) {
    const { email, password, fname } = data;

    if (!fname) {
      throw new ApiError(400, "Full name is required!");
    }

    const normalizedEmail = email.toLowerCase().trim();
    let existingUser = await Candidate.findOne({ email: normalizedEmail });
    if (!existingUser) {
      existingUser = await Recruiter.findOne({ email: normalizedEmail });
    }

    if (existingUser) {
      throw new ApiError(400, "User already registered!");
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await Candidate.create({
      fname: fname,
      email: normalizedEmail,
      password: hash,
    });

    return {
      id: user._id,
      email: user.email,
      email_verified: user.email_verified,
      role: "candidate",
    };
  }

  static async login(data: LoginBody) {
    const { email, password } = data;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await Candidate.findOne({ email: normalizedEmail });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new ApiError(400, "Invalid email or password");
    }

    const accessToken = await generateAccessToken({
      id: user._id,
      email: user.email,
      email_verified: user.email_verified,
      role: "candidate",
    });
    const refreshToken = await generateRefreshToken({ _id: user._id });

    user.refresh_token = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      user: {
        id: user._id,
        email: user.email,
        email_verified: user.email_verified,
        role: "candidate",
      },
      accessToken,
      refreshToken,
    };
  }

  static async verifyEmail(userId: string, otp: number) {
    const user = await Candidate.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found!");
    }

    const isValid = await verifyEmailOtp(user.email, otp);
    if (!isValid) {
      throw new ApiError(400, "Invalid Otp!");
    }

    user.email_verified = true;
    await user.save({ validateBeforeSave: false });

    return {
      id: user._id,
      email: user.email,
      email_verified: user.email_verified,
    };
  }

  static async updateDetails(data: candidateUpdateDetails) {
    const {
      candidateId,
      fname,
      email,
      description,
      experience_years,
      resume,
      expected_salary,
      category,
    } = data;

    const updateObj: any = {};

    if (fname !== undefined) updateObj.fname = fname;
    if (email !== undefined) updateObj.email = email;
    if (description !== undefined) updateObj.description = description;
    if (experience_years !== undefined)
      updateObj.experience_years = experience_years;
    if (resume !== undefined) updateObj.resume = resume;
    if (category !== undefined) updateObj.category = category;

    console.log("Expected_salary:", expected_salary);

    if (expected_salary) {
      if (expected_salary.min !== undefined)
        updateObj["expected_salary.min"] = expected_salary.min;

      if (expected_salary.max !== undefined)
        updateObj["expected_salary.max"] = expected_salary.max;
    }

    console.log("Update Obj:", updateObj);

    const updated = await Candidate.findByIdAndUpdate(candidateId, updateObj, {
      new: true,
    }).select("-password -refresh_token");

    return updated;
  }

  static async isCandidateProfileComplete(candidate: CandidateInternface) {
    return Boolean(
      candidate.description?.trim() &&
      candidate.experience_years !== undefined &&
      candidate.category &&
      candidate.expected_salary &&
      candidate.expected_salary.min !== undefined &&
      candidate.expected_salary.max !== undefined,
    );
  }

  static async getAppliedJobs(candidateId: string | null) {
    if (!candidateId) {
      throw new ApiError(403, "Candidate Id not found!");
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      throw new ApiError(404, "Candidate not found!");
    }

    const apps = await Applications.aggregate([
      {
        $match: { candidateId: new mongoose.Types.ObjectId(candidateId) },
      },
      {
        $lookup: {
          from: "jobposts",
          localField: "jobPostId",
          foreignField: "_id",
          as: "Job",
        },
      },
      {
        $unwind: "$Job"
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$Job", "$$ROOT"],
          },
        },
      },
      {
        $lookup: {
          from: "applications",
          localField: "jobPostId",
          foreignField: "jobPostId",
          as: "totalApplications",
        },
      },
      {
        $addFields: {
          totalApplied: { $size: "$totalApplications" },
        },
      },
    ]);

    console.log(apps);

    // const jobPosts = apps
    // .filter(app => app.jobPostId)
    // .map((app) => {
    //   const job = app.jobPostId as any;

    //   return {
    //     ...job?.toObject(),
    //     applicationId: app._id,
    //     status: app.status,
    //     appliedAt: app.createdAt,
    //     applied: true,
    //   };
    // });

    return apps;
  }
}
