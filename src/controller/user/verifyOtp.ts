import { Request, Response } from "express";
import { otpMap } from "./sendOtp";
import { resRegUser } from "./createUser";

const verifyOtp = async (req: Request, res: Response) => {
    const {email, otp, otpType} = req.body
    const otpData = await otpMap.get(email)
    console.log("check otp", otpData, otp === otpData)
    if(otpData === otp){
        if(otpType === "register"){
            await resRegUser(email, res)
        }
    }else{
        res.status(400).json({success: false, message: "Invalid OTP"})
    }
}

export default verifyOtp
