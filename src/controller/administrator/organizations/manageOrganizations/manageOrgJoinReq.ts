import { Request, Response } from "express";
import orgJoinRequestModel from "../../../../models/organization/orgJoinRequestSchema";
import userModel from "../../../../models/user/userSchema";
import mongoose from "mongoose";

const manageOrgJoinReq = async (req: Request, res: Response): Promise<void> => {
    const { organizationId } = req.params;
    const {orgJoinRequest, status} = req.body;

    console.log(orgJoinRequest, status)
    try {
        const data = await orgJoinRequestModel.findByIdAndUpdate(orgJoinRequest, {status}, {new: true});
        if(status === 'accepted'){
            const user = await userModel.findById(data?.userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            if (!user.organizationId) {
                user.organizationId = [];
            }

            
            user.organizationId.push(organizationId as unknown as mongoose.Schema.Types.ObjectId);
            user.isVerified = true;
            await user.save();
            
            res.status(200).json({success: true, message: "Organization join request accepted" });
            return;
        } else {
            await orgJoinRequestModel.findByIdAndDelete(orgJoinRequest);
            res.status(200).json({success: true, message: "Organization join request rejected" });
            return;
        }

    } catch (error) {
        console.log(error)
        res.status(404).json({success: false, message: "Server error" });
    }
}

export default manageOrgJoinReq;