import { Request, Response } from "express";
import userModel from "../../../../models/user/userSchema";

const removeUser = async(req: Request, res: Response) => {
    const {organizationId} = req.params
    const {userId} = req.body
    try {
        const user = await userModel.findByIdAndUpdate(userId, {$pull: {organizationId}})
        res.status(201).json({success: true, message: `${user?.fullName} remove from organization`})
        return
    } catch (error) {
        console.log(error)
        res.status(404).json({success: false, message: "Internal server error"})
    }
}

export default removeUser