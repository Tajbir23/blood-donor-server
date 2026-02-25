/**
 * Telegram Donor Registration Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Collects: name → blood group → division → district → thana
 * Saves to TelegramUserModel (MongoDB) with GeoJSON location.
 */

import { getDivision, getDistrict, getThana } from "../facebookBotHandler/address";
import { sendTgMessage, sendTgInlineKeyboard, sendTgInlineKeyboardData } from "./sendMessageToTgUser";
import TelegramUserModel from "../../models/telegram/telegramUserSchema";

// ── State ─────────────────────────────────────────────────────────────────────

type RegStep = "name" | "blood_group" | "division" | "district" | "thana" | "confirm";

interface TgRegisterState {
    step: RegStep;
    username?: string;
    firstName?: string;
    fullName?: string;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

// Chunk array into rows of given size
function chunkRows<T>(arr: T[], size: number): T[][] {
    const rows: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        rows.push(arr.slice(i, i + size));
    }
    return rows;
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
    tgRegisterMap.set(chatId, {
        step: "name",
        username: username ?? undefined,
        firstName: firstName ?? undefined,
        lastUpdated: Date.now(),
    });

    await sendTgMessage(
        chatId,
        "📝 <b>রক্তদাতা হিসেবে নিবন্ধন শুরু করা যাক!</b>\n\n" +
        "আপনার <b>পূর্ণ নাম</b> লিখুন:"
    );
}

/** Handle a plain text message when in registration flow */
export async function handleTgRegisterText(chatId: string, text: string): Promise<boolean> {
    const state = tgRegisterMap.get(chatId);
    if (!state) return false;
    state.lastUpdated = Date.now();

    if (state.step === "name") {
        const name = text.trim();
        if (name.length < 2) {
            await sendTgMessage(chatId, "❌ অনুগ্রহ করে সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর):");
            return true;
        }
        state.fullName = name;
        state.step = "blood_group";
        tgRegisterMap.set(chatId, state);

        await sendTgInlineKeyboardData(
            chatId,
            `✅ ধন্যবাদ <b>${name}</b>!\n\nএখন আপনার <b>রক্তের গ্রুপ</b> নির্বাচন করুন:`,
            [["A+", "A-"], ["B+", "B-"], ["O+", "O-"], ["AB+", "AB-"]].map(row =>
                row.map(bg => ({ label: bg, data: `REG_BG:${bg}` }))
            )
        );
        return true;
    }

    // If user types text when a keyboard choice is expected, remind them
    await sendTgMessage(chatId, "👆 অনুগ্রহ করে উপরের বোতাম থেকে নির্বাচন করুন।");
    return true;
}

/** Handle a callback query (button press) when in registration flow */
export async function handleTgRegisterCallback(chatId: string, data: string): Promise<boolean> {
    const state = tgRegisterMap.get(chatId);
    if (!state) return false;
    state.lastUpdated = Date.now();

    // ── Blood group ───────────────────────────────────────────────────────────
    if (data.startsWith("REG_BG:")) {
        const bg = data.slice(7);
        state.bloodGroup = bg;
        state.step = "division";
        tgRegisterMap.set(chatId, state);

        const divisions = await getDivision();
        const rows = chunkRows<{ label: string; data: string }>(
            divisions.map(d => ({ label: d.name, data: `REG_DIV:${d.id}` })),
            3
        );
        await sendTgInlineKeyboardData(chatId, `✅ রক্তের গ্রুপ: <b>${bg}</b>\n\nআপনার <b>বিভাগ</b> নির্বাচন করুন:`, rows);
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
        const rows = chunkRows<{ label: string; data: string }>(
            districts.map(d => ({ label: d.name, data: `REG_DIST:${d.id}` })),
            3
        );
        await sendTgInlineKeyboardData(chatId, `✅ বিভাগ: <b>${div.name}</b>\n\nআপনার <b>জেলা</b> নির্বাচন করুন:`, rows);
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
        const rows = chunkRows<{ label: string; data: string }>(
            thanas.map(t => ({ label: t.name, data: `REG_THANA:${t.id}` })),
            3
        );
        await sendTgInlineKeyboardData(chatId, `✅ জেলা: <b>${dist.name}</b>\n\nআপনার <b>উপজেলা/থানা</b> নির্বাচন করুন:`, rows);
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
            `📋 <b>আপনার তথ্য:</b>\n\n` +
            `👤 নাম: <b>${state.fullName}</b>\n` +
            `🩸 রক্তের গ্রুপ: <b>${state.bloodGroup}</b>\n` +
            `📍 বিভাগ: <b>${state.divisionName}</b>\n` +
            `🏙️ জেলা: <b>${state.districtName}</b>\n` +
            `🏘️ উপজেলা/থানা: <b>${thana.name}</b>\n\n` +
            `তথ্য সঠিক থাকলে <b>নিশ্চিত করুন</b>।`;

        await sendTgInlineKeyboardData(chatId, summary, [
            [{ label: "✅ নিশ্চিত করুন", data: "REG_CONFIRM:yes" }],
            [{ label: "🔄 আবার শুরু করুন", data: "REG_RESTART:" }],
        ]);
        return true;
    }

    // ── Confirm ───────────────────────────────────────────────────────────────
    if (data === "REG_CONFIRM:yes") {
        try {
            const existing = await TelegramUserModel.findOne({ chatId });
            if (existing) {
                // Update existing record
                existing.fullName   = state.fullName!;
                existing.bloodGroup = state.bloodGroup!;
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
                    username:   state.username   ?? null,
                    firstName:  state.firstName  ?? null,
                    fullName:   state.fullName!,
                    bloodGroup: state.bloodGroup!,
                    divisionId: state.divisionId!,
                    districtId: state.districtId!,
                    thanaId:    state.thanaId!,
                    latitude:   state.latitude!,
                    longitude:  state.longitude!,
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
