/**
 * Telegram Bot – message sending helpers
 * Uses the Telegram Bot API via Axios (no extra library needed).
 */

import axios from "axios";

/** Base URL for the bot's API calls */
const tgApi = () =>
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

/**
 * Send a plain text message.
 * Markdown parse_mode lets you use *bold*, _italic_, `code` etc.
 */
export async function sendTgMessage(chatId: string, text: string): Promise<void> {
    try {
        await axios.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
        });
    } catch (err: any) {
        console.error("[TG] sendTgMessage error:", err.response?.data || err.message);
    }
}

/**
 * Send a message with an inline keyboard (quick-reply buttons).
 * @param rows  Array of rows; each row is an array of button labels.
 *              Each button's callback_data = the label itself.
 */
export async function sendTgInlineKeyboard(
    chatId: string,
    text: string,
    rows: string[][]
): Promise<void> {
    try {
        const inline_keyboard = rows.map(row =>
            row.map(label => ({ text: label, callback_data: label }))
        );
        await axios.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard },
        });
    } catch (err: any) {
        console.error("[TG] sendTgInlineKeyboard error:", err.response?.data || err.message);
    }
}

/**
 * Send a message with an inline keyboard where button label and callback_data differ.
 * @param rows  Array of rows; each row is an array of { label, data } objects.
 */
export async function sendTgInlineKeyboardData(
    chatId: string,
    text: string,
    rows: { label: string; data: string }[][]
): Promise<void> {
    try {
        const inline_keyboard = rows.map(row =>
            row.map(btn => ({ text: btn.label, callback_data: btn.data }))
        );
        await axios.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard },
        });
    } catch (err: any) {
        console.error("[TG] sendTgInlineKeyboardData error:", err.response?.data || err.message);
    }
}

/**
 * Send a message with a single URL button (opens a web page).
 */
export async function sendTgUrlButton(
    chatId: string,
    text: string,
    buttonText: string,
    url: string
): Promise<void> {
    try {
        await axios.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [[{ text: buttonText, url }]],
            },
        });
    } catch (err: any) {
        console.error("[TG] sendTgUrlButton error:", err.response?.data || err.message);
    }
}

/**
 * Acknowledge a callback query so Telegram removes the loading spinner.
 */
export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    try {
        await axios.post(`${tgApi()}/answerCallbackQuery`, {
            callback_query_id: callbackQueryId,
            text: text ?? "",
        });
    } catch (err: any) {
        console.error("[TG] answerCallbackQuery error:", err.response?.data || err.message);
    }
}

/**
 * Set (or update) the webhook URL so Telegram pushes updates to our server.
 */
export async function setTelegramWebhook(webhookUrl: string): Promise<void> {
    try {
        const res = await axios.post(`${tgApi()}/setWebhook`, {
            url: webhookUrl,
            allowed_updates: ["message", "callback_query"],
            drop_pending_updates: true,
        });
        console.log("[TG] Webhook set:", res.data);
    } catch (err: any) {
        console.error("[TG] setWebhook error:", err.response?.data || err.message);
    }
}
