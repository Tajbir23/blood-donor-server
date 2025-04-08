import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

const getMembers = async (req: Request, res: Response) => {
    const { organizationId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    
    try {
        // Build query with search functionality
        let query: any = { organizationId: organizationId };
        
        // Add search condition if search parameter is provided
        if (search && typeof search === 'string' && search.trim() !== '') {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { bloodGroup: { $regex: search, $options: "i" } }
            ];
        }
        
        const members = await userModel.find(
            query,
            { password: 0, fingerPrint: 0 }
        ).skip(skip).limit(limitNumber).lean();
        
        // Get total count for pagination
        const totalMembers = await userModel.countDocuments(query);
        const totalPages = Math.ceil(totalMembers / limitNumber);
        
        res.status(200).json({
            success: true,
            members,
            totalPages
        });
    } catch (error) {
        console.error("Error fetching organization members:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch organization members"
        });
    }
};

export default getMembers;
