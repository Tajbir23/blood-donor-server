import { Request, Response } from "express";
import userModel from "../../../../models/user/userSchema";

const getAllAdmins = async (req: Request, res: Response) => {
    const {_id} = (req as any).user;
    const role = (req as any).role;
    const {search = '', page = 1, limit = 10} = req.query;
    const pageNumber = parseInt(page as any) || 1;
    const limitNumber = parseInt(limit as any) || 10;

    console.log("role",role)
    try {
        let isPermission = role === "superAdmin" ? true : false;
        console.log(isPermission)
        if(!isPermission) {
            res.status(403).json({
                success: false,
                message: "আপনার ডাটা অ্যাক্সেস এর অনুমতি নেই"
            })
            return
        }

        const query: any = {role: "admin", _id: {$ne: _id}};
        if(search) {
            query.$or = [
                {name: {$regex: search, $options: "i"}},
                {email: {$regex: search, $options: "i"}},
                {phone: {$regex: search, $options: "i"}}
            ]
        }

        const admins = await userModel.find(query).select('-password -location -fingerPrint').skip((pageNumber - 1) * limitNumber).limit(limitNumber);


        const totalAdmins = await userModel.countDocuments(query);
        const totalPages = Math.ceil(totalAdmins / limitNumber);

        res.status(200).json({
            success: true,
            message: "সকল অ্যাডমিন পাওয়া গেছে",
            users: admins,
            totalPages,
            totalUsers: totalAdmins
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "কোনো অ্যাডমিন পাওয়া যাইনি"
        })
    }
}

export default getAllAdmins;
