import { Request, Response } from "express";
import BotCustomRuleModel from "../../../../../models/ai/botCustomRuleSchema";
import { invalidateCustomRuleCache } from "../../../../../handler/facebookBotHandler/ai/customRuleChecker";

const deleteBotRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await BotCustomRuleModel.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Rule পাওয়া যায়নি" });
            return;
        }
        invalidateCustomRuleCache();
        res.json({ success: true, message: "Rule মুছে ফেলা হয়েছে" });
    } catch (error) {
        console.error("[deleteBotRule]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default deleteBotRule;
