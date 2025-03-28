import { Request, Response } from "express";
import sendOtp from "./sendOtp";

const resendOtp = async(req: Request, res: Response) => {
    const {email} = req.body
    try {
        await sendOtp(email)
        res.status(200).json({success: true, message: "Otp resend successful"})
    } catch (error) {
        res.status(400).json({success: false, message: "Otp resend failed", error})
    }
}

export default resendOtp