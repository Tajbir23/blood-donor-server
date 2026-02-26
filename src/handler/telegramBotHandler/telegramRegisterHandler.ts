/**
 * Telegram Donor Registration Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Collects: name → blood group → division → district → thana
 * Saves to TelegramUserModel (MongoDB) with GeoJSON location.
 */

import { getDivision, getDistrict, getThana } from "../facebookBotHandler/address";
import { sendTgMessage, sendTgInlineKeyboard, sendTgInlineKeyboardData } from "./sendMessageToTgUser";
import TelegramUserModel from "../../models/telegram/telegramUserSchema";
import { bangladeshGeoData } from "../../utils/bangladeshGeoLoactionData";

// ── State ─────────────────────────────────────────────────────────────────────

type RegStep = "name" | "phone" | "blood_group" | "division" | "district" | "thana" | "confirm";

interface TgRegisterState {
    step: RegStep;
    username?: string;
    firstName?: string;
    fullName?: string;
    phoneNumber?: string;
    bloodGroup?: string;
    divisionId?: string;
    divisionName?: string;
    districtId?: string;
    districtName?: string;
    thanaId?: string;
    thanaName?: string;
    latitude?: number;
    longitude?: number;
    lastUpdated: number;
}

const tgRegisterMap = new Map<string, TgRegisterState>();
const REG_TTL_MS = 20 * 60 * 1000; // 20 min

const TOTAL_STEPS = 5; // name, phone, blood_group, location(div+dist+thana=1), confirm

const CANCEL_KEYWORDS_SET = [
    "cancel", "বাতিল", "exit", "quit", "stop",
    "/start", "/cancel", "/help",
    "🔍 রক্তদাতা খুঁজুন", "📝 ডোনার নিবন্ধন",
    "🔄 প্রোফাইল আপডেট", "📅 শেষ দান আপডেট",
    "❓ সাহায্য", "🌐 ওয়েবসাইট",
];

function isCancelText(text: string): boolean {
    const lower = text.trim().toLowerCase();
    return CANCEL_KEYWORDS_SET.some(k => lower === k.toLowerCase());
}

const CANCEL_BTN = [{ label: "❌ বাতিল", data: "REG_CANCEL" }];

async function showMainMenuReg(chatId: string) {
    await sendTgInlineKeyboard(chatId, "নিচের মেনু থেকে বেছে নিন:", [
        ["🔍 রক্তদাতা খুঁজুন", "📝 ডোনার নিবন্ধন"],
        ["🔄 প্রোফাইল আপডেট", "📅 শেষ দান আপডেট"],
        ["❓ সাহায্য", "🌐 ওয়েবসাইট"],
    ]);
}

function getLocationName(divisionId?: string, districtId?: string, thanaId?: string): { divisionName: string; districtName: string; thanaName: string } {
    let divisionName = divisionId || "";
    let districtName = districtId || "";
    let thanaName    = thanaId    || "";
    const div = bangladeshGeoData.divisions.find(d => d.id === divisionId);
    if (div) {
        divisionName = div.name;
        const dist = div.districts.find(d => d.id === districtId);
        if (dist) {
            districtName = dist.name;
            const thana = dist.thanas.find(t => t.id === thanaId);
            if (thana) thanaName = thana.name;
        }
    }
    return { divisionName, districtName, thanaName };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Chunk array into rows of given size
function chunkRows<T>(arr: T[], size: number): T[][] {
    const rows: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        rows.push(arr.slice(i, i + size));
    }
    return rows;
}

// Validate Bangladeshi mobile numbers: 01XXXXXXXXX / +8801XXXXXXXXX / 8801XXXXXXXXX
function isValidBDPhone(phone: string): boolean {
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(phone.trim());
}

