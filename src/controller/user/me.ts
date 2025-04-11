import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";
import generateJwt from "../../handler/validation/generateJwt";
import findOrgRole from "../administrator/organizations/user/findOrgRole";

interface UserRequest extends Request {
    user: {
        _id: string;
    }
}

const me = async (req: Request, res: Response): Promise<void> => {
    try {
        const userRequest = req as UserRequest;
        const user = await userModel.findById(userRequest.user._id)
            .select('-password')
            .populate({
                path: 'organizationId',
            });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' })
            return;
        }

        const orgRole = await findOrgRole(user._id.toString());
        const token = await generateJwt( user.phone, user._id, user.role, orgRole )
        
        res.cookie("token", token, {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "lax"});
        res.status(200).json({ success: true, user})
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error })
    }
}

export default me;

