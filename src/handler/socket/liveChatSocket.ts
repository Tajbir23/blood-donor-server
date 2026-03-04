import { Server, Socket } from "socket.io";
import ChatTicket from "../../models/chat/chatTicketSchema";
import ChatMessage from "../../models/chat/chatMessageSchema";

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
const setupLiveChatSocket = (io: Server) => {
    const chatNs = io.of("/live-chat");

    chatNs.on("connection", (socket: Socket) => {
        // ─── Guest: join / create ticket ──────────────────────────
        socket.on("chat:join", async (data: { guestId: string; guestName?: string }) => {
            try {
                const { guestId, guestName } = data;
                if (!guestId) return;

                // Find existing open ticket or create new
                let ticket = await ChatTicket.findOne({ guestId, status: "open" });

                if (!ticket) {
                    ticket = await ChatTicket.create({
                        guestId,
                        guestName: guestName || "অতিথি",
                        expiresAt: new Date(Date.now() + TICKET_LIFETIME_MS),
                    });
                    // Notify admins about new ticket
                    chatNs.to("admins").emit("chat:ticket", { ticket });
                }

                const room = `ticket:${ticket._id}`;
                socket.join(room);
                (socket as any).ticketId = ticket._id.toString();
                (socket as any).guestId = guestId;

                // Send existing messages for this ticket
                const messages = await ChatMessage.find({ ticketId: ticket._id })
                    .sort({ createdAt: 1 })
                    .lean();

                socket.emit("chat:history", { ticketId: ticket._id, messages });
            } catch (err) {
                console.error("[LiveChat Socket] chat:join error:", err);
            }
        });

        // ─── Guest: send message ──────────────────────────────────
        socket.on("chat:message", async (data: { guestId: string; text: string }) => {
            try {
                const { guestId, text } = data;
                if (!guestId || !text?.trim()) return;

                const ticket = await ChatTicket.findOne({ guestId, status: "open" });
                if (!ticket) return;

                const message = await ChatMessage.create({
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
            } catch (err) {
                console.error("[LiveChat Socket] chat:message error:", err);
            }
        });

        // ─── Admin: join admins room (for notifications) ──────────
        socket.on("admin:joinAll", () => {
            socket.join("admins");
        });

        // ─── Admin: join a specific ticket room ───────────────────
        socket.on("admin:join", async (data: { ticketId: string }) => {
            try {
                const { ticketId } = data;
                if (!ticketId) return;
                const room = `ticket:${ticketId}`;
                socket.join(room);
                (socket as any).ticketId = ticketId;
            } catch (err) {
                console.error("[LiveChat Socket] admin:join error:", err);
            }
        });

        // ─── Admin: send reply ────────────────────────────────────
        socket.on("admin:message", async (data: { ticketId: string; text: string; senderName: string }) => {
            try {
                const { ticketId, text, senderName } = data;
                if (!ticketId || !text?.trim()) return;

                const ticket = await ChatTicket.findById(ticketId);
                if (!ticket || ticket.status === "closed") return;

                const message = await ChatMessage.create({
                    ticketId: ticket._id,
                    senderType: "admin",
                    senderName: senderName || "Admin",
                    text: text.trim(),
                });

                ticket.lastMessageAt = new Date();
                await ticket.save();

                const room = `ticket:${ticketId}`;
                chatNs.to(room).emit("chat:message", { message });
            } catch (err) {
                console.error("[LiveChat Socket] admin:message error:", err);
            }
        });

        // ─── Admin: close ticket ──────────────────────────────────
        socket.on("admin:close", async (data: { ticketId: string }) => {
            try {
                const { ticketId } = data;
                if (!ticketId) return;

                await ChatTicket.findByIdAndUpdate(ticketId, { status: "closed" });

                const room = `ticket:${ticketId}`;
                chatNs.to(room).emit("chat:closed", { ticketId });
            } catch (err) {
                console.error("[LiveChat Socket] admin:close error:", err);
            }
        });

        socket.on("disconnect", () => {
            // cleanup handled by socket.io room management
        });
    });
};

export default setupLiveChatSocket;
