"use strict";
/**
 * Telegram Donor Registration Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Collects: name → blood group → division → district → thana
 * Saves to TelegramUserModel (MongoDB) with GeoJSON location.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInTgRegistration = isInTgRegistration;
exports.clearTgRegistration = clearTgRegistration;
exports.startTgRegistration = startTgRegistration;
exports.handleTgRegisterText = handleTgRegisterText;
exports.handleTgRegisterCallback = handleTgRegisterCallback;
const address_1 = require("../facebookBotHandler/address");
const sendMessageToTgUser_1 = require("./sendMessageToTgUser");
const telegramUserSchema_1 = __importDefault(require("../../models/telegram/telegramUserSchema"));
const tgRegisterMap = new Map();
const REG_TTL_MS = 20 * 60 * 1000; // 20 min
// ── Helpers ───────────────────────────────────────────────────────────────────
// Chunk array into rows of given size
function chunkRows(arr, size) {
    const rows = [];
    for (let i = 0; i < arr.length; i += size) {
        rows.push(arr.slice(i, i + size));
    }
    return rows;
}
// Validate Bangladeshi mobile numbers: 01XXXXXXXXX / +8801XXXXXXXXX / 8801XXXXXXXXX
function isValidBDPhone(phone) {
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(phone.trim());
}
// Normalise to 01XXXXXXXXX
function normalizeBDPhone(phone) {
    const digits = phone.trim().replace(/^\+?88/, "");
    return digits;
}
// ── Public API ────────────────────────────────────────────────────────────────
function isInTgRegistration(chatId) {
    const s = tgRegisterMap.get(chatId);
    if (!s)
        return false;
    if (Date.now() - s.lastUpdated > REG_TTL_MS) {
        tgRegisterMap.delete(chatId);
        return false;
    }
    return true;
}
function clearTgRegistration(chatId) {
    tgRegisterMap.delete(chatId);
}
/** Entry point: begin registration flow */
async function startTgRegistration(chatId, username, firstName) {
    tgRegisterMap.set(chatId, {
        step: "name",
        username: username !== null && username !== void 0 ? username : undefined,
        firstName: firstName !== null && firstName !== void 0 ? firstName : undefined,
        lastUpdated: Date.now(),
    });
    await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "📝 <b>রক্তদাতা হিসেবে নিবন্ধন শুরু করা যাক!</b>\n\n" +
        "আপনার <b>পূর্ণ নাম</b> লিখুন:");
}
/** Handle a plain text message when in registration flow */
async function handleTgRegisterText(chatId, text) {
    const state = tgRegisterMap.get(chatId);
    if (!state)
        return false;
    state.lastUpdated = Date.now();
    if (state.step === "name") {
        const name = text.trim();
        if (name.length < 2) {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ অনুগ্রহ করে সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর):");
            return true;
        }
        state.fullName = name;
        state.step = "phone";
        tgRegisterMap.set(chatId, state);
        await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `✅ ধন্যবাদ <b>${name}</b>!\n\n` +
            `এখন আপনার <b>মোবাইল নম্বর</b> লিখুন:\n` +
            `(যেমন: <code>01XXXXXXXXX</code>)`);
        return true;
    }
    if (state.step === "phone") {
        const phone = text.trim();
        if (!isValidBDPhone(phone)) {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।\n" +
                "নম্বর অবশ্যই <code>01</code> দিয়ে শুরু হতে হবে এবং মোট ১১ সংখ্যার হতে হবে।\n" +
                "(যেমন: <code>01712345678</code>)");
            return true;
        }
        state.phoneNumber = normalizeBDPhone(phone);
        state.step = "blood_group";
        tgRegisterMap.set(chatId, state);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `✅ মোবাইল: <b>${state.phoneNumber}</b>\n\nএখন আপনার <b>রক্তের গ্রুপ</b> নির্বাচন করুন:`, [["A+", "A-"], ["B+", "B-"], ["O+", "O-"], ["AB+", "AB-"]].map(row => row.map(bg => ({ label: bg, data: `REG_BG:${bg}` }))));
        return true;
    }
    // If user types text when a keyboard choice is expected, remind them
    await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "👆 অনুগ্রহ করে উপরের বোতাম থেকে নির্বাচন করুন।");
    return true;
}
/** Handle a callback query (button press) when in registration flow */
async function handleTgRegisterCallback(chatId, data) {
    var _a, _b;
    const state = tgRegisterMap.get(chatId);
    if (!state)
        return false;
    state.lastUpdated = Date.now();
    // ── Blood group ───────────────────────────────────────────────────────────
    if (data.startsWith("REG_BG:")) {
        const bg = data.slice(7);
        state.bloodGroup = bg;
        state.step = "division";
        tgRegisterMap.set(chatId, state);
        const divisions = await (0, address_1.getDivision)();
        const rows = chunkRows(divisions.map(d => ({ label: d.name, data: `REG_DIV:${d.id}` })), 3);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `✅ রক্তের গ্রুপ: <b>${bg}</b>\n\nআপনার <b>বিভাগ</b> নির্বাচন করুন:`, rows);
        return true;
    }
    // ── Division ──────────────────────────────────────────────────────────────
    if (data.startsWith("REG_DIV:")) {
        const divisionId = data.slice(8);
        const divisions = await (0, address_1.getDivision)();
        const div = divisions.find(d => d.id === divisionId);
        if (!div) {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ বিভাগ খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।");
            return true;
        }
        state.divisionId = divisionId;
        state.divisionName = div.name;
        state.step = "district";
        tgRegisterMap.set(chatId, state);
        const districts = await (0, address_1.getDistrict)(divisionId);
        const rows = chunkRows(districts.map(d => ({ label: d.name, data: `REG_DIST:${d.id}` })), 3);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `✅ বিভাগ: <b>${div.name}</b>\n\nআপনার <b>জেলা</b> নির্বাচন করুন:`, rows);
        return true;
    }
    // ── District ──────────────────────────────────────────────────────────────
    if (data.startsWith("REG_DIST:")) {
        const districtId = data.slice(9);
        const districts = await (0, address_1.getDistrict)(state.divisionId);
        const dist = districts.find(d => d.id === districtId);
        if (!dist) {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ জেলা খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।");
            return true;
        }
        state.districtId = districtId;
        state.districtName = dist.name;
        state.step = "thana";
        tgRegisterMap.set(chatId, state);
        const thanas = await (0, address_1.getThana)(districtId, state.divisionId);
        const rows = chunkRows(thanas.map(t => ({ label: t.name, data: `REG_THANA:${t.id}` })), 3);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `✅ জেলা: <b>${dist.name}</b>\n\nআপনার <b>উপজেলা/থানা</b> নির্বাচন করুন:`, rows);
        return true;
    }
    // ── Thana ─────────────────────────────────────────────────────────────────
    if (data.startsWith("REG_THANA:")) {
        const thanaId = data.slice(10);
        const thanas = await (0, address_1.getThana)(state.districtId, state.divisionId);
        const thana = thanas.find(t => t.id === thanaId);
        if (!thana) {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ থানা খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।");
            return true;
        }
        state.thanaId = thanaId;
        state.thanaName = thana.name;
        state.latitude = parseFloat(thana.latitude) || 0;
        state.longitude = parseFloat(thana.longitude) || 0;
        state.step = "confirm";
        tgRegisterMap.set(chatId, state);
        const summary = `📋 <b>আপনার তথ্য:</b>\n\n` +
            `👤 নাম: <b>${state.fullName}</b>\n` +
            `📱 মোবাইল: <b>${state.phoneNumber}</b>\n` +
            `🩸 রক্তের গ্রুপ: <b>${state.bloodGroup}</b>\n` +
            `📍 বিভাগ: <b>${state.divisionName}</b>\n` +
            `🏙️ জেলা: <b>${state.districtName}</b>\n` +
            `🏘️ উপজেলা/থানা: <b>${thana.name}</b>\n\n` +
            `তথ্য সঠিক থাকলে <b>নিশ্চিত করুন</b>।`;
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, summary, [
            [{ label: "✅ নিশ্চিত করুন", data: "REG_CONFIRM:yes" }],
            [{ label: "🔄 আবার শুরু করুন", data: "REG_RESTART:" }],
        ]);
        return true;
    }
    // ── Confirm ───────────────────────────────────────────────────────────────
    if (data === "REG_CONFIRM:yes") {
        try {
            const existing = await telegramUserSchema_1.default.findOne({ chatId });
            if (existing) {
                // Update existing record
                existing.fullName = state.fullName;
                existing.phoneNumber = state.phoneNumber;
                existing.bloodGroup = state.bloodGroup;
                existing.divisionId = state.divisionId;
                existing.districtId = state.districtId;
                existing.thanaId = state.thanaId;
                existing.latitude = state.latitude;
                existing.longitude = state.longitude;
                existing.location = { type: "Point", coordinates: [state.longitude, state.latitude] };
                if (state.username)
                    existing.username = state.username;
                if (state.firstName)
                    existing.firstName = state.firstName;
                await existing.save();
            }
            else {
                await telegramUserSchema_1.default.create({
                    chatId,
                    username: (_a = state.username) !== null && _a !== void 0 ? _a : null,
                    firstName: (_b = state.firstName) !== null && _b !== void 0 ? _b : null,
                    fullName: state.fullName,
                    phoneNumber: state.phoneNumber,
                    bloodGroup: state.bloodGroup,
                    divisionId: state.divisionId,
                    districtId: state.districtId,
                    thanaId: state.thanaId,
                    latitude: state.latitude,
                    longitude: state.longitude,
                    location: {
                        type: "Point",
                        coordinates: [state.longitude, state.latitude],
                    },
                });
            }
            tgRegisterMap.delete(chatId);
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `🎉 <b>অভিনন্দন ${state.fullName}!</b>\n\n` +
                `আপনি সফলভাবে রক্তদাতা হিসেবে নিবন্ধিত হয়েছেন। 🩸\n\n` +
                `যখনই আপনার কাছাকাছি কেউ <b>${state.bloodGroup}</b> রক্তের প্রয়োজন অনুভব করবেন, ` +
                `আমরা আপনাকে জানাবো।\n\n` +
                `রক্তদান করে জীবন বাঁচান! ❤️`);
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, "নিচের মেনু থেকে আরো কিছু করতে পারেন:", [["🔍 রক্তদাতা খুঁজুন", "❓ সাহায্য"], ["🌐 ওয়েবসাইট"]]);
        }
        catch (err) {
            console.error("[TG Register] Save error:", err);
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "⚠️ নিবন্ধন সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
            tgRegisterMap.delete(chatId);
        }
        return true;
    }
    // ── Restart ───────────────────────────────────────────────────────────────
    if (data === "REG_RESTART:") {
        tgRegisterMap.delete(chatId);
        await startTgRegistration(chatId, state.username, state.firstName);
        return true;
    }
    return false;
}
