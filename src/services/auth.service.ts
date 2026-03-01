import { ApiError } from "../utils/ApiError.js";
import { RecruiterService } from './recruiter.service.js';
import type { LoginBody, RegisterBody } from '../types/auth.js';
import { CandidateService } from './candidate.service.js';
import { Candidate } from "../models/candidate.model.js";
import { Recruiter } from "../models/recruiter.model.js";

export class AuthService {
    static async register(data: RegisterBody) {
        const { email, password } = data
        if (!email?.trim() || !password?.trim()) {
            throw new ApiError(400, 'Email and Password is required!')
        }

        let user = null;
        if(data.role === 'recruiter') {
            user = await RecruiterService.register(data)
        } else {
            user = await CandidateService.register(data)
        }

        if(!user) {
            throw new ApiError(500, 'Failed to register user!')
        }

        return user;
    }

    static async login(data: LoginBody) {
        const { email, password } = data
        if (!email?.trim() || !password?.trim()) {
            throw new ApiError(400, 'Email and Password is required!')
        }

        let user = await CandidateService.login(data)
        if(!user) {
            console.log('Call Recruiter Service for user login!')
            user = await RecruiterService.login(data)
        }

        if(!user) {
            throw new ApiError(400, 'User not registered or verified!')
        }

        return user;
    }

    static async logout(id: string) {
        let user = await Candidate.findById(id)
        if(!user) {
            user = await Recruiter.findById(id)
        }

        if(!user) {
            throw new ApiError(404, 'User not found!')
        }

        user.refresh_token = null
        await user.save({ validateBeforeSave: false })
        
        return user;
    }
}