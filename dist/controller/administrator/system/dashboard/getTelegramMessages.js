"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegramMessageSchema_1 = __importDefault(require("../../../../models/telegram/telegramMessageSchema"));
const getTelegramMessages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const chatId = req.query.chatId;
        const direction = req.query.direction;
        const filter = {};
        if (chatId)
            filter.chatId = chatId;
        if (direction)
            filter.direction = direction;
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            telegramMessageSchema_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            telegramMessageSchema_1.default.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: messages,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("getTelegramMessages error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.default = getTelegramMessages;
