import { Request, Response } from "express";
import BotCustomRuleModel from "../../../../../models/ai/botCustomRuleSchema";
import { invalidateCustomRuleCache } from "../../../../../handler/facebookBotHandler/ai/customRuleChecker";

const addBotRule = async (req: Request, res: Response) => {
    try {
        const { trigger, response, matchType, platform } = req.body;
        const addedBy = (req as any).user?.userId || "admin";

        if (!trigger || !response) {
            res.status(400).json({ success: false, message: "trigger এবং response আবশ্যক" });
            return;
        }

        const rule = await BotCustomRuleModel.create({
            trigger: trigger.trim(),
            response: response.trim(),
            matchType: matchType || "contains",
            platform: platform || "all",
            isActive: true,
            addedBy,
        });

        invalidateCustomRuleCache();

        res.status(201).json({ success: true, message: "Rule সংরক্ষিত হয়েছে", data: rule });
    } catch (error) {
        console.error("[addBotRule]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default addBotRule;
