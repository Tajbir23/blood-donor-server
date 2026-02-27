import { Request, Response } from "express";
import encryptPass from "../../handler/validation/encryptPass";
import userModel from "../../models/user/userSchema";
import generateJwt from "../../handler/validation/generateJwt";
import addActiveUser from "../../handler/user/addActiveUser";
import sendOtp from "./sendOtp";
import findOrgRole from "../administrator/organizations/user/findOrgRole";

export const tempStoreUser = new Map<string, any>()

export const saveUser = async (data: any) => {
    const { latitude, longitude, ...restData } = data;

    const lat = parseFloat(latitude)
    const long = parseFloat(longitude)
    
    const user = await userModel.create({
        ...restData,
        location: {
            type: 'Point',
            coordinates: [long, lat]
        }
    })

    user.emailVerified = true
    await user.save
    await tempStoreUser.delete(user?.email)
    await addActiveUser(user._id)
    const orgRole = await findOrgRole(user._id.toString());
    const token = generateJwt(user.phone, user._id, user.role, orgRole)
    return {user, token}
}

export const resRegUser = async(email: string , res: Response) => {
    const userData = tempStoreUser.get(email)
            if(userData){
                const {user, token} = await saveUser(userData)
                res.cookie('token' , token, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true
                })
                res.status(200).json({success: true, message: "OTP verified", user, token})
            }
}
const createUser = async (req: Request, res: Response): Promise<void> => {
    const data = JSON.parse(req.body.userData)
    const imageUrl = res.locals.imageUrl
    data.profileImageUrl = imageUrl
    data.role = "user"
    try {
        const encryptedPassword = await encryptPass(data.password)
        data.password = encryptedPassword

        // Extract client IP
        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || null;
        data.ipAddress = clientIp;

        const checkUniqueEmail = await userModel.findOne({email: data?.email})
        const checkUniquePhone = await userModel.findOne({phone: data?.phone})
        if(checkUniqueEmail){
            res.status(400).json({success: false, message: "এই ইমেইল ইতিমধ্যে ব্যবহৃত হচ্ছে"})
            return;
        }
        if(checkUniquePhone){
            res.status(400).json({success: false, message: "এই ফোন নম্বর ইতিমধ্যে ব্যবহৃত হচ্ছে"})
            return;
        }

        // Block duplicate device: same fingerprint visitorId
        if (data?.fingerprint?.visitorId) {
            const checkFingerprint = await userModel.findOne({ 'fingerPrint.visitorId': data.fingerprint.visitorId })
            if (checkFingerprint) {
                res.status(400).json({ success: false, message: "এই ডিভাইস থেকে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে" })
                return;
            }
        }

        // Block duplicate device: same canvas fingerprint (strong hardware signal)
        if (data?.fingerprint?.canvas) {
            const checkCanvas = await userModel.findOne({ 'fingerPrint.canvas': data.fingerprint.canvas })
            if (checkCanvas) {
                res.status(400).json({ success: false, message: "এই ডিভাইস থেকে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে" })
                return;
            }
        }

        // Block duplicate IP
        if (clientIp) {
            const checkIp = await userModel.findOne({ ipAddress: clientIp })
            if (checkIp) {
                res.status(400).json({ success: false, message: "এই নেটওয়ার্ক থেকে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে" })
                return;
            }
        }

        const emailResult = await sendOtp(data?.email)
        if (!emailResult?.success) {
            res.status(500).json({ success: false, message: emailResult?.message ?? 'OTP ইমেইল পাঠাতে ব্যর্থ হয়েছে। আপনার ইমেইল ঠিকানা যাচাই করুন।' })
            return;
        }
        tempStoreUser.set(data?.email, data)

        res.status(200).json({success: true, message: "OTP আপনার ইমেইলে পাঠানো হয়েছে", email: data.email})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "User creation failed", error })
    }
};

export default createUser;