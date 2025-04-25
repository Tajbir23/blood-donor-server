import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

const updateProfileImage = async(req: Request, res: Response) => {
    const {_id} = (req as any).user
    const {imageUrl} = res.locals

    try {
        await userModel.findByIdAndUpdate(_id, {profileImageUrl: imageUrl})
        res.status(201).json({success: true, message: "Profile image updated"})
    } catch (error) {
        res.status(500).json({success: false, message: "Server error"})
    }


}

export default updateProfileImage