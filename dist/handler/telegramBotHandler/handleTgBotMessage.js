"use strict";
/**
 * Main Telegram Bot Message Handler
 * Routes incoming messages and callback queries to the appropriate handler.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTgCallbackQuery = exports.handleTgTextMessage = void 0;
const sendMessageToTgUser_1 = require("./sendMessageToTgUser");
const telegramAiConversationHandler_1 = require("./telegramAiConversationHandler");
const telegramRegisterHandler_1 = require("./telegramRegisterHandler");
const MAIN_MENU_ROWS = [
    ["🔍 রক্তদাতা খুঁজুন", "📝 ডোনার নিবন্ধন"],
    ["❓ সাহায্য", "🌐 ওয়েবসাইট"],
];
const showMainMenu = async (chatId, greeting) => {
    await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, greeting !== null && greeting !== void 0 ? greeting : "নিচের মেনু থেকে বেছে নিন বা সরাসরি বাংলা/ইংরেজিতে লিখুন:", MAIN_MENU_ROWS);
};
/**
 * Handle a regular text message (or /command).
 */
const handleTgTextMessage = async (chatId, text, username, firstName) => {
    const trimmed = text.trim();
    // ── If user is in registration flow, route text there first ───────────────
    if ((0, telegramRegisterHandler_1.isInTgRegistration)(chatId)) {
        await (0, telegramRegisterHandler_1.handleTgRegisterText)(chatId, trimmed);
        return;
    }
    // ── /start command ─────────────────────────────────────────────────────────
    if (trimmed === "/start") {
        (0, telegramAiConversationHandler_1.clearTgAiState)(chatId);
        (0, telegramRegisterHandler_1.clearTgRegistration)(chatId);
        await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "👋 <b>আস্সালামু আলাইকুম!</b> আমি <b>LifeDrop Bot</b> 🩸\n\n" +
            "বাংলা বা ইংরেজিতে সরাসরি লিখুন:\n" +
            "<i>\"A+ রক্ত দরকার ঢাকায়\"</i>\n" +
            "<i>\"রক্তদানের বয়স কত?\"</i>\n" +
            "<i>\"I need O+ blood in Chittagong urgently\"</i>\n\n" +
            "অথবা নিচের মেনু ব্যবহার করুন 👇");
        await showMainMenu(chatId);
        return;
    }
    // ── /help command ──────────────────────────────────────────────────────────
    if (trimmed === "/help") {
        await (0, telegramAiConversationHandler_1.handleTgAiMessage)(chatId, "help");
        return;
    }
    // ── AI natural-language handler ────────────────────────────────────────────
    await (0, telegramAiConversationHandler_1.handleTgAiMessage)(chatId, trimmed);
};
exports.handleTgTextMessage = handleTgTextMessage;
/**
 * Handle a callback query (inline keyboard button press).
 * callback_data = the button label we set when building the keyboard.
 */
const handleTgCallbackQuery = async (chatId, data, username, firstName) => {
    const d = data.trim();
    // ── Registration flow callbacks ────────────────────────────────────────────
    if ((0, telegramRegisterHandler_1.isInTgRegistration)(chatId)) {
        const handled = await (0, telegramRegisterHandler_1.handleTgRegisterCallback)(chatId, d);
        if (handled)
            return;
        // If not handled by registration (e.g. main menu buttons pressed mid-flow), fall through
    }
    // Check for registration-prefixed callbacks even if not yet in registration
    if (d.startsWith("REG_")) {
        const handled = await (0, telegramRegisterHandler_1.handleTgRegisterCallback)(chatId, d);
        if (handled)
            return;
    }
    // ── Main menu buttons ──────────────────────────────────────────────────────
    if (d === "🔍 রক্তদাতা খুঁজুন") {
        (0, telegramAiConversationHandler_1.clearTgAiState)(chatId);
        (0, telegramRegisterHandler_1.clearTgRegistration)(chatId);
        await (0, telegramAiConversationHandler_1.handleTgAiMessage)(chatId, "রক্তদাতা খুঁজতে চাই");
        return;
    }
    if (d === "📝 ডোনার নিবন্ধন") {
        (0, telegramAiConversationHandler_1.clearTgAiState)(chatId);
        (0, telegramRegisterHandler_1.clearTgRegistration)(chatId);
        await (0, telegramRegisterHandler_1.startTgRegistration)(chatId, username, firstName);
        return;
    }
    if (d === "❓ সাহায্য") {
        await (0, telegramAiConversationHandler_1.handleTgAiMessage)(chatId, "help");
        return;
    }
    if (d === "🌐 ওয়েবসাইট") {
        await (0, sendMessageToTgUser_1.sendTgUrlButton)(chatId, "LifeDrop বাংলাদেশ ওয়েবসাইট:", "ওয়েবসাইটে যান →", process.env.FRONTEND_URL);
        return;
    }
    // ── Blood group selection (from AI flow inline keyboard) ───────────────────
    const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (bloodGroups.includes(d)) {
        await (0, telegramAiConversationHandler_1.handleTgAiMessage)(chatId, d);
        return;
    }
    // ── Location suggestion selection ──────────────────────────────────────────
    if (d.startsWith("LOC_SUGGEST:")) {
        const locationId = d.slice(12);
        await (0, telegramAiConversationHandler_1.handleTgLocationSuggest)(chatId, locationId);
        return;
    }
    // ── Any other callback: treat as natural-language text ─────────────────────
    await (0, telegramAiConversationHandler_1.handleTgAiMessage)(chatId, d);
};
exports.handleTgCallbackQuery = handleTgCallbackQuery;
