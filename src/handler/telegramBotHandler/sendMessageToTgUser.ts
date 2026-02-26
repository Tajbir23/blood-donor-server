/**
 * Telegram Bot – message sending helpers
 * Uses the Telegram Bot API via Axios (no extra library needed).
 *
 * Every send function uses a typewriter effect:
 *   1. Sends "▌" immediately (so user sees something right away)
 *   2. Progressively edits the message word-by-word (up to 15 frames, 120 ms apart)
 *   3. Final edit applies the full HTML text (with any reply_markup)
 * This produces a ChatGPT-like streaming/typewriter feel in every conversation.
 */

import axios from "axios";

/** Base URL for the bot's API calls */
const tgApi = () =>
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// ── Typewriter helpers ────────────────────────────────────────────────────────

const TYPEWRITER_MAX_FRAMES = 15;
const TYPEWRITER_INTERVAL_MS = 120;

/** Strip HTML tags to get plain text for animation frames */
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Typewriter animation:
 *  - Sends "▌" as the initial message
 *  - Edits word-by-word (max 15 frames, 120 ms each)
 *  - Final edit: full HTML + optional reply_markup
 * Returns the message_id of the sent message (useful for attaching keyboards).
 */
async function typewrite(
    chatId: string,
    html: string,
    replyMarkup?: object
): Promise<void> {
    const plain = stripHtml(html);
    const words = plain.split(/\s+/).filter(w => w.length > 0);

    // ── send initial cursor ────────────────────────────────────────────────
    let messageId: number | null = null;
    try {
        const resp = await axios.post(`${tgApi()}/sendMessage`, {
            chat_id: chatId,
            text: "▌",
        });
        messageId = (resp.data as { result: { message_id: number } })?.result?.message_id ?? null;
    } catch (err: any) {
        console.error("[TG typewriter] initial send error:", err.response?.data || err.message);
        return;
    }

    if (!messageId) return;

    // ── animate frames ─────────────────────────────────────────────────────
    if (words.length > 1) {
        const frames = Math.min(TYPEWRITER_MAX_FRAMES, words.length - 1);
        const chunk = Math.ceil(words.length / (frames + 1));

        for (let i = chunk; i < words.length; i += chunk) {
            await new Promise(r => setTimeout(r, TYPEWRITER_INTERVAL_MS));
            const partial = words.slice(0, i).join(" ") + " ▌";
            try {
                await axios.post(`${tgApi()}/editMessageText`, {
                    chat_id: chatId,
                    message_id: messageId,
                    text: partial,
                });
            } catch { /* swallow rate-limit / unchanged-text errors */ }
        }
    }

    // ── final edit: full HTML + optional keyboard ───────────────────────────
    await new Promise(r => setTimeout(r, TYPEWRITER_INTERVAL_MS));
    try {
        await axios.post(`${tgApi()}/editMessageText`, {
            chat_id: chatId,
            message_id: messageId,
            text: html,
            parse_mode: "HTML",
            ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
        });
    } catch (err: any) {
        console.error("[TG typewriter] final edit error:", err.response?.data || err.message);
    }
}

/** Send Telegram "typing…" chat action (best-effort, used only for keyboard-less sends). */
export async function sendTgTypingAction(chatId: string): Promise<void> {
    try {
        await axios.post(`${tgApi()}/sendChatAction`, {
            chat_id: chatId,
            action: "typing",
        });
    } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a plain text (or HTML) message with typewriter animation.
 */
export async function sendTgMessage(chatId: string, text: string): Promise<void> {
    await typewrite(chatId, text);
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
    const inline_keyboard = rows.map(row =>
        row.map(label => ({ text: label, callback_data: label }))
    );
    await typewrite(chatId, text, { inline_keyboard });
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
    const inline_keyboard = rows.map(row =>
        row.map(btn => ({ text: btn.label, callback_data: btn.data }))
    );
    await typewrite(chatId, text, { inline_keyboard });
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
    await typewrite(chatId, text, {
        inline_keyboard: [[{ text: buttonText, url }]],
    });
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


