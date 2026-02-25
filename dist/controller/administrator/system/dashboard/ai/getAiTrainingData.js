"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aiTrainingSchema_1 = __importDefault(require("../../../../../models/ai/aiTrainingSchema"));
const getAiTrainingData = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const search = (req.query.search || "").trim();
        const filter = {};
        if (search) {
            filter.$or = [
                { questionText: { $regex: search, $options: "i" } },
                { answerText: { $regex: search, $options: "i" } },
                { intent: { $regex: search, $options: "i" } },
            ];
        }
        const [total, data] = await Promise.all([
            aiTrainingSchema_1.default.countDocuments(filter),
            aiTrainingSchema_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ]);
        res.status(200).json({
            success: true,
            data,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        console.error("[getAiTrainingData]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = getAiTrainingData;
