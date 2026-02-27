"use strict";
/**
 * Telegram Bot – message sending helpers
 * Uses the Telegram Bot API via Axios (no extra library needed).
 *
 * Every send function uses a typewriter effect:
 *   1. Sends "▌" immediately (so user sees something right away)
 *   2. Progressively edits the message word-by-word (80 ms per word)
 *   3. Final edit applies the full HTML text (with any reply_markup)
 * This produces a ChatGPT-like streaming/typewriter feel in every conversation.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTgTypingAction = sendTgTypingAction;
exports.sendTgMessage = sendTgMessage;
exports.sendTgInlineKeyboard = sendTgInlineKeyboard;
exports.sendTgInlineKeyboardData = sendTgInlineKeyboardData;
exports.sendTgUrlButton = sendTgUrlButton;
exports.answerCallbackQuery = answerCallbackQuery;
exports.setTelegramWebhook = setTelegramWebhook;
const axios_1 = __importDefault(require("axios"));
/** Base URL for the bot's API calls */
const tgApi = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
// ── Typewriter helpers ────────────────────────────────────────────────────────
const TYPEWRITER_INTERVAL_MS = 80; // ms between word frames
/** Strip HTML tags but KEEP newlines so animation preserves the message layout */
function stripHtml(html) {
    return html
        .replace(/<br\s*\/?>/gi, "\n") // <br> → newline
        .replace(/<\/p>/gi, "\n") // </p> → newline
        .replace(/<[^>]*>/g, "") // remove all remaining tags
        .replace(/[ \t]+/g, " ") // collapse only spaces/tabs (not \n)
        .trim();
}
/**
 * Typewriter animation — word by word (faster than letter-by-letter).
 *  1. Sends "▌" immediately
 *  2. Edits the message progressively, adding one word per frame
 *  3. Final edit: full HTML text + optional reply_markup
 */
async function typewrite(chatId, html, replyMarkup) {
    var _a, _b, _c, _d, _e;
    const plain = stripHtml(html);
    // Split on whitespace boundaries while keeping the delimiter (space / newline)
    // so reconstruction preserves original spacing and line breaks.
    const tokens = plain.split(/(\s+)/); // ["word", " ", "word", "\n", "word", ...]
    // ── send initial cursor ────────────────────────────────────────────────
    let messageId = null;
    try {
        const resp = await axios_1.default.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text: "▌",
        });
        messageId = (_c = (_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.message_id) !== null && _c !== void 0 ? _c : null;
    }
    catch (err) {
        console.error("[TG typewriter] initial send error:", ((_d = err.response) === null || _d === void 0 ? void 0 : _d.data) || err.message);
        return;
    }
    if (!messageId)
        return;
    // ── animate: one word (+ its following whitespace) per frame ──────────
    if (tokens.length > 1) {
        // Build word-boundary indices: only stop after non-whitespace tokens
        const wordEnds = [];
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].trim().length > 0)
                wordEnds.push(i);
        }
        for (const idx of wordEnds) {
            await new Promise(r => setTimeout(r, TYPEWRITER_INTERVAL_MS));
            const partial = tokens.slice(0, idx + 1).join("") + "▌";
            try {
                await axios_1.default.post(`${tgApi()}/editMessageText`, {
                    chat_id: chatId,
                    message_id: messageId,
                    text: partial,
                });
            }
            catch ( /* swallow rate-limit / unchanged-text errors */_f) { /* swallow rate-limit / unchanged-text errors */ }
        }
    }
    // ── final edit: full HTML + optional keyboard ───────────────────────────
    await new Promise(r => setTimeout(r, TYPEWRITER_INTERVAL_MS));
    try {
        await axios_1.default.post(`${tgApi()}/editMessageText`, {
            chat_id: chatId,
            message_id: messageId,
            text: html,
            parse_mode: "HTML",
            ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
        });
    }
    catch (err) {
        console.error("[TG typewriter] final edit error:", ((_e = err.response) === null || _e === void 0 ? void 0 : _e.data) || err.message);
    }
}
/** Send Telegram "typing…" chat action (best-effort, used only for keyboard-less sends). */
async function sendTgTypingAction(chatId) {
    try {
        await axios_1.default.post(`${tgApi()}/sendChatAction`, {
            chat_id: chatId,
            action: "typing",
        });
    }
    catch ( /* ignore */_a) { /* ignore */ }
}
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Send a plain text (or HTML) message with typewriter animation.
 */
async function sendTgMessage(chatId, text) {
    await typewrite(chatId, text);
}
/**
 * Send a message with an inline keyboard (quick-reply buttons).
 * @param rows  Array of rows; each row is an array of button labels.
 *              Each button's callback_data = the label itself.
 */
async function sendTgInlineKeyboard(chatId, text, rows) {
    const inline_keyboard = rows.map(row => row.map(label => ({ text: label, callback_data: label })));
    await typewrite(chatId, text, { inline_keyboard });
}
/**
 * Send a message with an inline keyboard where button label and callback_data differ.
 * @param rows  Array of rows; each row is an array of { label, data } objects.
 */
async function sendTgInlineKeyboardData(chatId, text, rows) {
    const inline_keyboard = rows.map(row => row.map(btn => ({ text: btn.label, callback_data: btn.data })));
    await typewrite(chatId, text, { inline_keyboard });
}
/**
 * Send a message with a single URL button (opens a web page).
 */
async function sendTgUrlButton(chatId, text, buttonText, url) {
    await typewrite(chatId, text, {
        inline_keyboard: [[{ text: buttonText, url }]],
    });
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
