import { Request, Response } from "express";
import userModel from "../../../../models/user/userSchema";

const roleChangeUser = async (req: Request, res: Response) => {
    const { userId, newRole } = req.body;
    const adminRole = (req as any).role;
    
    let isPermission = false;

    if(adminRole === "moderator") {
        res.status(403).json({
            success: false,
            message: "আপনার রোল পরিবর্তন করার অনুমতি নেই"
        })
        return
    }

    if(adminRole === "superAdmin") isPermission = true;

    if(adminRole === "admin" && newRole === "moderator") isPermission = true;

    if(isPermission){
        try {
            if(newRole === "superAdmin"){
                await userModel.findByIdAndUpdate(userId, {role: newRole});
                await userModel.findOneAndUpdate({role: "superAdmin"}, {role: "admin"});
                res.status(200).json({
                    success: true,
                    message: "রোল পরিবর্তন সফলভাবে হয়েছে"
                })
                return
            }

            if(adminRole === "admin"){
                await userModel.findByIdAndUpdate(userId, {role: newRole});
                res.status(200).json({
                    success: true,
                    message: "রোল পরিবর্তন সফলভাবে হয়েছে"
                })
                return
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "রোল পরিবর্তন সফলভাবে হয়নি"
            })
            return
        }
    }else{
        res.status(403).json({
            success: false,
            message: "আপনার রোল পরিবর্তন করার অনুমতি নেই"
        })
        return
    }
}


export default roleChangeUser;