import { Request, Response } from "express";
import donationHistoryModel from "../../models/user/donationHistorySchema";

const getDonationHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
        const [donations, total] = await Promise.all([
            donationHistoryModel
                .find({ userId })
                .sort({ donationDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            donationHistoryModel.countDocuments({ userId }),
        ]);

        res.status(200).json({
            success: true,
            donations,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[getDonationHistory]", error);
        res.status(500).json({ success: false, message: "রক্তদানের ইতিহাস লোড করতে ব্যর্থ হয়েছে" });
    }
};

export default getDonationHistory;
