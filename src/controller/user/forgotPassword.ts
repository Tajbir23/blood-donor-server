import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";
import sendEmail from "../email/sendEmail";
import encryptPass from "../../handler/validation/encryptPass";

const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

const forgotPassword = async(req: Request, res: Response): Promise<void> => {
    const {email} = req.body
    try {
        const plainPassword = generateRandomPassword();
        const hashedPassword = await encryptPass(plainPassword);
        const user = await userModel.findOneAndUpdate({email}, {password: hashedPassword})

        if(!user || !user.email || !user.fullName) {
            res.status(404).json({success: false, message: 'আপনার ইমেইলটি ভূল'})
            return;
        }

        const templateData = {
            name: user.fullName,
            newPassword: plainPassword
        }
        const data = {
            email: user.email,
            subject: 'আপনার নতুন পাসওয়ার্ড',
            templateType: 'forgot-password',
            templateData
        }
        await sendEmail(data)
        res.status(200).json({success: true, message: 'আপনার ইমেইলে নতুন পাসওয়ার্ড পাঠান হয়েছে'})
    } catch (error) {
        res.status(500).json({success: false, message: 'সার্ভার সমস্যা', error})
    }
}
export default forgotPassword