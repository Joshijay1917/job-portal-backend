import { Applications, Status } from "../models/application.model.js";
import { Candidate } from "../models/candidate.model.js";
import { JobPost } from "../models/jobpost.model.js";
import { Recruiter, type RecruiterInterface } from "../models/recruiter.model.js";
import { updateApplicationStatus } from "../queries/application.queries.js";
import { getCandidateApplicationDetails, getCandidateApplications, updateRecruiter, updateRecruiterProfileCompleted } from "../queries/recruiter.queries.js";
import type { RegisterBody } from "../types/auth.js";
import type { RecruiterRow } from "../types/pg.js";
import type { LoginRecruiter, recruiterUpdateDetails } from "../types/recruiter.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendEmail, verifyEmailOtp } from "./email.service.js";
import bcrypt from 'bcrypt'

export class RecruiterService {
    // static async register(data: RegisterBody) {
    //     const { owner, email, password, cname } = data
    //     const normalizedEmail = email.toLowerCase().trim();

    //     console.log('Get owner ', owner, ' cname is ', cname)

    //     if (!cname || !owner) {
    //         throw new ApiError(400, 'Company name and owner is required!')
    //     }

    //     let existingUser = await Recruiter.findOne({ email: normalizedEmail })
    //     if(!existingUser) {
    //         existingUser = await Candidate.findOne({ email: normalizedEmail})
    //     }

    //     if (existingUser && existingUser.email_verified) {
    //         throw new ApiError(400, 'User already registered!')
    //     }

    //     if (existingUser && !existingUser.email_verified) {
    //         // const messageId = await sendEmail(existingUser)
    //         // if (!messageId) {
    //         //     throw new ApiError(500, 'Failed to send email!')
    //         // }
    //         existingUser.email_verified = true
    //         await existingUser.save({ validateBeforeSave: false })
    //         return {
    //             id: existingUser._id,
    //             email: existingUser.email,
    //             email_verified: existingUser.email_verified,
    //             role: 'recruiter'
    //         };
    //     }

    //     const hash = await bcrypt.hash(password, 10)

    //     const user = await Recruiter.create({
    //         cname: cname,
    //         owner: owner,
    //         email: normalizedEmail,
    //         password: hash,
    //         email_verified: true
    //     })

    //     // const messageId = await sendEmail(user)
    //     // if (!messageId) {
    //     //     throw new ApiError(500, 'Failed to send email!')
    //     // }

    //     return {
    //         id: user._id,
    //         email: user.email,
    //         email_verified: user.email_verified,
    //         role: 'recruiter'
    //     };
    // }

    // static async login(data: LoginRecruiter) {
    //     const { email, password } = data

    //     const normalizedEmail = email.toLowerCase().trim();
    //     const user = await Recruiter.findOne({ email: normalizedEmail })

    //     if (!user || !user?.email_verified) {
    //         return null;
    //     }

    //     const isValid = await bcrypt.compare(password, user.password)
    //     if (!isValid) {
    //         throw new ApiError(400, "Invalid email or password");
    //     }

    //     const accessToken = await generateAccessToken({ id: user._id, email: user.email, email_verified: user.email_verified, role: 'recruiter' })
    //     const refreshToken = await generateRefreshToken({ _id: user._id })

    //     user.refresh_token = refreshToken
    //     await user.save({ validateBeforeSave: false })

    //     return {
    //         user: {
    //             id: user._id,
    //             email: user.email,
    //             email_verified: user.email_verified,
    //             role: 'recruiter'
    //         },
    //         accessToken,
    //         refreshToken
    //     }
    // }

    // static async changePassword(recruiterId: string, currentPass: string, newPass: string) {
    //     if (!currentPass || !newPass) {
    //         throw new ApiError(400, 'Recruiter required fields not found!')
    //     }

    //     const recruiter = await Recruiter.findById(recruiterId)
    //     if (!recruiter) {
    //         throw new ApiError(404, 'User not found!')
    //     }

    //     const isValid = await bcrypt.compare(currentPass, recruiter.password)
    //     if (!isValid) {
    //         throw new ApiError(400, 'Please provide valid password!')
    //     }

