"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botCustomRuleSchema_1 = __importDefault(require("../../../../../models/ai/botCustomRuleSchema"));
const customRuleChecker_1 = require("../../../../../handler/facebookBotHandler/ai/customRuleChecker");
const deleteBotRule = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await botCustomRuleSchema_1.default.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Rule পাওয়া যায়নি" });
            return;
        }
        (0, customRuleChecker_1.invalidateCustomRuleCache)();
        res.json({ success: true, message: "Rule মুছে ফেলা হয়েছে" });
    }
    catch (error) {
        console.error("[deleteBotRule]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = deleteBotRule;
