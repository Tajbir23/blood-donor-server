import { Request, Response } from "express";
import orgJoinRequestModel from "../../../../models/organization/orgJoinRequestSchema";
import userModel from "../../../../models/user/userSchema";
import mongoose from "mongoose";

const manageOrgJoinReq = async (req: Request, res: Response): Promise<void> => {
    const { organizationId } = req.params;
    const { userId, status} = req.body;

    console.log("organizationId", organizationId, "orgJoinReq", userId, "status", status)

    try {
        
        if(status === 'accepted'){
            const user = await userModel.findById(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }


            await userModel.updateOne({_id: userId}, {$push : {organizationId: organizationId}})
            
            await orgJoinRequestModel.updateOne({userId, organizationId}, {status})

            res.status(200).json({success: true, message: "Organization join request accepted" });
            return;
        } else {
            await orgJoinRequestModel.deleteOne({userId, organizationId})
            res.status(200).json({success: true, message: "Organization join request rejected" });
            return;
        }

    } catch (error) {
        console.log(error)
        res.status(404).json({success: false, message: "Server error" });
    }
}

export default manageOrgJoinReq;