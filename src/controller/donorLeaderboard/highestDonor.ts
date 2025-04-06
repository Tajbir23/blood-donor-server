import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

const highestDonor = async (req: Request, res: Response) => {
    try {
        const donor = await userModel.find({})
            .sort({donationCount: -1})  // Sort by donation count in descending order
            .limit(10);  // Get top 10 donors with highest donation count

        
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
