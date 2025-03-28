import { Request, Response } from "express";
import encryptPass from "../../handler/validation/encryptPass";
import userModel from "../../models/user/userSchema";
import generateJwt from "../../handler/validation/generateJwt";
import addActiveUser from "../../handler/user/addActiveUser";
import { generateOTP } from "./verifyEmail";

const createUser = async (req: Request, res: Response): Promise<void> => {
    const data = JSON.parse(req.body.userData)
    const imageUrl = res.locals.imageUrl
    data.profileImageUrl = imageUrl
    data.role = "user"
    try {
        const encryptedPassword = await encryptPass(data.password)
        data.password = encryptedPassword

        const user = await userModel.create(data)
        
        addActiveUser(user._id)
        
        const token = generateJwt(user.phone, user._id, user.role)
        
        await generateOTP(user.email)
        // Set cookie with minimal options
        res.cookie('token', token,{
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })
        
        res.status(201).json({ 
            success: true,
            message: "Registration successful", 
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "User creation failed", error })
    }
};

export default createUser;