// Normalise to 01XXXXXXXXX
function normalizeBDPhone(phone: string): string {
    const digits = phone.trim().replace(/^\+?88/, "");
    return digits;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function isInTgRegistration(chatId: string): boolean {
    const s = tgRegisterMap.get(chatId);
    if (!s) return false;
    if (Date.now() - s.lastUpdated > REG_TTL_MS) {
        tgRegisterMap.delete(chatId);
        return false;
    }
    return true;
}

export function clearTgRegistration(chatId: string) {
    tgRegisterMap.delete(chatId);
}

/** Entry point: begin registration flow */
export async function startTgRegistration(
    chatId: string,
    username?: string,
    firstName?: string
): Promise<void> {
    // Check if already registered
    const existing = await TelegramUserModel.findOne({ chatId }).lean();
    if (existing) {
        const { divisionName, districtName, thanaName } = getLocationName(existing.divisionId, existing.districtId, existing.thanaId);
        await sendTgMessage(
            chatId,
            `ℹ️ আপনি ইতিমধ্যে নিবন্ধিত আছেন।\n\n` +
            `👤 নাম: <b>${existing.fullName}</b>\n` +
            `📱 মোবাইল: <b>${existing.phoneNumber || "—"}</b>\n` +
            `🩸 রক্তের গ্রুপ: <b>${existing.bloodGroup}</b>\n` +
            `📍 এলাকা: <b>${divisionName} → ${districtName} → ${thanaName}</b>\n\n` +
            `তথ্য পরিবর্তন করতে <b>প্রোফাইল আপডেট</b> ব্যবহার করুন।`
        );
        await showMainMenuReg(chatId);
        return;
    }

    tgRegisterMap.set(chatId, {
        step: "name",
        username: username ?? undefined,
        firstName: firstName ?? undefined,
        lastUpdated: Date.now(),
    });

    await sendTgInlineKeyboardData(
        chatId,
        `📝 <b>রক্তদাতা হিসেবে নিবন্ধন শুরু করা যাক!</b>\n` +
        `📍 ধাপ ১/${TOTAL_STEPS}: নাম\n\n` +
        `আপনার <b>পূর্ণ নাম</b> লিখুন:`,
        [[CANCEL_BTN[0]]]
    );
}

/** Handle a plain text message when in registration flow */
export async function handleTgRegisterText(chatId: string, text: string): Promise<boolean> {
    const state = tgRegisterMap.get(chatId);
    if (!state) return false;
    state.lastUpdated = Date.now();

    if (state.step === "name") {
        const name = text.trim();

        if (isCancelText(name)) {
            tgRegisterMap.delete(chatId);
            await sendTgMessage(chatId, "❌ নিবন্ধন বাতিল করা হয়েছে।");
            await showMainMenuReg(chatId);
            return true;
        }

        if (name.length < 2) {
            await sendTgInlineKeyboardData(chatId,
                "❌ অনুগ্রহ করে সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর):",
                [[CANCEL_BTN[0]]]);
            return true;
        }
        state.fullName = name;
        state.step = "phone";
        tgRegisterMap.set(chatId, state);

        await sendTgInlineKeyboardData(
            chatId,
            `✅ ধন্যবাদ <b>${name}</b>!\n` +
            `📍 ধাপ ২/${TOTAL_STEPS}: মোবাইল নম্বর\n\n` +
            `এখন আপনার <b>মোবাইল নম্বর</b> লিখুন:\n` +
            `(যেমন: <code>01XXXXXXXXX</code>)`,
            [[CANCEL_BTN[0]]]
        );
        return true;
    }

    if (state.step === "phone") {
        const phone = text.trim();

        if (isCancelText(phone)) {
            tgRegisterMap.delete(chatId);
            await sendTgMessage(chatId, "❌ নিবন্ধন বাতিল করা হয়েছে।");
            await showMainMenuReg(chatId);
            return true;
        }

        if (!isValidBDPhone(phone)) {
            await sendTgInlineKeyboardData(
                chatId,
                "❌ সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।\n" +
                "নম্বর অবশ্যই <code>01</code> দিয়ে শুরু হতে হবে এবং মোট ১১ সংখ্যার হতে হবে।\n" +
                "(যেমন: <code>01712345678</code>)",
                [[CANCEL_BTN[0]]]
            );
            return true;
        }
        state.phoneNumber = normalizeBDPhone(phone);
        state.step = "blood_group";
        tgRegisterMap.set(chatId, state);

        const bgRows = [["A+", "A-"], ["B+", "B-"], ["O+", "O-"], ["AB+", "AB-"]].map(row =>
            row.map(bg => ({ label: bg, data: `REG_BG:${bg}` }))
        );
        bgRows.push([CANCEL_BTN[0]]);
        await sendTgInlineKeyboardData(
            chatId,
            `✅ মোবাইল: <b>${state.phoneNumber}</b>\n` +
            `📍 ধাপ ৩/${TOTAL_STEPS}: রক্তের গ্রুপ\n\n` +
            `এখন আপনার <b>রক্তের গ্রুপ</b> নির্বাচন করুন:`,
            bgRows
        );
        return true;
    }

    // If user types text when a keyboard choice is expected, remind them
    await sendTgInlineKeyboardData(chatId,
        "👆 অনুগ্রহ করে উপরের বোতাম থেকে নির্বাচন করুন।",
        [[CANCEL_BTN[0]]]);
    return true;
}

/** Handle a callback query (button press) when in registration flow */
export async function handleTgRegisterCallback(chatId: string, data: string): Promise<boolean> {
    const state = tgRegisterMap.get(chatId);
    if (!state) return false;
    state.lastUpdated = Date.now();

    // ── Cancel ────────────────────────────────────────────────────────────────
    if (data === "REG_CANCEL") {
        tgRegisterMap.delete(chatId);
        await sendTgMessage(chatId, "❌ নিবন্ধন বাতিল করা হয়েছে।");
        await showMainMenuReg(chatId);
        return true;
    }

    // ── Blood group ───────────────────────────────────────────────────────────
    if (data.startsWith("REG_BG:")) {
        const bg = data.slice(7);
        state.bloodGroup = bg;
        state.step = "division";
        tgRegisterMap.set(chatId, state);

        const divisions = await getDivision();
        const divRows = chunkRows<{ label: string; data: string }>(
            divisions.map(d => ({ label: d.name, data: `REG_DIV:${d.id}` })),
            3
        );
        divRows.push([CANCEL_BTN[0]]);
        await sendTgInlineKeyboardData(chatId,
            `✅ রক্তের গ্রুপ: <b>${bg}</b>\n` +
            `📍 ধাপ ৪/${TOTAL_STEPS}: এলাকা\n\n` +
            `আপনার <b>বিভাগ</b> নির্বাচন করুন:`, divRows);
        return true;
    }

    // ── Division ──────────────────────────────────────────────────────────────
    if (data.startsWith("REG_DIV:")) {
        const divisionId = data.slice(8);
        const divisions = await getDivision();
        const div = divisions.find(d => d.id === divisionId);
        if (!div) {
            await sendTgMessage(chatId, "❌ বিভাগ খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।");
            return true;
        }
        state.divisionId = divisionId;
        state.divisionName = div.name;
        state.step = "district";
        tgRegisterMap.set(chatId, state);

        const districts = await getDistrict(divisionId);
        const distRows = chunkRows<{ label: string; data: string }>(
            districts.map(d => ({ label: d.name, data: `REG_DIST:${d.id}` })),
            3
        );
        distRows.push([CANCEL_BTN[0]]);
        await sendTgInlineKeyboardData(chatId,
            `✅ বিভাগ: <b>${div.name}</b>\n\nআপনার <b>জেলা</b> নির্বাচন করুন:`, distRows);
        return true;
    }

    // ── District ──────────────────────────────────────────────────────────────
    if (data.startsWith("REG_DIST:")) {
        const districtId = data.slice(9);
        const districts = await getDistrict(state.divisionId!);
        const dist = districts.find(d => d.id === districtId);
        if (!dist) {
            await sendTgMessage(chatId, "❌ জেলা খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।");
            return true;
        }
        state.districtId = districtId;
        state.districtName = dist.name;
        state.step = "thana";
        tgRegisterMap.set(chatId, state);

        const thanas = await getThana(districtId, state.divisionId);
        const thanaRows = chunkRows<{ label: string; data: string }>(
            thanas.map(t => ({ label: t.name, data: `REG_THANA:${t.id}` })),
            3
        );
        thanaRows.push([CANCEL_BTN[0]]);
        await sendTgInlineKeyboardData(chatId,
            `✅ জেলা: <b>${dist.name}</b>\n\nআপনার <b>উপজেলা/থানা</b> নির্বাচন করুন:`, thanaRows);
        return true;
    }

    // ── Thana ─────────────────────────────────────────────────────────────────
    if (data.startsWith("REG_THANA:")) {
        const thanaId = data.slice(10);
        const thanas = await getThana(state.districtId!, state.divisionId);
        const thana = thanas.find(t => t.id === thanaId);
        if (!thana) {
            await sendTgMessage(chatId, "❌ থানা খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।");
            return true;
        }
        state.thanaId = thanaId;
        state.thanaName = thana.name;
        state.latitude  = parseFloat(thana.latitude)  || 0;
        state.longitude = parseFloat(thana.longitude) || 0;
        state.step = "confirm";
        tgRegisterMap.set(chatId, state);

        const summary =
            `📋 <b>আপনার তথ্য যাচাই করুন:</b>\n` +
            `📍 ধাপ ৫/${TOTAL_STEPS}: নিশ্চিতকরণ\n\n` +
            `👤 নাম: <b>${state.fullName}</b>\n` +
            `📱 মোবাইল: <b>${state.phoneNumber}</b>\n` +
            `🩸 রক্তের গ্রুপ: <b>${state.bloodGroup}</b>\n` +
            `📍 বিভাগ: <b>${state.divisionName}</b>\n` +
            `🏙️ জেলা: <b>${state.districtName}</b>\n` +
            `🏘️ উপজেলা/থানা: <b>${thana.name}</b>\n\n` +
            `তথ্য সঠিক থাকলে নিশ্চিত করুন।`;

        await sendTgInlineKeyboardData(chatId, summary, [
            [{ label: "✅ নিশ্চিত করুন", data: "REG_CONFIRM:yes" }],
            [{ label: "🔄 আবার শুরু করুন", data: "REG_RESTART:" }],
            [{ label: "❌ বাতিল", data: "REG_CANCEL" }],
        ]);
        return true;
    }

    // ── Confirm ───────────────────────────────────────────────────────────────
    if (data === "REG_CONFIRM:yes") {
        try {
            const existing = await TelegramUserModel.findOne({ chatId });
            if (existing) {
                // Update existing record
                existing.fullName    = state.fullName!;
                existing.phoneNumber  = state.phoneNumber!;
                existing.bloodGroup  = state.bloodGroup!;
                existing.divisionId = state.divisionId!;
                existing.districtId = state.districtId!;
                existing.thanaId    = state.thanaId!;
                existing.latitude   = state.latitude!;
                existing.longitude  = state.longitude!;
                existing.location   = { type: "Point", coordinates: [state.longitude!, state.latitude!] };
                if (state.username)  existing.username  = state.username;
                if (state.firstName) existing.firstName = state.firstName;
                await existing.save();
            } else {
                await TelegramUserModel.create({
                    chatId,
                    username:    state.username    ?? null,
                    firstName:   state.firstName   ?? null,
                    fullName:    state.fullName!,
                    phoneNumber: state.phoneNumber!,
                    bloodGroup:  state.bloodGroup!,
                    divisionId:  state.divisionId!,
                    districtId:  state.districtId!,
                    thanaId:     state.thanaId!,
                    latitude:    state.latitude!,
                    longitude:   state.longitude!,
                    location: {
                        type: "Point",
                        coordinates: [state.longitude!, state.latitude!],
                    },
                });
            }

            tgRegisterMap.delete(chatId);

            await sendTgMessage(
                chatId,
                `🎉 <b>অভিনন্দন ${state.fullName}!</b>\n\n` +
                `আপনি সফলভাবে রক্তদাতা হিসেবে নিবন্ধিত হয়েছেন। 🩸\n\n` +
                `যখনই আপনার কাছাকাছি কেউ <b>${state.bloodGroup}</b> রক্তের প্রয়োজন অনুভব করবেন, ` +
                `আমরা আপনাকে জানাবো।\n\n` +
                `রক্তদান করে জীবন বাঁচান! ❤️`
            );
            await sendTgInlineKeyboard(
                chatId,
                "নিচের মেনু থেকে আরো কিছু করতে পারেন:",
                [["🔍 রক্তদাতা খুঁজুন", "❓ সাহায্য"], ["🌐 ওয়েবসাইট"]]
            );
        } catch (err) {
            console.error("[TG Register] Save error:", err);
            await sendTgMessage(chatId, "⚠️ নিবন্ধন সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
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
