import { Request, Response } from "express";
import userModel from "../../../../models/user/userSchema";

const getAllUsers = async (req: Request, res: Response) => {
    const {search = '', page = 1, limit = 10} = req.query;
    const pageNumber = parseInt(page as any) || 1;
    const limitNumber = parseInt(limit as any) || 10;

    try {
        const query: any = {
            role: 'user'
        };
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
            
            // Only try to match ObjectId if the search string looks like one
            if (/^[0-9a-fA-F]{24}$/.test(search as string)) {
                query.$or.push({ _id: search });
            }
        }
        
        const users = await userModel.find(query)
            .select('-password -location -fingerPrint')
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalUsers = await userModel.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limitNumber);

        res.status(200).json({
            users,
            totalPages,
            totalUsers
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        })
    }
}

export default getAllUsers;
