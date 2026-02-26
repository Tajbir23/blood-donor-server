"use strict";
/**
 * Telegram Profile Update & Last Donation Date Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Lets a registered Telegram user update:
 *   • Full name
 *   • Phone number
 *   • Blood group
 *   • Location (division → district → thana)
 *   • Last blood donation date
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInTgProfileUpdate = isInTgProfileUpdate;
exports.clearTgProfileUpdate = clearTgProfileUpdate;
exports.startTgProfileUpdate = startTgProfileUpdate;
exports.startTgDonationDateUpdate = startTgDonationDateUpdate;
exports.handleTgProfileText = handleTgProfileText;
exports.handleTgProfileCallback = handleTgProfileCallback;
const address_1 = require("../facebookBotHandler/address");
const sendMessageToTgUser_1 = require("./sendMessageToTgUser");
const telegramUserSchema_1 = __importDefault(require("../../models/telegram/telegramUserSchema"));
const bangladeshGeoLoactionData_1 = require("../../utils/bangladeshGeoLoactionData");
const profileMap = new Map();
const PROFILE_TTL_MS = 15 * 60 * 1000; // 15 min
const PROF_CANCEL_KEYWORDS = [
    "cancel", "বাতিল", "exit", "quit", "stop",
    "/start", "/cancel",
];
function isProfCancelText(text) {
    const lower = text.trim().toLowerCase();
    return PROF_CANCEL_KEYWORDS.some(k => lower === k.toLowerCase());
}
function getLocationNames(divisionId, districtId, thanaId) {
    let divisionName = divisionId || "—";
    let districtName = districtId || "—";
    let thanaName = thanaId || "—";
    const div = bangladeshGeoLoactionData_1.bangladeshGeoData.divisions.find(d => d.id === divisionId);
    if (div) {
        divisionName = div.name;
        const dist = div.districts.find(d => d.id === districtId);
        if (dist) {
            districtName = dist.name;
            const thana = dist.thanas.find(t => t.id === thanaId);
            if (thana)
                thanaName = thana.name;
        }
    }
    return { divisionName, districtName, thanaName };
}
async function showProfMenu(chatId) {
    await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, "নিচের মেনু থেকে বেছে নিন:", [
        ["🔍 রক্তদাতা খুঁজুন", "📝 ডোনার নিবন্ধন"],
        ["🔄 প্রোফাইল আপডেট", "📅 শেষ দান আপডেট"],
        ["❓ সাহায্য", "🌐 ওয়েবসাইট"],
    ]);
}
// ── Helpers ───────────────────────────────────────────────────────────────────
function chunkRows(arr, size) {
    const rows = [];
    for (let i = 0; i < arr.length; i += size)
        rows.push(arr.slice(i, i + size));
    return rows;
}
function isValidBDPhone(phone) {
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(phone.trim());
}
function normalizeBDPhone(phone) {
    return phone.trim().replace(/^\+?88/, "");
}
/** Parse dates like DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD */
function parseDate(raw) {
    const s = raw.trim();
    // YYYY-MM-DD
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) {
        const d = new Date(+m[1], +m[2] - 1, +m[3]);
        return isNaN(d.getTime()) ? null : d;
    }
    // DD/MM/YYYY or DD-MM-YYYY
    m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
        const d = new Date(+m[3], +m[2] - 1, +m[1]);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}
function formatDate(d) {
    return d.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}
