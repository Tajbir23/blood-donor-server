import { Request, Response } from "express";
import sendEmail from "../email/sendEmail";

export const otpMap = new Map<string, string>()

export const generateOTP = (email: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpMap.set(email, otp)
    return otp
}
const verifyEmail = async( req: Request, res: Response) => {
    const {email} = req.params
    const otp = await otpMap.get(email)
    const data = await sendEmail({email, subject: "Verify Email", templateType: "verifyEmail", templateData: {otp: otp || ""}})
    res.status(200).json(data)
}

export default verifyEmail