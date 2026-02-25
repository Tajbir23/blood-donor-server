import { Request, Response } from "express";
import AiTrainingModel from "../../../../../models/ai/aiTrainingSchema";

const getAiTrainingData = async (req: Request, res: Response) => {
    try {
        const page    = Math.max(1, parseInt(req.query.page  as string) || 1);
        const limit   = Math.min(100, parseInt(req.query.limit as string) || 20);
        const skip    = (page - 1) * limit;
        const search  = (req.query.search as string || "").trim();

        const filter: any = {};
        if (search) {
            filter.$or = [
                { questionText: { $regex: search, $options: "i" } },
                { answerText:   { $regex: search, $options: "i" } },
                { intent:       { $regex: search, $options: "i" } },
            ];
        }

        const [total, data] = await Promise.all([
            AiTrainingModel.countDocuments(filter),
            AiTrainingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ]);

        res.status(200).json({
            success: true,
            data,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("[getAiTrainingData]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default getAiTrainingData;
