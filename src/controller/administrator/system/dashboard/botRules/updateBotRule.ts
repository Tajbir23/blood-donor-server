import { Request, Response } from "express";
import BotCustomRuleModel from "../../../../../models/ai/botCustomRuleSchema";
import { invalidateCustomRuleCache } from "../../../../../handler/facebookBotHandler/ai/customRuleChecker";

const updateBotRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { trigger, response, matchType, platform, isActive } = req.body;

        const updates: Record<string, unknown> = {};
        if (trigger   !== undefined) updates.trigger   = trigger.trim();
        if (response  !== undefined) updates.response  = response.trim();
        if (matchType !== undefined) updates.matchType = matchType;
        if (platform  !== undefined) updates.platform  = platform;
        if (isActive  !== undefined) updates.isActive  = isActive;

        const updated = await BotCustomRuleModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Rule পাওয়া যায়নি" });
            return;
        }
        invalidateCustomRuleCache();
        res.json({ success: true, message: "Rule আপডেট হয়েছে", data: updated });
    } catch (error) {
        console.error("[updateBotRule]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default updateBotRule;
