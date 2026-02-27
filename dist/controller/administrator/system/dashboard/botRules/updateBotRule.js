"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botCustomRuleSchema_1 = __importDefault(require("../../../../../models/ai/botCustomRuleSchema"));
const customRuleChecker_1 = require("../../../../../handler/facebookBotHandler/ai/customRuleChecker");
const updateBotRule = async (req, res) => {
    try {
        const { id } = req.params;
        const { trigger, response, matchType, platform, isActive } = req.body;
        const updates = {};
        if (trigger !== undefined)
            updates.trigger = trigger.trim();
        if (response !== undefined)
            updates.response = response.trim();
        if (matchType !== undefined)
            updates.matchType = matchType;
        if (platform !== undefined)
            updates.platform = platform;
        if (isActive !== undefined)
            updates.isActive = isActive;
        const updated = await botCustomRuleSchema_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Rule পাওয়া যায়নি" });
            return;
        }
        (0, customRuleChecker_1.invalidateCustomRuleCache)();
        res.json({ success: true, message: "Rule আপডেট হয়েছে", data: updated });
    }
    catch (error) {
        console.error("[updateBotRule]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = updateBotRule;
