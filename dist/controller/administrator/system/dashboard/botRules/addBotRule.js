"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botCustomRuleSchema_1 = __importDefault(require("../../../../../models/ai/botCustomRuleSchema"));
const customRuleChecker_1 = require("../../../../../handler/facebookBotHandler/ai/customRuleChecker");
const addBotRule = async (req, res) => {
    var _a;
    try {
        const { trigger, response, matchType, platform } = req.body;
        const addedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || "admin";
        if (!trigger || !response) {
            res.status(400).json({ success: false, message: "trigger এবং response আবশ্যক" });
            return;
        }
        const rule = await botCustomRuleSchema_1.default.create({
            trigger: trigger.trim(),
            response: response.trim(),
            matchType: matchType || "contains",
            platform: platform || "all",
            isActive: true,
            addedBy,
        });
        (0, customRuleChecker_1.invalidateCustomRuleCache)();
        res.status(201).json({ success: true, message: "Rule সংরক্ষিত হয়েছে", data: rule });
    }
    catch (error) {
        console.error("[addBotRule]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = addBotRule;