    //     const hash = await bcrypt.hash(newPass, 10);
    //     recruiter.password = hash
    //     recruiter.save({ validateBeforeSave: false })

    //     return recruiter;
    // }

    // static async verifyEmail(userId: string, otp: number) {
    //     const user = await Recruiter.findById(userId)
    //     if (!user) {
    //         throw new ApiError(404, 'User not found!')
    //     }

    //     const isValid = await verifyEmailOtp(user.email, otp)
    //     if (!isValid) {
    //         throw new ApiError(400, 'Invalid Otp!')
    //     }

    //     user.email_verified = true;
    //     await user.save({ validateBeforeSave: false })

    //     return {
    //         id: user._id,
    //         email: user.email,
    //         email_verified: user.email_verified
    //     };
    // }

    static async updateDetails(data: recruiterUpdateDetails) {
        const { recruiterId, email, cname, owner, category, employee_size_min, employee_size_max, company_website } = data

        const updateObj: any = {}

        if (email !== undefined) updateObj.email = email
        if (cname !== undefined) updateObj.cname = cname
        if (owner !== undefined) updateObj.owner = owner
        if (category !== undefined) updateObj.category = category
        if (company_website !== undefined) updateObj.company_website = company_website

        if (employee_size_min !== undefined) updateObj["employee_size_min"] = employee_size_min
        if (employee_size_max !== undefined) updateObj["employee_size_max"] = employee_size_max

        const updated = await updateRecruiter(recruiterId, updateObj)

        if (await this.isRecruiterProfileComplete(updated)) {
            await updateRecruiterProfileCompleted(recruiterId, true)
        }

        return updated
    }

    static async isRecruiterProfileComplete(recruiter: RecruiterRow) {
        return Boolean(
            recruiter.email &&
            recruiter.cname &&
            recruiter.owner &&
            recruiter.category &&
            recruiter.employee_size_min !== undefined &&
            recruiter.employee_size_max !== undefined &&
            recruiter.company_website &&
            recruiter.email_verified
        )
    }

    // static async getAllPosts(recruiterId: string) {
    //     if (!recruiterId) {
    //         throw new ApiError(400, 'RecruiterId not found!')
    //     }

    //     const posts = await JobPost.find({ recruiterId: recruiterId })
    //         .sort({ createdAt: -1 })
    //         .select("logo_url title category type salary createdAt updatedAt")
    //         .populate({
    //             path: "recruiterId",
    //             select: "cname"
    //         })
    //     if (!posts || posts.length == 0) {
    //         return []
    //     }

    //     return posts
    // }

    static async deletePost(jobpostId: string) {
        const doc = await JobPost.findByIdAndDelete(jobpostId)

        if (!doc) {
            throw new ApiError(500, 'Failed to delete jobPost')
        }

        return doc
    }

    static async getAllApplications(recruiterId: number) {
        const applications = await getCandidateApplications(recruiterId)
        console.log(applications)
        // const applications = await Applications.find({
        //     jobPostId: { $in: postIds }
        // })
        //     .populate({
        //         path: 'jobPostId',
        //         select: 'title'
        //     })
        //     .populate({
        //         path: 'candidateId',
        //         select: '_id fname email'
        //     })
        //     .sort({ createdAt: -1 })

        return applications
    }

    static async getApplicationDetails(applicationId: number) {
        if (!applicationId) {
            throw new ApiError(400, 'Application Id not found!')
        }

        // const app = await Applications
        //     .findById(applicationId)
        //     .populate({
        //         path: 'jobPostId',
        //         select: 'title description'
        //     })
        //     .populate({
        //         path: 'candidateId',
        //         select: 'fname email description experience_years resume expected_salary category'
        //     })
        const app = await getCandidateApplicationDetails(applicationId)

        return app;
    }

    static async updateStatus(applicationId: number, status: Status) {
        if (!applicationId || !status) {
            throw new ApiError(400, 'ApplicationId and Status is required!')
        }

        const updatedApplication = await updateApplicationStatus(applicationId, status)
        if (!updatedApplication) {
            throw new ApiError(400, 'Application not found!')
        }

        return updatedApplication
    }
}