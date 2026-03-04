import { Request, Response } from "express";
import ChatTicket from "../../../../models/chat/chatTicketSchema";
import ChatMessage from "../../../../models/chat/chatMessageSchema";

/**
 * GET /api/system/dashboard/live-chat/tickets
 * Admin/moderator দের জন্য সব open tickets দেখায়
 */
export const getTickets = async (req: Request, res: Response) => {
    try {
        const { status = "open", page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter: any = {};
        if (status !== "all") filter.status = status;

        const [tickets, total] = await Promise.all([
            ChatTicket.find(filter)
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            ChatTicket.countDocuments(filter),
        ]);

        // প্রতিটি ticket এর last message আনো
        const ticketIds = tickets.map((t) => t._id);
        const lastMessages = await ChatMessage.aggregate([
            { $match: { ticketId: { $in: ticketIds } } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$ticketId",
                    lastMessage: { $first: "$text" },
                    lastSender: { $first: "$senderType" },
                    lastTime: { $first: "$createdAt" },
                },
            },
        ]);

        const lastMsgMap = new Map(
            lastMessages.map((m) => [m._id.toString(), m])
        );

        const enrichedTickets = tickets.map((t) => {
            const lm = lastMsgMap.get(t._id.toString());
            return {
                ...t,
                lastMessage: lm?.lastMessage ?? null,
                lastSender: lm?.lastSender ?? null,
            };
        });

        res.json({
            success: true,
            data: enrichedTickets,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error("[LiveChat] getTickets error:", error);
        res.status(500).json({ success: false, message: "সার্ভার ত্রুটি" });
    }
};

/**
 * GET /api/system/dashboard/live-chat/messages/:ticketId
 * একটি ticket এর সব messages
 */
export const getMessages = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;

        const messages = await ChatMessage.find({ ticketId })
            .sort({ createdAt: 1 })
            .lean();

        res.json({ success: true, data: messages });
    } catch (error: any) {
        console.error("[LiveChat] getMessages error:", error);
        res.status(500).json({ success: false, message: "সার্ভার ত্রুটি" });
    }
};

/**
 * POST /api/system/dashboard/live-chat/close/:ticketId
 * Ticket close করো
 */
export const closeTicket = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;

        await ChatTicket.findByIdAndUpdate(ticketId, { status: "closed" });

        res.json({ success: true, message: "টিকেট বন্ধ করা হয়েছে" });
    } catch (error: any) {
        console.error("[LiveChat] closeTicket error:", error);
        res.status(500).json({ success: false, message: "সার্ভার ত্রুটি" });
    }
};
