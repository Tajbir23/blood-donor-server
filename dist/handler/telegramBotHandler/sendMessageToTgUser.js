"use strict";
/**
 * Telegram Bot – message sending helpers
 * Uses the Telegram Bot API via Axios (no extra library needed).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTgMessage = sendTgMessage;
exports.sendTgInlineKeyboard = sendTgInlineKeyboard;
exports.sendTgInlineKeyboardData = sendTgInlineKeyboardData;
exports.sendTgUrlButton = sendTgUrlButton;
exports.answerCallbackQuery = answerCallbackQuery;
exports.setTelegramWebhook = setTelegramWebhook;
const axios_1 = __importDefault(require("axios"));
/** Base URL for the bot's API calls */
const tgApi = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
/**
 * Send a plain text message.
 * Markdown parse_mode lets you use *bold*, _italic_, `code` etc.
 */
async function sendTgMessage(chatId, text) {
    var _a;
    try {
        await axios_1.default.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
        });
    }
    catch (err) {
        console.error("[TG] sendTgMessage error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
    }
}
/**
 * Send a message with an inline keyboard (quick-reply buttons).
 * @param rows  Array of rows; each row is an array of button labels.
 *              Each button's callback_data = the label itself.
 */
async function sendTgInlineKeyboard(chatId, text, rows) {
    var _a;
    try {
        const inline_keyboard = rows.map(row => row.map(label => ({ text: label, callback_data: label })));
        await axios_1.default.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard },
        });
    }
    catch (err) {
        console.error("[TG] sendTgInlineKeyboard error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
    }
}
/**
 * Send a message with an inline keyboard where button label and callback_data differ.
 * @param rows  Array of rows; each row is an array of { label, data } objects.
 */
async function sendTgInlineKeyboardData(chatId, text, rows) {
    var _a;
    try {
        const inline_keyboard = rows.map(row => row.map(btn => ({ text: btn.label, callback_data: btn.data })));
        await axios_1.default.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard },
        });
    }
    catch (err) {
        console.error("[TG] sendTgInlineKeyboardData error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
    }
}
/**
 * Send a message with a single URL button (opens a web page).
 */
async function sendTgUrlButton(chatId, text, buttonText, url) {
    var _a;
    try {
        await axios_1.default.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [[{ text: buttonText, url }]],
            },
        });
    }
    catch (err) {
        console.error("[TG] sendTgUrlButton error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
    }
}
/**
 * Acknowledge a callback query so Telegram removes the loading spinner.
 */
async function answerCallbackQuery(callbackQueryId, text) {
    var _a;
    try {
        await axios_1.default.post(`${tgApi()}/answerCallbackQuery`, {
            callback_query_id: callbackQueryId,
            text: text !== null && text !== void 0 ? text : "",
        });
    }
    catch (err) {
        console.error("[TG] answerCallbackQuery error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
    }
}
/**
 * Set (or update) the webhook URL so Telegram pushes updates to our server.
 */
async function setTelegramWebhook(webhookUrl) {
    var _a;
    try {
        const res = await axios_1.default.post(`${tgApi()}/setWebhook`, {
            url: webhookUrl,
            allowed_updates: ["message", "callback_query"],
            drop_pending_updates: true,
        });
        console.log("[TG] Webhook set:", res.data);
    }
    catch (err) {
        console.error("[TG] setWebhook error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
    }
}
