import { Request, Response } from "express";
import TelegramMessage from "../../../../models/telegram/telegramMessageSchema";

const getTelegramMessages = async (req: Request, res: Response) => {
    try {
        const page      = parseInt(req.query.page as string) || 1;
        const limit     = parseInt(req.query.limit as string) || 20;
        const chatId    = req.query.chatId as string | undefined;
        const direction = req.query.direction as string | undefined;

        const filter: Record<string, unknown> = {};
        if (chatId)    filter.chatId    = chatId;
        if (direction) filter.direction = direction;

        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            TelegramMessage.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            TelegramMessage.countDocuments(filter),
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
    } catch (error) {
        console.error("getTelegramMessages error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default getTelegramMessages;
