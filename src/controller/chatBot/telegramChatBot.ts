import { Request, Response } from "express";
import { handleTgTextMessage, handleTgCallbackQuery } from "../../handler/telegramBotHandler/handleTgBotMessage";
import { answerCallbackQuery } from "../../handler/telegramBotHandler/sendMessageToTgUser";
import TelegramMessage from "../../models/telegram/telegramMessageSchema";

const telegramChatBot = async (req: Request, res: Response) => {
    // Always respond 200 immediately so Telegram doesn't retry
    res.sendStatus(200);

    try {
        const update = req.body;
        if (!update) return;

        // ── Inline keyboard button press ──────────────────────────────────────
        if (update.callback_query) {
            const cq     = update.callback_query;
            const chatId = String(cq.message?.chat?.id);
            const data   = cq.data ?? "";

            if (!chatId || chatId === "undefined") return;

            // Save to DB
            await TelegramMessage.create({
                chatId,
                username:  cq.from?.username  ?? null,
                firstName: cq.from?.first_name ?? null,
                callbackData: data,
                direction: "incoming",
                rawPayload: cq,
            });

            await answerCallbackQuery(cq.id);
            await handleTgCallbackQuery(chatId, data, cq.from?.username ?? undefined, cq.from?.first_name ?? undefined);
            return;
        }

        // ── Regular message (text / command) ──────────────────────────────────
        if (update.message) {
            const msg    = update.message;
            const chatId = String(msg.chat?.id);
            const text   = msg.text ?? "";

            if (!chatId || chatId === "undefined" || !text) return;
            // Save to DB
            await TelegramMessage.create({
                chatId,
                username:    msg.from?.username   ?? null,
                firstName:   msg.from?.first_name ?? null,
                messageText: text,
                direction:   "incoming",
                rawPayload:  msg,
            });
            await handleTgTextMessage(chatId, text, msg.from?.username ?? undefined, msg.from?.first_name ?? undefined);
        }
    } catch (err) {
        console.error("[TG] Webhook processing error:", err);
    }
};

export default telegramChatBot;
