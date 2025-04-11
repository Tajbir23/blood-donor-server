import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";
import verifyPass from "../../handler/validation/verifyPass";
import generateJwt from "../../handler/validation/generateJwt";
import addActiveUser from "../../handler/user/addActiveUser";
import findOrgRole from "../administrator/organizations/user/findOrgRole";


const loginUser = async (req: Request, res: Response): Promise<void> => {
    const {identity, password} = req.body;

    try {
        if(!identity || !password) {
            res.status(400).json({message: "ফোন নম্বর বা পাসওয়ার্ড প্রদত্ত করুন"});
            return;
        }
    
        const user = await userModel.findOne({
            $or: [
                {phone: identity}, 
                {email: identity}
            ]
        });
    
        console.log(user)
        if(user) {
            const checkPass = await verifyPass(password, user.password);
            if(checkPass) {
                addActiveUser(user._id)
                const userId = user._id.toString();
                const orgRole = await findOrgRole(userId);
                const token = generateJwt(user.phone, user._id, user.role, orgRole);
                res.cookie("token", token, {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "lax"});
                res.status(200).json({success: true, message: "Login successful", user});
                return;
            } else {
                res.status(403).json({message: "পাসওয়ার্ড ভুল হয়েছে"});
                return;
            }
        } else {
            console.log("fingOrgRole.ts", 401)
            res.status(401).json({message: "ফোন নম্বর বা পাসওয়ার্ড ভুল হয়েছে"});
            return;
        }
    } catch (error: any) {
        console.log(error?.message, error)
        res.status(500).json({message: "সার্ভার ত্রুটি"});
    }
}

export default loginUser;