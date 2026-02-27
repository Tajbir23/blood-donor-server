import { Request, Response } from "express";
import BotCustomRuleModel from "../../../../../models/ai/botCustomRuleSchema";

const getBotRules = async (req: Request, res: Response) => {
    try {
        const page  = parseInt(req.query.page  as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";

        const query: Record<string, unknown> = {};
        if (search) query.trigger = { $regex: search, $options: "i" };

        const [rules, total] = await Promise.all([
            BotCustomRuleModel.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            BotCustomRuleModel.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: rules,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("[getBotRules]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default getBotRules;
