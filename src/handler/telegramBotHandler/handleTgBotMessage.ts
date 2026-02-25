/**
 * Main Telegram Bot Message Handler
 * Routes incoming messages and callback queries to the appropriate handler.
 */

import { sendTgMessage, sendTgInlineKeyboard, sendTgUrlButton } from "./sendMessageToTgUser";
import { handleTgAiMessage, clearTgAiState } from "./telegramAiConversationHandler";
import {
    isInTgRegistration,
    handleTgRegisterText,
    handleTgRegisterCallback,
    startTgRegistration,
    clearTgRegistration,
} from "./telegramRegisterHandler";

const MAIN_MENU_ROWS = [
    ["🔍 রক্তদাতা খুঁজুন", "📝 ডোনার নিবন্ধন"],
    ["❓ সাহায্য", "🌐 ওয়েবসাইট"],
];

const showMainMenu = async (chatId: string, greeting?: string) => {
    await sendTgInlineKeyboard(
        chatId,
        greeting ?? "নিচের মেনু থেকে বেছে নিন বা সরাসরি বাংলা/ইংরেজিতে লিখুন:",
        MAIN_MENU_ROWS
    );
};

/**
 * Handle a regular text message (or /command).
 */
export const handleTgTextMessage = async (
    chatId: string,
    text: string,
    username?: string,
    firstName?: string
): Promise<void> => {
    const trimmed = text.trim();

    // ── If user is in registration flow, route text there first ───────────────
    if (isInTgRegistration(chatId)) {
        await handleTgRegisterText(chatId, trimmed);
        return;
    }

    // ── /start command ─────────────────────────────────────────────────────────
    if (trimmed === "/start") {
        clearTgAiState(chatId);
        clearTgRegistration(chatId);
        await sendTgMessage(
            chatId,
            "👋 <b>আস্সালামু আলাইকুম!</b> আমি <b>LifeDrop Bot</b> 🩸\n\n" +
            "বাংলা বা ইংরেজিতে সরাসরি লিখুন:\n" +
            "<i>\"A+ রক্ত দরকার ঢাকায়\"</i>\n" +
            "<i>\"রক্তদানের বয়স কত?\"</i>\n" +
            "<i>\"I need O+ blood in Chittagong urgently\"</i>\n\n" +
            "অথবা নিচের মেনু ব্যবহার করুন 👇"
        );
        await showMainMenu(chatId);
        return;
    }

    // ── /help command ──────────────────────────────────────────────────────────
    if (trimmed === "/help") {
        await handleTgAiMessage(chatId, "help");
        return;
    }

    // ── AI natural-language handler ────────────────────────────────────────────
    await handleTgAiMessage(chatId, trimmed);
};

/**
 * Handle a callback query (inline keyboard button press).
 * callback_data = the button label we set when building the keyboard.
 */
export const handleTgCallbackQuery = async (
    chatId: string,
    data: string,
    username?: string,
    firstName?: string
): Promise<void> => {
    const d = data.trim();

    // ── Registration flow callbacks ────────────────────────────────────────────
    if (isInTgRegistration(chatId)) {
        const handled = await handleTgRegisterCallback(chatId, d);
        if (handled) return;
        // If not handled by registration (e.g. main menu buttons pressed mid-flow), fall through
    }

    // Check for registration-prefixed callbacks even if not yet in registration
    if (d.startsWith("REG_")) {
        const handled = await handleTgRegisterCallback(chatId, d);
        if (handled) return;
    }

    // ── Main menu buttons ──────────────────────────────────────────────────────
    if (d === "🔍 রক্তদাতা খুঁজুন") {
        clearTgAiState(chatId);
        clearTgRegistration(chatId);
        await handleTgAiMessage(chatId, "রক্তদাতা খুঁজতে চাই");
        return;
    }

    if (d === "📝 ডোনার নিবন্ধন") {
        clearTgAiState(chatId);
        clearTgRegistration(chatId);
        await startTgRegistration(chatId, username, firstName);
        return;
    }

    if (d === "❓ সাহায্য") {
        await handleTgAiMessage(chatId, "help");
        return;
    }

    if (d === "🌐 ওয়েবসাইট") {
        await sendTgUrlButton(
            chatId,
            "LifeDrop বাংলাদেশ ওয়েবসাইট:",
            "ওয়েবসাইটে যান →",
            process.env.FRONTEND_URL!
        );
        return;
    }

    // ── Blood group selection (from AI flow inline keyboard) ───────────────────
    const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (bloodGroups.includes(d)) {
        await handleTgAiMessage(chatId, d);
        return;
    }

    // ── Any other callback: treat as natural-language text ─────────────────────
    await handleTgAiMessage(chatId, d);
};
