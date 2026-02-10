import jwt from 'jsonwebtoken'

const accessSecret = process.env.ACCESSTOKEN_SCERET
const accessExpiry = process.env.ACCESSTOKEN_EXPIRY
const refreshSecret = process.env.REFRESHTOKEN_SCERET
const refreshExpiry = process.env.REFRESHTOKEN_EXPIRY
const otpTokenSecret = process.env.JWT_OTP_TOKEN_SECRET

export async function generateAccessToken(payload: any) {
    if(!accessExpiry || !accessSecret) return null;
    

    return jwt.sign(payload, accessSecret as jwt.Secret, {expiresIn: accessExpiry} as jwt.SignOptions)
}

export async function generateRefreshToken(payload: any) {
    if(!refreshExpiry || !refreshSecret) return null;

    return jwt.sign(payload, refreshSecret as jwt.Secret, {expiresIn: refreshExpiry} as jwt.SignOptions)
}

export async function verifyRefreshToken(token: string) {
    if(!refreshSecret) return null;

    return jwt.verify(token, refreshSecret)
}

export async function verifyAccessToken(token: string) {
    if(!accessSecret) return null;

    return jwt.verify(token, accessSecret)
}

export async function generateOtpToken(payload: { email: string, otp: number }) {
    if(!otpTokenSecret) return null;

    return jwt.sign(payload, otpTokenSecret as string, { expiresIn: "15m" })
}

export async function verifyOtpToken(token: string) {
    if(!otpTokenSecret) return null;
    
    return jwt.verify(token, otpTokenSecret)
}