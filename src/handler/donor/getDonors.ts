import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

const getDonors = async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search } = req.query;
    try {
        // Find donors where lastDonationDate is either null or older than 4 months
        const fourMonthsAgo = new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000);
        const donors = await userModel.find({
            $and: [
                {
                    $or: [
                        { lastDonationDate: { $lte: fourMonthsAgo } },
                        { lastDonationDate: null },
                        { isVerified: true },
                        { isBanned: false }
                    ]
                },
                {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                        { phone: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        {districtId: {$regex: search, $options: "i"}},
                        {thanaId: {$regex: search, $options: "i"}},
                        {bloodGroup: search}
                    ]
                }
            ]
        })
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        
        const totalDonors = await userModel.countDocuments({
            $and: [
                {
                    $or: [
                        { lastDonationDate: { $lte: fourMonthsAgo } },
                        { lastDonationDate: null },
                        { isVerified: true },
                        { isBanned: false }
                    ]
                },
                {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                        { phone: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        {districtId: {$regex: search, $options: "i"}},
                        {thanaId: {$regex: search, $options: "i"}},
                        {bloodGroup: search}
                    ]
                }
            ]
        });

        
        res.status(200).json({
            success: true,
            message: "Donors fetched successfully",
            data: donors,
            total: totalDonors
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error fetching donors",
            error: error
        });
    }
}

export default getDonors;
