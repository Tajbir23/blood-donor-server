"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegramUserSchema_1 = __importDefault(require("../../../../models/telegram/telegramUserSchema"));
const sendMessageToTgUser_1 = require("../../../../handler/telegramBotHandler/sendMessageToTgUser");
const getTgBroadcastCount_1 = require("./getTgBroadcastCount");
const BATCH_SIZE = 20; // users per batch
const BATCH_DELAY_MS = 1000; // pause between batches (Telegram rate limit)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * POST /system/dashboard/tg-broadcast
 * Body:
 *   message          – string (HTML allowed)
 *   bloodGroup       – comma‑separated (optional)
 *   divisionId       – (optional)
 *   districtId       – (optional)
 *   thanaId          – (optional)
 *   lastDonationFrom – ISO date (optional)
 *   lastDonationTo   – ISO date (optional)
 *   neverDonated     – boolean (optional)
 *   registeredFrom   – ISO date (optional)
 *   registeredTo     – ISO date (optional)
 *
 * Returns immediately with estimated count; messages are sent in the background.
 */
const sendTgBroadcast = async (req, res) => {
    try {
        const { message, ...rawFilters } = req.body;
        if (!message || !message.trim()) {
            res.status(400).json({ success: false, message: "message is required" });
            return;
        }
        const filter = (0, getTgBroadcastCount_1.buildFilter)(rawFilters);
        const users = await telegramUserSchema_1.default.find(filter, { chatId: 1 }).lean();
        if (!users.length) {
            res.status(200).json({ success: true, sent: 0, message: "No users match the given filters." });
            return;
        }
        // Respond immediately; broadcast runs in background
        res.status(200).json({
            success: true,
            total: users.length,
            message: `Broadcasting to ${users.length} users started in background.`,
        });
        // Background send (fire-and-forget)
        (async () => {
            let sent = 0;
            for (let i = 0; i < users.length; i += BATCH_SIZE) {
                const batch = users.slice(i, i + BATCH_SIZE);
                await Promise.allSettled(batch.map(u => (0, sendMessageToTgUser_1.sendTgMessage)(u.chatId, message)));
                sent += batch.length;
                console.log(`[TG Broadcast] Sent ${sent}/${users.length}`);
                if (i + BATCH_SIZE < users.length) {
                    await sleep(BATCH_DELAY_MS);
                }
            }
            console.log(`[TG Broadcast] Completed. Total sent: ${sent}`);
        })();
    }
    catch (error) {
        console.error("sendTgBroadcast error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.default = sendTgBroadcast;
