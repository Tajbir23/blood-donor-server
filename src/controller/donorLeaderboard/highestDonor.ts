import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

const highestDonor = async (req: Request, res: Response) => {
    try {
        const donor = await userModel.find({
                isActive: true,
                isVerified: true,
                isBanned: false,
            })
            .select('fullName thanaId districtId profileImageUrl totalDonationCount bloodGroup')
            .sort({ totalDonationCount: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            message: "Highest Donor Leaderboard",
            data: donor || []
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        })
    }
}

export default highestDonor;
