import nodemailer from 'nodemailer'
import { generateAccessToken, generateOtpToken, verifyAccessToken, verifyOtpToken } from '../utils/jwt.js';
import type { RegisterBody } from '../types/auth.js';
import { Recruiter, type RecruiterInterface } from '../models/recruiter.model.js';
import { JobPost } from '../models/jobpost.model.js';
import type { CandidateInternface } from '../models/candidate.model.js';

const transpoter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

const OtpToTokenMap = new Map();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
}

export const sendEmail = async (user: RecruiterInterface) => {
  const OTP = generateOtp();
  const otpToken = await generateOtpToken({ email: user.email, otp: OTP })
  if (otpToken) {
    console.log('AccessToken Mapped!:', OtpToTokenMap)
    OtpToTokenMap.set(user.email, otpToken)
  }
  const info = await transpoter.sendMail({
    from: `'JobPortal' <jobportal@gmail.com>`,
    to: user.email,
    subject: "Email Verification",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Email Verification</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background:#ffffff; border-radius:8px; padding:24px; font-family:Arial, sans-serif;">
          
          <!-- Header -->
          <tr>
            <td style="text-align:center; padding-bottom:16px;">
              <h2 style="margin:0; color:#111;">Verify your email</h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="color:#555; font-size:14px; line-height:1.5; padding-bottom:20px;">
              Hi,<br><br>
              Use the verification code below to confirm your email address.
              This code is valid for the next <strong>15 minutes</strong>.
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <div style="
                display:inline-block;
                background:#f1f5f9;
                padding:14px 24px;
                font-size:24px;
                letter-spacing:6px;
                font-weight:bold;
                border-radius:6px;
                color:#000;
              ">
                ${OTP}
              </div>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="color:#777; font-size:13px; line-height:1.5; padding-bottom:20px;">
              If you did not request this, you can safely ignore this email.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #eee; padding-top:16px; font-size:12px; color:#999; text-align:center;">
              © 2026 MyApp<br>
              This is an automated message. Please do not reply.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
  })

  console.log('Message:', info.messageId)
  return info.messageId;
}

export const verifyEmailOtp = async (email: string, otp: number) => {
  const token = OtpToTokenMap.get(email);

  console.log('get token from map:', token)

  if (!token) {
    return false;
  }

  try {
    console.log('Decoding Mapped token..')
    const decoded = await verifyOtpToken(token) as { email: string, otp: number }
    console.log('Decoded Mapped Token:', decoded, 'Otp Geted:', otp)
    
    if (Number(decoded.otp) !== Number(otp)) {
      return false;
    }
    OtpToTokenMap.delete(email);

    return true;
  } catch (error) {
    console.error(error)
    return false
  }
}

export const sendCandidateApplication = async (jobId: string, candidate: CandidateInternface) => {
  const jobpost = await JobPost.findById(jobId)
  const recruiter = await Recruiter.findById(jobpost?.recruiterId)

  const info = await transpoter.sendMail({
    from: `'JobPortal' <jobportal@gmail.com>`,
    to: recruiter?.email,
    subject: "Candidate Application",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>New Job Application</title>
</head>

<body style="margin:0;padding:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">
          
          <!-- HEADER -->
          <tr>
            <td style="background:#155eef;color:#ffffff;padding:20px;font-size:20px;font-weight:bold;">
              New Candidate Application
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px;">
              
              <p style="font-size:16px;margin-bottom:20px;">
                A candidate has applied to your job posting.
              </p>

              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                
                <tr>
                  <td style="font-weight:bold;width:160px;">Name:</td>
                  <td>${candidate.fname}</td>
                </tr>

                <tr>
                  <td style="font-weight:bold;">Email:</td>
                  <td>${candidate.email}</td>
                </tr>

                <tr>
                  <td style="font-weight:bold;">Experience:</td>
                  <td>${candidate.experience_years} years</td>
                </tr>

                <tr>
                  <td style="font-weight:bold;">Category:</td>
                  <td>${candidate.category}</td>
                </tr>

                <tr>
                  <td style="font-weight:bold;">Expected Salary:</td>
                  <td>₹${candidate?.expected_salary?.min} - ₹${candidate?.expected_salary?.max}</td>
                </tr>

                <tr>
                  <td style="font-weight:bold;">About Candidate:</td>
                  <td>${candidate.description}</td>
                </tr>

              </table>

              <!-- RESUME BUTTON -->
              <div style="margin-top:30px;">
                <a href="#" 
                   style="background:#155eef;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">
                   View Resume
                </a>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f1f3f5;padding:20px;text-align:center;font-size:12px;color:#777;">
              This email was sent from Job Portal system.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`
  })

  return info
}