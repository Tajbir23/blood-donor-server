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
    addActiveUser(user._id)
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

        const checkUniqueEmail = await userModel.findOne({email: data?.email})
        const checkUniquePhone = await userModel.findOne({phone: data?.phone})
        if(checkUniqueEmail){
            console.log(checkUniqueEmail)
            res.status(400).json({success: false, message: "Email already exists"})
            return;
        }
        if(checkUniquePhone){
            res.status(400).json({success: false, message: "Phone number already exists"})
            return;
        }

        await sendOtp(data?.email)
        tempStoreUser.set(data?.email, data)

        
        res.status(200).json({success: true, message: "OTP sent to email", email: data.email})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "User creation failed", error })
    }
};

export default createUser;