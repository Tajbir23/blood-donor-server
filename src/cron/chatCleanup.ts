import cron from "node-cron";
import ChatTicket from "../models/chat/chatTicketSchema";
import ChatMessage from "../models/chat/chatMessageSchema";

/**
 * Chat Cleanup Cron
 * 
 * প্রতি ঘণ্টায় চলে:
 * 1. Expired tickets (TTL দিয়েও হ্যান্ডেল হয়, কিন্তু extra safety)
 * 2. 24 ঘণ্টা পুরোনো closed tickets এর messages delete করে
 * 3. Message-less open tickets (30 min old) cleanup
 */
const scheduleChatCleanup = () => {
    // Run every hour at minute 15
    cron.schedule("15 * * * *", async () => {
        try {
            console.log("[ChatCleanup] Starting cleanup...");

            const now = new Date();

            // 1. Delete expired tickets and their messages
            const expiredTickets = await ChatTicket.find({
                expiresAt: { $lte: now },
            }).select("_id");

            if (expiredTickets.length > 0) {
                const expiredIds = expiredTickets.map((t) => t._id);
                await ChatMessage.deleteMany({ ticketId: { $in: expiredIds } });
                await ChatTicket.deleteMany({ _id: { $in: expiredIds } });
                console.log(
                    `[ChatCleanup] Removed ${expiredTickets.length} expired tickets`
                );
            }

            // 2. Delete messages for tickets closed > 2 hours ago
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            const oldClosedTickets = await ChatTicket.find({
                status: "closed",
                updatedAt: { $lte: twoHoursAgo },
            }).select("_id");

            if (oldClosedTickets.length > 0) {
                const closedIds = oldClosedTickets.map((t) => t._id);
                await ChatMessage.deleteMany({ ticketId: { $in: closedIds } });
                await ChatTicket.deleteMany({ _id: { $in: closedIds } });
                console.log(
                    `[ChatCleanup] Cleaned ${oldClosedTickets.length} old closed tickets`
                );
            }

            // 3. Remove open tickets older than 30 min with no messages
            const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
            const emptyTickets = await ChatTicket.find({
                status: "open",
                createdAt: { $lte: thirtyMinAgo },
            }).select("_id");

            for (const ticket of emptyTickets) {
                const msgCount = await ChatMessage.countDocuments({
                    ticketId: ticket._id,
                });
                if (msgCount === 0) {
                    await ChatTicket.findByIdAndDelete(ticket._id);
                }
            }

            console.log("[ChatCleanup] Cleanup done ✓");
        } catch (err) {
            console.error("[ChatCleanup] Error:", err);
        }
    });
};

export default scheduleChatCleanup;
