import { Request, Response } from "express";
import userModel from "../../../../models/user/userSchema";

const addMember = async(req: Request, res: Response) => {
    const {organizationId} = (req as any).params
    const {memberId} = req.body
    try {
        console.log(memberId, organizationId)
        const alreadymember = await userModel.findOne({_id: memberId, organizationId})
        
        if(alreadymember){
            res.status(201).json({success: false, message: "Already joined"})
            return
        }

        await userModel.findByIdAndUpdate(memberId, {$push: {organizationId: organizationId}})
        res.status(201).json({success: true, message: "Member added"})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error"})
    }
}

export default addMember