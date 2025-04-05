import { Request, Response } from "express";
import bloodRequestModel from "../../models/blood/bloodRequestSchema";

const getBloodRequests = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const bloodRequests = await bloodRequestModel.find({})
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const totalBloodRequests = await bloodRequestModel.countDocuments({});
        res.status(200).json({
            success: true,
            message: "Blood requests fetched successfully",
            data: bloodRequests,
            total: totalBloodRequests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching blood requests",
            error: error
        });
    }
}

export default getBloodRequests;

