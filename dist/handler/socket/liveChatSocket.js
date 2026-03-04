"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chatTicketSchema_1 = __importDefault(require("../../models/chat/chatTicketSchema"));
const chatMessageSchema_1 = __importDefault(require("../../models/chat/chatMessageSchema"));
const TICKET_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours
/**
 * Live Chat socket namespace: /live-chat
 *
 * Guest events:
 *   - chat:join       { guestId, guestName? }        → joins room `ticket:<ticketId>`
 *   - chat:message    { guestId, text }               → sends message
 *
 * Admin events:
 *   - admin:join      { ticketId }                    → joins a ticket room
 *   - admin:message   { ticketId, text, senderName }  → sends reply
 *   - admin:close     { ticketId }                    → closes ticket
 *   - admin:joinAll                                   → joins "admins" room for notifications
 *
 * Server emits:
 *   - chat:message    { message }                     → to everyone in the ticket room
 *   - chat:ticket     { ticket }                      → to admins room when new ticket arrives
 *   - chat:closed     { ticketId }                    → to room when ticket is closed
 */
const setupLiveChatSocket = (io) => {
    const chatNs = io.of("/live-chat");
    chatNs.on("connection", (socket) => {
        // ─── Guest: join / create ticket ──────────────────────────
        socket.on("chat:join", async (data) => {
            try {
                const { guestId, guestName } = data;
                if (!guestId)
                    return;
                // Find existing open ticket or create new
                let ticket = await chatTicketSchema_1.default.findOne({ guestId, status: "open" });
                if (!ticket) {
                    ticket = await chatTicketSchema_1.default.create({
                        guestId,
                        guestName: guestName || "অতিথি",
                        expiresAt: new Date(Date.now() + TICKET_LIFETIME_MS),
                    });
                    // Notify admins about new ticket
                    chatNs.to("admins").emit("chat:ticket", { ticket });
                }
                const room = `ticket:${ticket._id}`;
                socket.join(room);
                socket.ticketId = ticket._id.toString();
                socket.guestId = guestId;
                // Send existing messages for this ticket
                const messages = await chatMessageSchema_1.default.find({ ticketId: ticket._id })
                    .sort({ createdAt: 1 })
                    .lean();
                socket.emit("chat:history", { ticketId: ticket._id, messages });
            }
            catch (err) {
                console.error("[LiveChat Socket] chat:join error:", err);
            }
        });
        // ─── Guest: send message ──────────────────────────────────
        socket.on("chat:message", async (data) => {
            try {
                const { guestId, text } = data;
                if (!guestId || !(text === null || text === void 0 ? void 0 : text.trim()))
                    return;
                const ticket = await chatTicketSchema_1.default.findOne({ guestId, status: "open" });
                if (!ticket)
                    return;
                const message = await chatMessageSchema_1.default.create({
                    ticketId: ticket._id,
                    senderType: "guest",
                    senderName: ticket.guestName || "অতিথি",
                    text: text.trim(),
                });
                ticket.lastMessageAt = new Date();
                await ticket.save();
                const room = `ticket:${ticket._id}`;
                chatNs.to(room).emit("chat:message", { message });
                // Also notify admins room with summary
                chatNs.to("admins").emit("chat:newMessage", {
                    ticketId: ticket._id,
                    guestName: ticket.guestName,
                    text: text.trim(),
                });
            }
            catch (err) {
                console.error("[LiveChat Socket] chat:message error:", err);
            }
        });
        // ─── Admin: join admins room (for notifications) ──────────
        socket.on("admin:joinAll", () => {
            socket.join("admins");
        });
        // ─── Admin: join a specific ticket room ───────────────────
        socket.on("admin:join", async (data) => {
            try {
                const { ticketId } = data;
                if (!ticketId)
                    return;
                const room = `ticket:${ticketId}`;
                socket.join(room);
                socket.ticketId = ticketId;
            }
            catch (err) {
                console.error("[LiveChat Socket] admin:join error:", err);
            }
        });
        // ─── Admin: send reply ────────────────────────────────────
        socket.on("admin:message", async (data) => {
            try {
                const { ticketId, text, senderName } = data;
                if (!ticketId || !(text === null || text === void 0 ? void 0 : text.trim()))
                    return;
                const ticket = await chatTicketSchema_1.default.findById(ticketId);
                if (!ticket || ticket.status === "closed")
                    return;
                const message = await chatMessageSchema_1.default.create({
                    ticketId: ticket._id,
                    senderType: "admin",
                    senderName: senderName || "Admin",
                    text: text.trim(),
                });
                ticket.lastMessageAt = new Date();
                await ticket.save();
                const room = `ticket:${ticketId}`;
                chatNs.to(room).emit("chat:message", { message });
            }
            catch (err) {
                console.error("[LiveChat Socket] admin:message error:", err);
            }
        });
        // ─── Admin: close ticket ──────────────────────────────────
        socket.on("admin:close", async (data) => {
            try {
                const { ticketId } = data;
                if (!ticketId)
                    return;
                await chatTicketSchema_1.default.findByIdAndUpdate(ticketId, { status: "closed" });
                const room = `ticket:${ticketId}`;
                chatNs.to(room).emit("chat:closed", { ticketId });
            }
            catch (err) {
                console.error("[LiveChat Socket] admin:close error:", err);
            }
        });
        socket.on("disconnect", () => {
            // cleanup handled by socket.io room management
        });
    });
};
exports.default = setupLiveChatSocket;
