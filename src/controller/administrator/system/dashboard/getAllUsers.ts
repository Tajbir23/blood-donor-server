import { Request, Response } from "express";
import userModel from "../../../../models/user/userSchema";

const getAllUsers = async (req: Request, res: Response) => {
    const {search = '', page = 1, limit = 10, isActive, isBanned, isVerified, allUser} = req.query;
    const pageNumber = parseInt(page as any) || 1;
    const limitNumber = parseInt(limit as any) || 10;

    try {
        const conditions: any[] = [{ role: 'user' }];
        
        if (allUser !== 'true') {
            if (isActive !== undefined && isActive !== '') {
                conditions.push({ isActive: isActive === 'true' });
            }
            if (isBanned !== undefined && isBanned !== '') {
                conditions.push({ isBanned: isBanned === 'true' });
            }
            if (isVerified !== undefined && isVerified !== '') {
                if (isVerified === 'true') {
                    conditions.push({ isVerified: true });
                } else {
                    // Match both explicitly false AND missing field (old users without this field)
                    conditions.push({
                        $or: [
                            { isVerified: false },
                            { isVerified: { $exists: false } },
                            { isVerified: null }
                        ]
                    });
                }
            }
        }
        
        if (search) {
            const searchConditions: any[] = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
            if (/^[0-9a-fA-F]{24}$/.test(search as string)) {
                searchConditions.push({ _id: search });
            }
            conditions.push({ $or: searchConditions });
        }
        
        const query = conditions.length === 1 ? conditions[0] : { $and: conditions };
        
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
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: (error as Error).message
        })
    }
}

export default getAllUsers;
