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

import axios from "axios";

/** Base URL for the bot's API calls */
const tgApi = () =>
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// ── Typewriter helpers ────────────────────────────────────────────────────────

const TYPEWRITER_INTERVAL_MS = 300;   // ms between animation frames
const MAX_ANIMATION_FRAMES   = 8;     // cap total edits to stay under TG rate limit

/** Strip HTML tags but KEEP newlines so animation preserves the message layout */
function stripHtml(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, "\n")      // <br> → newline
        .replace(/<\/p>/gi, "\n")           // </p> → newline
        .replace(/<[^>]*>/g, "")            // remove all remaining tags
        .replace(/[ \t]+/g, " ")            // collapse only spaces/tabs (not \n)
        .trim();
}

/** Edit a message, retrying once if Telegram returns 429 (rate-limit). */
async function editWithRetry(
    chatId: string,
    messageId: number,
    payload: object,
    label = "edit"
): Promise<void> {
    try {
        await axios.post(`${tgApi()}/editMessageText`, { chat_id: chatId, message_id: messageId, ...payload });
    } catch (err: any) {
        const data = err.response?.data;
        if (data?.error_code === 429) {
            const wait = ((data.parameters?.retry_after ?? 5) + 1) * 1000;
            console.warn(`[TG typewriter] 429 on ${label} — retrying after ${wait}ms`);
            await new Promise(r => setTimeout(r, wait));
            try {
                await axios.post(`${tgApi()}/editMessageText`, { chat_id: chatId, message_id: messageId, ...payload });
            } catch (e2: any) {
                console.error(`[TG typewriter] ${label} retry failed:`, e2.response?.data || e2.message);
            }
        }
        // swallow other errors (unchanged text, etc.)
    }
}

/**
 * Typewriter animation — batched word-by-word.
 *  1. Sends "▌" immediately
 *  2. Edits the message progressively (up to MAX_ANIMATION_FRAMES frames, 300 ms apart)
 *  3. Final edit: full HTML + optional reply_markup, with 429-retry
 */
async function typewrite(
    chatId: string,
    html: string,
    replyMarkup?: object
): Promise<void> {
    const plain = stripHtml(html);
    const tokens = plain.split(/(\s+)/);   // ["word", " ", "word", "\n", ...]

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

    // ── build word-boundary indices ────────────────────────────────────────
    const wordEnds: number[] = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].trim().length > 0) wordEnds.push(i);
    }

    if (wordEnds.length > 1) {
        // Pick up to MAX_ANIMATION_FRAMES evenly-spaced checkpoints (skip the last
        // word — the final HTML edit already shows the full text).
        const checkpoints = pickCheckpoints(wordEnds.slice(0, -1), MAX_ANIMATION_FRAMES);

        for (const idx of checkpoints) {
            await new Promise(r => setTimeout(r, TYPEWRITER_INTERVAL_MS));
            const partial = tokens.slice(0, idx + 1).join("") + "▌";
            await editWithRetry(chatId, messageId, { text: partial }, "animation");
        }
    }

    // ── final edit: full HTML + optional keyboard ───────────────────────────
    await new Promise(r => setTimeout(r, TYPEWRITER_INTERVAL_MS));
    await editWithRetry(chatId, messageId, {
        text: html,
        parse_mode: "HTML",
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    }, "final");
}

/** Select up to `max` evenly-distributed items from an array. */
function pickCheckpoints<T>(arr: T[], max: number): T[] {
    if (arr.length <= max) return arr;
    const result: T[] = [];
    for (let i = 0; i < max; i++) {
        const idx = Math.round((i / (max - 1)) * (arr.length - 1));
        result.push(arr[idx]);
    }
    return result;
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