// ── Public API ────────────────────────────────────────────────────────────────
function isInTgProfileUpdate(chatId) {
    const s = profileMap.get(chatId);
    if (!s)
        return false;
    if (Date.now() - s.lastUpdated > PROFILE_TTL_MS) {
        profileMap.delete(chatId);
        return false;
    }
    return true;
}
function clearTgProfileUpdate(chatId) {
    profileMap.delete(chatId);
}
/** Entry point: show profile update menu */
async function startTgProfileUpdate(chatId) {
    const user = await telegramUserSchema_1.default.findOne({ chatId }).lean();
    if (!user) {
        await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ আপনি এখনো রেজিস্ট্রেশন করেননি। প্রথমে <b>ডোনার নিবন্ধন</b> করুন।");
        return;
    }
    profileMap.set(chatId, { step: "menu", lastUpdated: Date.now() });
    const { divisionName, districtName, thanaName } = getLocationNames(user.divisionId, user.districtId, user.thanaId);
    const lastDonation = user.lastDonationDate ? formatDate(new Date(user.lastDonationDate)) : "—";
    await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `📋 <b>আপনার বর্তমান তথ্য:</b>\n\n` +
        `👤 নাম: <b>${user.fullName}</b>\n` +
        `📱 মোবাইল: <b>${user.phoneNumber || "—"}</b>\n` +
        `🩸 রক্তের গ্রুপ: <b>${user.bloodGroup}</b>\n` +
        `📍 এলাকা: <b>${divisionName} → ${districtName} → ${thanaName}</b>\n` +
        `📅 শেষ দান: <b>${lastDonation}</b>\n\n` +
        `কী আপডেট করতে চান?`);
    await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "নিচের বোতাম থেকে বেছে নিন:", [
        [{ label: "👤 নাম পরিবর্তন", data: "PROF_FIELD:name" }],
        [{ label: "📱 মোবাইল নম্বর", data: "PROF_FIELD:phone" }],
        [{ label: "🩸 রক্তের গ্রুপ", data: "PROF_FIELD:blood_group" }],
        [{ label: "📍 এলাকা পরিবর্তন", data: "PROF_FIELD:location" }],
        [{ label: "📅 শেষ রক্তদানের তারিখ", data: "PROF_FIELD:donation_date" }],
        [{ label: "❌ বাতিল", data: "PROF_CANCEL" }],
    ]);
}
/** Shortcut: go directly to the donation-date step (for menu button) */
async function startTgDonationDateUpdate(chatId) {
    const user = await telegramUserSchema_1.default.findOne({ chatId }).lean();
    if (!user) {
        await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ আপনি এখনো রেজিস্ট্রেশন করেননি। প্রথমে <b>ডোনার নিবন্ধন</b> করুন।");
        return;
    }
    profileMap.set(chatId, { step: "donation_date", field: "donation_date", lastUpdated: Date.now() });
    const last = user.lastDonationDate ? formatDate(new Date(user.lastDonationDate)) : "এখনো দেননি";
    await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `📅 <b>শেষ রক্তদানের তারিখ আপডেট</b>\n\n` +
        `বর্তমান তারিখ: <b>${last}</b>\n\n` +
        `নতুন তারিখ লিখুন:\n` +
        `ফরম্যাট: <code>DD/MM/YYYY</code> বা <code>YYYY-MM-DD</code>\n` +
        `(যেমন: <code>25/02/2026</code>)`, [[{ label: "❌ বাতিল", data: "PROF_CANCEL" }]]);
}
/** Text message while in profile-update flow */
async function handleTgProfileText(chatId, text) {
    const state = profileMap.get(chatId);
    if (!state)
        return false;
    state.lastUpdated = Date.now();
    // ── Name ──────────────────────────────────────────────────────────────────
    if (state.step === "name") {
        const name = text.trim();
        if (isProfCancelText(name)) {
            profileMap.delete(chatId);
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ আপডেট বাতিল করা হয়েছে।");
            await showProfMenu(chatId);
            return true;
        }
        if (name.length < 2) {
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "❌ অনুগ্রহ করে সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর):", [[{ label: "❌ বাতিল", data: "PROF_CANCEL" }]]);
            return true;
        }
        state.newValue = name;
        state.step = "confirm";
        profileMap.set(chatId, state);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `নতুন নাম: <b>${name}</b>\n\nনিশ্চিত করবেন?`, [[{ label: "✅ হ্যাঁ", data: "PROF_CONFIRM" }, { label: "❌ না", data: "PROF_CANCEL" }]]);
        return true;
    }
    // ── Phone ────────────────────────────────────────────────────────────────
    if (state.step === "phone") {
        const phone = text.trim();
        if (isProfCancelText(phone)) {
            profileMap.delete(chatId);
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ আপডেট বাতিল করা হয়েছে।");
            await showProfMenu(chatId);
            return true;
        }
        if (!isValidBDPhone(phone)) {
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "❌ সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।\n" +
                "নম্বর অবশ্যই 01 দিয়ে শুরু হতে হবে এবং মোট ১১ সংখ্যার হতে হবে।\n" +
                "(যেমন: <code>01712345678</code>)", [[{ label: "❌ বাতিল", data: "PROF_CANCEL" }]]);
            return true;
        }
        state.newValue = normalizeBDPhone(phone);
        state.step = "confirm";
        profileMap.set(chatId, state);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `নতুন মোবাইল: <b>${state.newValue}</b>\n\nনিশ্চিত করবেন?`, [[{ label: "✅ হ্যাঁ", data: "PROF_CONFIRM" }, { label: "❌ না", data: "PROF_CANCEL" }]]);
        return true;
    }
    // ── Donation date ─────────────────────────────────────────────────────────
    if (state.step === "donation_date") {
        if (isProfCancelText(text)) {
            profileMap.delete(chatId);
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ আপডেট বাতিল করা হয়েছে।");
            await showProfMenu(chatId);
            return true;
        }
        const parsed = parseDate(text);
        if (!parsed || parsed > new Date()) {
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "❌ সঠিক তারিখ লিখুন। ভবিষ্যতের তারিখ গ্রহণযোগ্য নয়।\n" +
                "ফরম্যাট: <code>DD/MM/YYYY</code> বা <code>YYYY-MM-DD</code>\n" +
                "(যেমন: <code>25/02/2026</code>)", [[{ label: "❌ বাতিল", data: "PROF_CANCEL" }]]);
            return true;
        }
        state.donationDate = parsed.toISOString();
        state.step = "confirm";
        profileMap.set(chatId, state);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `শেষ রক্তদানের তারিখ: <b>${formatDate(parsed)}</b>\n\nনিশ্চিত করবেন?`, [[{ label: "✅ হ্যাঁ", data: "PROF_CONFIRM" }, { label: "❌ না", data: "PROF_CANCEL" }]]);
        return true;
    }
    // If waiting for keyboard input
    await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "👆 অনুগ্রহ করে উপরের বোতাম থেকে নির্বাচন করুন।", [[{ label: "❌ বাতিল", data: "PROF_CANCEL" }]]);
    return true;
}
/** Callback query while in profile-update flow */
async function handleTgProfileCallback(chatId, data) {
    if (!data.startsWith("PROF_") && !profileMap.has(chatId))
        return false;
    const state = profileMap.get(chatId);
    if (!state)
        return false;
    state.lastUpdated = Date.now();
    // ── Cancel ────────────────────────────────────────────────────────────────
    if (data === "PROF_CANCEL") {
        profileMap.delete(chatId);
        await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "✅ আপডেট বাতিল করা হয়েছে।");
        await showProfMenu(chatId);
        return true;
    }
    // ── Field selection ───────────────────────────────────────────────────────
    if (data.startsWith("PROF_FIELD:")) {
        const field = data.slice(11);
        state.field = field;
        if (field === "name") {
            state.step = "name";
            profileMap.set(chatId, state);
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "নতুন <b>পূর্ণ নাম</b> লিখুন:\n(Cancel লিখুন বা নিচের বোতাম দিন)", [[{ label: "❌ বাতিল", data: "PROF_CANCEL" }]]);
            return true;
        }
        if (field === "phone") {
            state.step = "phone";
            profileMap.set(chatId, state);
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "নতুন <b>মোবাইল নম্বর</b> লিখুন:\n(যেমন: <code>01712345678</code>)", [[{ label: "❌ বাতিল", data: "PROF_CANCEL" }]]);
            return true;
        }
        if (field === "blood_group") {
            state.step = "blood_group";
            profileMap.set(chatId, state);
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "নতুন <b>রক্তের গ্রুপ</b> নির্বাচন করুন:", [
                [{ label: "A+", data: "PROF_BG:A+" }, { label: "A-", data: "PROF_BG:A-" }],
                [{ label: "B+", data: "PROF_BG:B+" }, { label: "B-", data: "PROF_BG:B-" }],
                [{ label: "O+", data: "PROF_BG:O+" }, { label: "O-", data: "PROF_BG:O-" }],
                [{ label: "AB+", data: "PROF_BG:AB+" }, { label: "AB-", data: "PROF_BG:AB-" }],
            ]);
            return true;
        }
        if (field === "location") {
            state.step = "division";
            profileMap.set(chatId, state);
            const divisions = await (0, address_1.getDivision)();
            const rows = chunkRows(divisions.map(d => ({ label: d.name, data: `PROF_DIV:${d.id}` })), 3);
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "নতুন <b>বিভাগ</b> নির্বাচন করুন:", rows);
            return true;
        }
        if (field === "donation_date") {
            state.step = "donation_date";
            profileMap.set(chatId, state);
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "শেষ রক্তদানের তারিখ লিখুন:\n" +
                "ফরম্যাট: <code>DD/MM/YYYY</code> বা <code>YYYY-MM-DD</code>\n" +
                "(যেমন: <code>25/02/2026</code>)", [[{ label: "❌ বাতিল", data: "PROF_CANCEL" }]]);
            return true;
        }
        return true;
    }
    // ── Blood group ───────────────────────────────────────────────────────────
    if (data.startsWith("PROF_BG:")) {
        const bg = data.slice(8);
        state.newValue = bg;
        state.step = "confirm";
        profileMap.set(chatId, state);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `নতুন রক্তের গ্রুপ: <b>${bg}</b>\n\nনিশ্চিত করবেন?`, [[{ label: "✅ হ্যাঁ", data: "PROF_CONFIRM" }, { label: "❌ না", data: "PROF_CANCEL" }]]);
        return true;
    }
    // ── Division ──────────────────────────────────────────────────────────────
    if (data.startsWith("PROF_DIV:")) {
        const divId = data.slice(9);
        const divisions = await (0, address_1.getDivision)();
        const div = divisions.find(d => d.id === divId);
        if (!div) {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ বিভাগ পাওয়া যায়নি।");
            return true;
        }
        state.divisionId = divId;
        state.divisionName = div.name;
        state.step = "district";
        profileMap.set(chatId, state);
        const districts = await (0, address_1.getDistrict)(divId);
        const rows = chunkRows(districts.map(d => ({ label: d.name, data: `PROF_DIST:${d.id}` })), 3);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `✅ বিভাগ: <b>${div.name}</b>\n\nআপনার <b>জেলা</b> নির্বাচন করুন:`, rows);
        return true;
    }
    // ── District ──────────────────────────────────────────────────────────────
    if (data.startsWith("PROF_DIST:")) {
        const distId = data.slice(10);
        const districts = await (0, address_1.getDistrict)(state.divisionId);
        const dist = districts.find(d => d.id === distId);
        if (!dist) {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ জেলা পাওয়া যায়নি।");
            return true;
        }
        state.districtId = distId;
        state.districtName = dist.name;
        state.step = "thana";
        profileMap.set(chatId, state);
        const thanas = await (0, address_1.getThana)(distId, state.divisionId);
        const rows = chunkRows(thanas.map(t => ({ label: t.name, data: `PROF_THANA:${t.id}` })), 3);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `✅ জেলা: <b>${dist.name}</b>\n\nআপনার <b>উপজেলা/থানা</b> নির্বাচন করুন:`, rows);
        return true;
    }
    // ── Thana ─────────────────────────────────────────────────────────────────
    if (data.startsWith("PROF_THANA:")) {
        const thanaId = data.slice(11);
        const thanas = await (0, address_1.getThana)(state.districtId, state.divisionId);
        const thana = thanas.find(t => t.id === thanaId);
        if (!thana) {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ থানা পাওয়া যায়নি।");
            return true;
        }
        state.thanaId = thanaId;
        state.thanaName = thana.name;
        state.step = "confirm";
        profileMap.set(chatId, state);
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, `নতুন এলাকা:\n` +
            `📍 বিভাগ: <b>${state.divisionName}</b>\n` +
            `🏙️ জেলা: <b>${state.districtName}</b>\n` +
            `🏘️ থানা: <b>${thana.name}</b>\n\n` +
            `নিশ্চিত করবেন?`, [[{ label: "✅ হ্যাঁ", data: "PROF_CONFIRM" }, { label: "❌ না", data: "PROF_CANCEL" }]]);
        return true;
    }
    // ── Confirm: save to DB ───────────────────────────────────────────────────
    if (data === "PROF_CONFIRM") {
        try {
            const user = await telegramUserSchema_1.default.findOne({ chatId });
            if (!user) {
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "❌ ব্যবহারকারী পাওয়া যায়নি। আবার চেষ্টা করুন।");
                profileMap.delete(chatId);
                return true;
            }
            const field = state.field;
            if (field === "name" && state.newValue) {
                user.fullName = state.newValue;
                await user.save();
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `✅ নাম সফলভাবে আপডেট হয়েছে: <b>${state.newValue}</b>`);
            }
            else if (field === "phone" && state.newValue) {
                user.phoneNumber = state.newValue;
                await user.save();
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `✅ মোবাইল নম্বর সফলভাবে আপডেট হয়েছে: <b>${state.newValue}</b>`);
            }
            else if (field === "blood_group" && state.newValue) {
                user.bloodGroup = state.newValue;
                await user.save();
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `✅ রক্তের গ্রুপ সফলভাবে আপডেট হয়েছে: <b>${state.newValue}</b>`);
            }
            else if (field === "location" && state.thanaId) {
                const thanas = await (0, address_1.getThana)(state.districtId, state.divisionId);
                const thana = thanas.find(t => t.id === state.thanaId);
                const lat = parseFloat((thana === null || thana === void 0 ? void 0 : thana.latitude) || "0");
                const lon = parseFloat((thana === null || thana === void 0 ? void 0 : thana.longitude) || "0");
                user.divisionId = state.divisionId;
                user.districtId = state.districtId;
                user.thanaId = state.thanaId;
                user.latitude = lat;
                user.longitude = lon;
                user.location = { type: "Point", coordinates: [lon, lat] };
                await user.save();
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `✅ এলাকা সফলভাবে আপডেট হয়েছে:\n` +
                    `<b>${state.divisionName} → ${state.districtName} → ${state.thanaName}</b>`);
            }
            else if (field === "donation_date" && state.donationDate) {
                user.lastDonationDate = new Date(state.donationDate);
                await user.save();
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `✅ শেষ রক্তদানের তারিখ আপডেট হয়েছে: <b>${formatDate(new Date(state.donationDate))}</b>`);
            }
        }
        catch (err) {
            console.error("[TG Profile] Save error:", err);
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "⚠️ আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        }
        profileMap.delete(chatId);
        return true;
    }
    return false;
}
