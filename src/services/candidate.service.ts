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
import { getAppliedJobs, updateCandidate, updateCandidateProfileCompleted } from "../queries/candidate.queries.js";
import type { CandidateRow } from "../types/pg.js";

export class CandidateService {
  // static async register(data: RegisterBody) {
  //   const { email, password, fname } = data;

  //   if (!fname) {
  //     throw new ApiError(400, "Full name is required!");
  //   }

  //   const normalizedEmail = email.toLowerCase().trim();
  //   let existingUser = await Candidate.findOne({ email: normalizedEmail });
  //   if (!existingUser) {
  //     existingUser = await Recruiter.findOne({ email: normalizedEmail });
  //   }

  //   if (existingUser) {
  //     throw new ApiError(400, "User already registered!");
  //   }

  //   const hash = await bcrypt.hash(password, 10);

  //   const user = await Candidate.create({
  //     fname: fname,
  //     email: normalizedEmail,
  //     password: hash,
  //   });

  //   return {
  //     id: user._id,
  //     email: user.email,
  //     email_verified: user.email_verified,
  //     role: "candidate",
  //   };
  // }

  // static async login(data: LoginBody) {
  //   const { email, password } = data;

  //   const normalizedEmail = email.toLowerCase().trim();
  //   const user = await Candidate.findOne({ email: normalizedEmail });

  //   if (!user) {
  //     return null;
  //   }

  //   const isValid = await bcrypt.compare(password, user.password);
  //   if (!isValid) {
  //     throw new ApiError(400, "Invalid email or password");
  //   }

  //   const accessToken = await generateAccessToken({
  //     id: user._id,
  //     email: user.email,
  //     email_verified: user.email_verified,
  //     role: "candidate",
  //   });
  //   const refreshToken = await generateRefreshToken({ _id: user._id });

  //   user.refresh_token = refreshToken;
  //   await user.save({ validateBeforeSave: false });

  //   return {
  //     user: {
  //       id: user._id,
  //       email: user.email,
  //       email_verified: user.email_verified,
  //       role: "candidate",
  //     },
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  // static async changePassword(candidateId: string, currentPass: string, newPass: string) {
  //   if (!currentPass || !newPass) {
  //     throw new ApiError(400, 'Candidate required fields not found!')
  //   }

  //   const candidate = await Candidate.findById(candidateId)
  //   if (!candidate) {
  //     throw new ApiError(404, 'User not found!')
  //   }

  //   const isValid = await bcrypt.compare(currentPass, candidate.password)
  //   if (!isValid) {
  //     throw new ApiError(400, 'Please provide valid password!')
  //   }

  //   const hash = await bcrypt.hash(newPass, 10);
  //   candidate.password = hash
  //   candidate.save({ validateBeforeSave: false })

  //   return candidate;
  // }

  // static async verifyEmail(userId: string, otp: number) {
  //   const user = await Candidate.findById(userId);
  //   if (!user) {
  //     throw new ApiError(404, "User not found!");
  //   }

  //   const isValid = await verifyEmailOtp(user.email, otp);
  //   if (!isValid) {
  //     throw new ApiError(400, "Invalid Otp!");
  //   }

  //   user.email_verified = true;
  //   await user.save({ validateBeforeSave: false });

  //   return {
  //     id: user._id,
  //     email: user.email,
  //     email_verified: user.email_verified,
  //   };
  // }

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
    if (experience_years !== undefined) updateObj.experience_years = experience_years;
    if (resume !== undefined) updateObj.resume = resume;
    if (category !== undefined) updateObj.category = category;
    if (expected_salary) updateObj.expected_salary = expected_salary;

    const updated = await updateCandidate(candidateId, updateObj)

    if (await this.isCandidateProfileComplete(updated)) {
      await updateCandidateProfileCompleted(candidateId, true)
    }

    return updated;
  }

  static async isCandidateProfileComplete(candidate: CandidateRow) {
    return Boolean(
      candidate.description?.trim() &&
      candidate.experience_years !== undefined &&
      candidate.category &&
      candidate.resume_url &&
      candidate.expected_salary
    );
  }

  static async getAppliedJobs(candidateId: number) {
    if (!candidateId) {
      throw new ApiError(400, "Candidate ID required");
    }

    const apps = await getAppliedJobs(candidateId);

    if (!apps.length) {
      return [];
    }

    return apps;
  }
}
