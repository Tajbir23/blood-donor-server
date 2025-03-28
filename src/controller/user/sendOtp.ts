import sendEmail from "../email/sendEmail";

export const otpMap = new Map<string, string>()

export const generateOTP = async(email: string) => {
    otpMap.delete(email)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpMap.set(email, otp)
    return otp
}

const sendOtp = async(email: string) => {
    
    const otp = await generateOTP(email)
    const data = await sendEmail({email, subject: "Verify Email", templateType: "verifyEmail", templateData: {otp: otp}})
    return data
}

export default sendOtp