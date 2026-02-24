import { Request, Response } from "express";
import FacebookMessage from "../../../../models/facebook/facebookMessageSchema";

const getFacebookMessages = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const psId = req.query.psId as string | undefined;
        const direction = req.query.direction as string | undefined;

        const filter: Record<string, unknown> = {};
        if (psId) filter.psId = psId;
        if (direction) filter.direction = direction;

        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            FacebookMessage.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            FacebookMessage.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: messages,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("getFacebookMessages error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export default getFacebookMessages;
