import { Request, Response } from "express";
import sendEmail from "../email/sendEmail";

const verifyEmail = async( req: Request, res: Response) => {
    const {email} = req.params
    const data = await sendEmail({email, subject: "Verify Email", templateType: "verifyEmail", templateData: {otp: "41569"}})
    res.status(200).json(data)
}

export default verifyEmail