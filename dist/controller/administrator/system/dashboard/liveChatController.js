"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeTicket = exports.getMessages = exports.getTickets = void 0;
const chatTicketSchema_1 = __importDefault(require("../../../../models/chat/chatTicketSchema"));
const chatMessageSchema_1 = __importDefault(require("../../../../models/chat/chatMessageSchema"));
/**
 * GET /api/system/dashboard/live-chat/tickets
 * Admin/moderator দের জন্য সব open tickets দেখায়
 */
const getTickets = async (req, res) => {
    try {
        const { status = "open", page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (status !== "all")
            filter.status = status;
        const [tickets, total] = await Promise.all([
            chatTicketSchema_1.default.find(filter)
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            chatTicketSchema_1.default.countDocuments(filter),
        ]);
        // প্রতিটি ticket এর last message আনো
        const ticketIds = tickets.map((t) => t._id);
        const lastMessages = await chatMessageSchema_1.default.aggregate([
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
        const lastMsgMap = new Map(lastMessages.map((m) => [m._id.toString(), m]));
        const enrichedTickets = tickets.map((t) => {
            var _a, _b;
            const lm = lastMsgMap.get(t._id.toString());
            return {
                ...t,
                lastMessage: (_a = lm === null || lm === void 0 ? void 0 : lm.lastMessage) !== null && _a !== void 0 ? _a : null,
                lastSender: (_b = lm === null || lm === void 0 ? void 0 : lm.lastSender) !== null && _b !== void 0 ? _b : null,
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
    }
    catch (error) {
        console.error("[LiveChat] getTickets error:", error);
        res.status(500).json({ success: false, message: "সার্ভার ত্রুটি" });
    }
};
exports.getTickets = getTickets;
/**
 * GET /api/system/dashboard/live-chat/messages/:ticketId
 * একটি ticket এর সব messages
 */
const getMessages = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const messages = await chatMessageSchema_1.default.find({ ticketId })
            .sort({ createdAt: 1 })
            .lean();
        res.json({ success: true, data: messages });
    }
    catch (error) {
        console.error("[LiveChat] getMessages error:", error);
        res.status(500).json({ success: false, message: "সার্ভার ত্রুটি" });
    }
};
exports.getMessages = getMessages;
/**
 * POST /api/system/dashboard/live-chat/close/:ticketId
 * Ticket close করো
 */
const closeTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        await chatTicketSchema_1.default.findByIdAndUpdate(ticketId, { status: "closed" });
        res.json({ success: true, message: "টিকেট বন্ধ করা হয়েছে" });
    }
    catch (error) {
        console.error("[LiveChat] closeTicket error:", error);
        res.status(500).json({ success: false, message: "সার্ভার ত্রুটি" });
    }
};
exports.closeTicket = closeTicket;
