import { Request, Response } from "express";
import organizationModel from "../../models/organization/organizationSchema";
import userModel from "../../models/user/userSchema";

interface UserRequest extends Request {
    user: {
        _id: string;
    }
}

const myOrganizations = async(req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as UserRequest).user._id;
        
        // Find organizations where user is owner, admin, superAdmin, or moderator
        const organizations = await organizationModel.find({
            $or: [
                { owner: userId },
                { admins: userId },
                { superAdmins: userId },
                { moderators: userId }
            ]
        }).populate([
            { path: 'owner', select: 'fullName email phone profileImageUrl' },
            { path: 'admins', select: 'fullName email phone profileImageUrl' },
            { path: 'superAdmins', select: 'fullName email phone profileImageUrl' },
            { path: 'moderators', select: 'fullName email phone profileImageUrl' }
        ]);
        
        res.status(200).json({
            success: true, 
            count: organizations.length,
            organizations
        });
    } catch (error) {
        console.error("Error finding organizations:", error);
        res.status(500).json({success: false, message: 'সার্ভার এ সমস্যা হয়েছে'});
    }
}

export default myOrganizations;