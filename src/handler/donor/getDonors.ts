import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

const getDonors = async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search } = req.query;
    try {
        // Find donors where lastDonationDate is either null or older than 4 months
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
        
        // Build the query conditions
        let queryConditions: any[] = [
            // Donor eligibility criteria
            {
                $or: [
                    { lastDonationDate: { $lte: fourMonthsAgo } },
                    { lastDonationDate: null },
                    { lastDonationDate: { $exists: false } }
                ]
            },
            // User must not be banned, must be active and verified
            { isBanned: { $ne: true } },
            { isActive: true },
            { isVerified: true }
        ];
        
        // Add search criteria if search parameter is provided
        if (search && search !== "") {
            const searchQuery = String(search);
            queryConditions.push({
                $or: [
                    { fullName: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } },
                    { phone: { $regex: searchQuery, $options: "i" } },
                    { address: { $regex: searchQuery, $options: "i" } },
                    { districtId: { $regex: searchQuery, $options: "i" } },
                    { thanaId: { $regex: searchQuery, $options: "i" } },
                    { bloodGroup: searchQuery }
                ]
            });
        }
        
        const donors = await userModel.find({ $and: queryConditions })
            .select('-password -fingerPrint -location -token')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        
        const totalDonors = await userModel.countDocuments({ $and: queryConditions });
        
        res.status(200).json({
            success: true,
            message: "Donors fetched successfully",
            data: donors,
            total: totalDonors,
            cutoffDate: fourMonthsAgo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching donors",
            error: error
        });
    }
}

export default getDonors;
