"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botCustomRuleSchema_1 = __importDefault(require("../../../../../models/ai/botCustomRuleSchema"));
const getBotRules = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || "";
        const query = {};
        if (search)
            query.trigger = { $regex: search, $options: "i" };
        const [rules, total] = await Promise.all([
            botCustomRuleSchema_1.default.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            botCustomRuleSchema_1.default.countDocuments(query),
        ]);
        res.json({
            success: true,
            data: rules,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        console.error("[getBotRules]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = getBotRules;
