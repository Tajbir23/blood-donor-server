import { Request, Response } from "express";
import sendOtp from "./sendOtp";

const resendOtp = async(req: Request, res: Response) => {
    const {email} = req.body
    try {
        const result = await sendOtp(email)
        if (!result?.success) {
            res.status(500).json({ success: false, message: result?.message ?? 'OTP পুনরায় পাঠাতে ব্যর্থ হয়েছে' })
            return;
        }
        res.status(200).json({success: true, message: "OTP পুনরায় পাঠানো হয়েছে"})
    } catch (error) {
        res.status(500).json({success: false, message: "OTP পুনরায় পাঠাতে ব্যর্থ হয়েছে"})
    }
}

export default resendOtp