"use strict";
/**
 * Telegram AI Conversation Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Mirrors the Facebook aiConversationHandler but uses Telegram sending helpers.
 * Shares the same TF.js intent classifier and entity extractor.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTgAiState = clearTgAiState;
exports.handleTgLocationSuggest = handleTgLocationSuggest;
exports.handleTgAiMessage = handleTgAiMessage;
const intentClassifier_1 = require("../facebookBotHandler/ai/intentClassifier");
const entityExtractor_1 = require("../facebookBotHandler/ai/entityExtractor");
const faqKnowledgeBase_1 = require("../facebookBotHandler/ai/faqKnowledgeBase");
const sendMessageToTgUser_1 = require("./sendMessageToTgUser");
const telegramRegisterHandler_1 = require("./telegramRegisterHandler");
const findNearAvailableDonor_1 = __importDefault(require("../donor/findNearAvailableDonor"));
const tgStateMap = new Map();
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
function getState(chatId) {
    const existing = tgStateMap.get(chatId);
    if (existing && Date.now() - existing.lastUpdated < STATE_TTL_MS) {
        return existing;
    }
    const fresh = {
        intent: null, bloodGroup: null, location: null,
        bagCount: null, isUrgent: false, awaitingInput: null,
        lastUpdated: Date.now(),
    };
    tgStateMap.set(chatId, fresh);
    return fresh;
}
function updateState(chatId, updates) {
    const state = getState(chatId);
    Object.assign(state, updates, { lastUpdated: Date.now() });
    tgStateMap.set(chatId, state);
}
function clearTgAiState(chatId) {
    tgStateMap.delete(chatId);
}
/**
 * Called when a user selects a LOC_SUGGEST suggestion button.
 * Finds the entity by ID, stores it in state, and continues the flow.
 */
async function handleTgLocationSuggest(chatId, locationId) {
    const entity = (0, entityExtractor_1.findLocationById)(locationId);
    if (!entity) {
        await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "এলাকা নির্ধারণ করা যায়নি। আপনার এলাকার নাম লিখুন:");
        return;
    }
    updateState(chatId, { location: entity, awaitingInput: null });
    const fresh = getState(chatId);
    const coords = resolveCoordinates(entity);
    if (fresh.bloodGroup && coords) {
        await sendDonorResults(chatId, coords.latitude, coords.longitude, fresh.bloodGroup, fresh.bagCount, fresh.isUrgent);
        return;
    }
    if (!fresh.bloodGroup) {
        await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, `✅ <b>${entity.name}</b> বোঝা গেছে। এখন রক্তের গ্রুপ বেছে নিন:`, BLOOD_GROUP_ROWS);
        updateState(chatId, { awaitingInput: "blood_group" });
        return;
    }
    if (!coords) {
        await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `${entity.name} এর সঠিক অবস্থান পাওয়া যায়নি। আরো নির্দিষ্ট এলাকার নাম লিখুন:`);
        updateState(chatId, { awaitingInput: "location" });
    }
}
// ── Coordinate resolver ───────────────────────────────────────────────────────
function resolveCoordinates(loc) {
    let coords = null;
    if (loc.type === "thana")
        coords = (0, entityExtractor_1.getThanaCoordinates)(loc.id);
    else if (loc.type === "district")
        coords = (0, entityExtractor_1.getDistrictCoordinates)(loc.id);
    else if (loc.type === "division")
        coords = (0, entityExtractor_1.getDivisionCoordinates)(loc.id);
    if (!coords || coords.latitude === "0" || coords.longitude === "0")
        return null;
    return { latitude: parseFloat(coords.latitude), longitude: parseFloat(coords.longitude) };
}
// ── Blood group quick-reply rows (2 per row) ──────────────────────────────────
const BLOOD_GROUP_ROWS = [["A+", "A-"], ["B+", "B-"], ["O+", "O-"], ["AB+", "AB-"]];
// ── Find & send donor results ─────────────────────────────────────────────────
async function sendDonorResults(chatId, lat, lon, bloodGroup, bagCount, isUrgent) {
    const urgentTag = isUrgent ? "🚨 জরুরি! " : "";
    const bagInfo = bagCount ? ` (${bagCount} ব্যাগ প্রয়োজন)` : "";
    await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `${urgentTag}🔍 <b>${bloodGroup}</b> রক্তের ডোনার খোঁজা হচ্ছে${bagInfo}…`);
    try {
        const { donors: siteDonors } = await (0, findNearAvailableDonor_1.default)(lat, lon, bloodGroup);
        const allDonors = siteDonors.slice(0, 5);
        if (allDonors.length === 0) {
            let msg = `😔 দুঃখিত! আপনার কাছাকাছি ১৫ কিমি এর মধ্যে কোনো <b>${bloodGroup}</b> রক্তের ডোনার পাওয়া যায়নি।\n\n`;
            if (isUrgent)
                msg += "⚠️ জরুরি অবস্থায়: নিকটস্থ হাসপাতালের ব্লাড ব্যাংকে যোগাযোগ করুন।\n\n";
            msg += "আরো বড় এলাকায় খুঁজতে আমাদের ওয়েবসাইট ব্যবহার করুন।";
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, msg);
        }
        else {
            let msg = `✅ <b>${bloodGroup}</b> রক্তের ${allDonors.length}জন ডোনার পাওয়া গেছে!\n`;
            if (bagCount)
                msg += `📋 প্রয়োজন: ${bagCount} ব্যাগ\n`;
            msg += "\n";
            allDonors.forEach((donor, i) => {
                var _a;
                const name = donor.fullName || donor.name || "ডোনার";
                const phone = donor.phoneNumber || donor.phone || "";
                const distKm = (_a = donor.distanceKm) !== null && _a !== void 0 ? _a : (donor.distance ? (donor.distance / 1000).toFixed(1) + " km" : "");
                msg += `${i + 1}. 👤 <b>${name}</b>`;
                if (distKm)
                    msg += `  📍 ${distKm}`;
                if (phone)
                    msg += `\n   📞 ${phone}`;
                msg += "\n\n";
            });
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, msg);
        }
        await (0, sendMessageToTgUser_1.sendTgUrlButton)(chatId, "আরো ডোনার খুঁজতে আমাদের ওয়েবসাইট ব্যবহার করুন:", "ওয়েবসাইটে দেখুন →", `${process.env.FRONTEND_URL}/blood-donation?bloodGroup=${encodeURIComponent(bloodGroup)}`);
    }
    catch (err) {
        console.error("[TG AI] Donor search error:", err);
        await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "ডোনার খুঁজতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
    clearTgAiState(chatId);
}
// ── Main AI handler ───────────────────────────────────────────────────────────
async function handleTgAiMessage(chatId, text) {
    try {
        const state = getState(chatId);
        // ── Awaiting blood group ──────────────────────────────────────────────
        if (state.awaitingInput === "blood_group") {
            const bg = (0, entityExtractor_1.extractBloodGroup)(text);
            if (bg) {
                updateState(chatId, { bloodGroup: bg, awaitingInput: null });
                const fresh = getState(chatId);
                if (fresh.location) {
                    const coords = resolveCoordinates(fresh.location);
                    if (coords) {
                        await sendDonorResults(chatId, coords.latitude, coords.longitude, bg, fresh.bagCount, fresh.isUrgent);
                        return true;
                    }
                }
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `<b>${bg}</b> বোঝা গেছে! এখন আপনার এলাকার নাম লিখুন (যেমন: ঢাকা, মিরপুর, চট্টগ্রাম):`);
                updateState(chatId, { awaitingInput: "location" });
                return true;
            }
            else {
                await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, "রক্তের গ্রুপ বেছে নিন:", BLOOD_GROUP_ROWS);
                return true;
            }
        }
        // ── Awaiting location ─────────────────────────────────────────────────
        if (state.awaitingInput === "location") {
            const { entity: loc } = (0, entityExtractor_1.extractLocation)(text);
            if (loc) {
                updateState(chatId, { location: loc, awaitingInput: null });
                const fresh = getState(chatId);
                if (fresh.bloodGroup) {
                    const coords = resolveCoordinates(loc);
                    if (coords) {
                        await sendDonorResults(chatId, coords.latitude, coords.longitude, fresh.bloodGroup, fresh.bagCount, fresh.isUrgent);
                        return true;
                    }
                    await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `${loc.name} এর সঠিক অবস্থান পাওয়া যায়নি। আরো নির্দিষ্ট এলাকার নাম দিন (যেমন: মিরপুর-১০, গুলশান):`);
                    updateState(chatId, { awaitingInput: "location" });
                    return true;
                }
                await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, `${loc.name} বোঝা গেছে। এখন রক্তের গ্রুপ বেছে নিন:`, BLOOD_GROUP_ROWS);
                updateState(chatId, { awaitingInput: "blood_group" });
                return true;
            }
            else {
                // Exact match failed → fuzzy suggestions as inline buttons
                const suggestions = (0, entityExtractor_1.suggestLocations)(text, 5);
                if (suggestions.length > 0) {
                    const rows = suggestions.map(s => [{ label: `📍 ${s.name}`, data: `LOC_SUGGEST:${s.id}` }]);
                    await (0, sendMessageToTgUser_1.sendTgInlineKeyboardData)(chatId, "এলাকাটি সঠিকভাবে বোঝা যায়নি। এগুলোর মধ্যে কোনটি বোঝাতে চেয়েছেন?", rows);
                }
                else {
                    await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "এলাকার নাম বুঝতে পারিনি। বাংলায় বা ইংরেজিতে এলাকার নাম লিখুন (যেমন: ঢাকা, Mirpur, Chittagong):");
                }
                return true;
            }
        }
        // ── Classify intent ───────────────────────────────────────────────────
        const prediction = await (0, intentClassifier_1.predictIntent)(text);
        console.log(`[TG AI] Intent: ${prediction.intent} (${prediction.confidence}) for: "${text}"`);
        // ── BLOOD_INFO ────────────────────────────────────────────────────────
        if (prediction.intent === "BLOOD_INFO") {
            const faq = (0, faqKnowledgeBase_1.findFaqAnswer)(text);
            if (faq) {
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, faq.answer);
                if (faq.quickReplies && faq.quickReplies.length > 0) {
                    const rows = [faq.quickReplies.slice(0, 2), faq.quickReplies.slice(2, 4)].filter(r => r.length > 0);
                    await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, "আরো কিছু জানতে চান?", rows);
                }
            }
            else {
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "🩸 রক্তদান সম্পর্কে আপনার প্রশ্নটি আরো স্পষ্ট করে লিখুন।\n\n" +
                    "উদাহরণ:\n• রক্ত দেওয়ার বয়স কত?\n• কতদিন পর রক্ত দেওয়া যায়?\n• ট্যাটু করলে কি রক্ত দেওয়া যায়?\n• রক্ত দেওয়ার পর কি খাব?");
            }
            return true;
        }
        // ── FIND_BLOOD ────────────────────────────────────────────────────────
        if (prediction.intent === "FIND_BLOOD") {
            const entities = (0, entityExtractor_1.extractEntities)(text);
            updateState(chatId, {
                intent: "FIND_BLOOD",
                bloodGroup: entities.bloodGroup,
                location: entities.location,
                bagCount: entities.bagCount,
                isUrgent: entities.isUrgent,
            });
            const fresh = getState(chatId);
            const resolvedCoords = fresh.location ? resolveCoordinates(fresh.location) : null;
            if (fresh.bloodGroup && resolvedCoords) {
                await sendDonorResults(chatId, resolvedCoords.latitude, resolvedCoords.longitude, fresh.bloodGroup, fresh.bagCount, fresh.isUrgent);
                return true;
            }
            if (!fresh.bloodGroup) {
                const locationHint = fresh.location ? ` (${fresh.location.name} এলাকায়)` : "";
                const prefix = fresh.isUrgent ? "🚨 " : "";
                await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, `${prefix}আপনি রক্তদাতা খুঁজছেন${locationHint}। কোন গ্রুপের রক্ত দরকার?`, BLOOD_GROUP_ROWS);
                updateState(chatId, { awaitingInput: "blood_group" });
                return true;
            }
            if (!fresh.location || !resolvedCoords) {
                const bagHint = fresh.bagCount ? ` (${fresh.bagCount} ব্যাগ)` : "";
                const prefix = fresh.isUrgent ? "🚨 " : "";
                await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `${prefix}আপনি <b>${fresh.bloodGroup}</b> রক্তের ডোনার খুঁজছেন${bagHint}। আপনার এলাকার নাম লিখুন (যেমন: ঢাকা, মিরপুর, চট্টগ্রাম):`);
                updateState(chatId, { awaitingInput: "location" });
                return true;
            }
            return true;
        }
        // ── REGISTER_DONOR ────────────────────────────────────────────────────
        if (prediction.intent === "REGISTER_DONOR") {
            clearTgAiState(chatId);
            // Trigger in-chat registration (username/firstName not available here; will use defaults)
            await (0, telegramRegisterHandler_1.startTgRegistration)(chatId);
            return true;
        }
        // ── UPDATE_DONATION ───────────────────────────────────────────────────
        if (prediction.intent === "UPDATE_DONATION") {
            clearTgAiState(chatId);
            await (0, sendMessageToTgUser_1.sendTgUrlButton)(chatId, "শেষ রক্তদানের তারিখ আপডেট করতে ওয়েবসাইটে লগইন করুন:", "ওয়েবসাইটে যান →", `${process.env.FRONTEND_URL}/dashboard`);
            return true;
        }
        // ── REQUEST_BLOOD ─────────────────────────────────────────────────────
        if (prediction.intent === "REQUEST_BLOOD") {
            clearTgAiState(chatId);
            await (0, sendMessageToTgUser_1.sendTgUrlButton)(chatId, "রক্তের জন্য আবেদন করতে নিচের বোতামে ক্লিক করুন:", "রক্তের আবেদন করুন", `${process.env.FRONTEND_URL}/blood-donation`);
            return true;
        }
        // ── GREET ─────────────────────────────────────────────────────────────
        if (prediction.intent === "GREET") {
            clearTgAiState(chatId);
            // Natural, warm casual reply before showing the menu
            const greetings = [
                "আলহামদুলিল্লাহ, ভালো আছি! আপনি কেমন আছেন? 😊",
                "ওয়া আলাইকুমাসসালাম! ভালো আছি, ধন্যবাদ! 😊",
                "হেই! ভালো আছেন? আমি LifeDrop Bot, আপনার সেবায় সদা প্রস্তুত! 😊",
                "হ্যালো! আপনার সাথে কথা বলতে পেরে ভালো লাগছে! 😊",
            ];
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, `${randomGreeting}\n\n` +
                `আমি <b>LifeDrop Bot</b> 🩸 — বাংলাদেশে রক্তদাতা খোঁজার সহায়ক।\n\n` +
                `বাংলা বা ইংরেজিতে সরাসরি লিখুন:\n` +
                `<i>"আমার A+ রক্ত দরকার ঢাকায়"</i>\n` +
                `<i>"রক্তদানের বয়স কত?"</i>\n` +
                `<i>"I want to donate blood"</i>\n\n` +
                `অথবা নিচের মেনু ব্যবহার করুন 👇`);
            await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, "নিচের মেনু থেকে বেছে নিন:", [["🔍 রক্তদাতা খুঁজুন", "📝 ডোনার নিবন্ধন"], ["❓ সাহায্য", "🌐 ওয়েবসাইট"]]);
            return true;
        }
        // ── HELP ──────────────────────────────────────────────────────────────
        if (prediction.intent === "HELP") {
            clearTgAiState(chatId);
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "🩸 <b>LifeDrop Bot যা করতে পারে:</b>\n\n" +
                "🔍 <b>রক্তদাতা খোঁজা:</b>\n" +
                "   <i>\"A+ রক্ত দরকার ঢাকায়\"</i>\n" +
                "   <i>\"চট্টগ্রাম মেডিকেলে B+ ব্লাড লাগবে\"</i>\n\n" +
                "📝 <b>ডোনার নিবন্ধন:</b>\n" +
                "   <i>\"আমি রক্তদাতা হতে চাই\"</i>\n\n" +
                "❓ <b>রক্তদান সম্পর্কে প্রশ্ন:</b>\n" +
                "   <i>\"কতদিন পর রক্ত দেওয়া যায়?\"</i>\n" +
                "   <i>\"ট্যাটু করলে কি রক্ত দেওয়া যায়?\"</i>\n" +
                "   <i>\"রক্ত দেওয়ার পর কী খাব?\"</i>");
            return true;
        }
        // ── THANK_YOU ──────────────────────────────────────────────────────
        if (prediction.intent === "THANK_YOU") {
            clearTgAiState(chatId);
            const thankReplies = [
                "😊 স্বাগতম! আবার কোনো সাহায্য লাগলে বলবেন।",
                "🩸 আপনার সেবায় সদা প্রস্তুত! আল্লাহ হাফেজ।",
                "💙 ধন্যবাদ! আপনার মতো মানুষরাই সমাজকে এগিয়ে নিয়ে যায়। আবার দেখা হবে!",
                "😊 যেকোনো সময় সাহায্যের জন্য আমি এখানে আছি!",
            ];
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, thankReplies[Math.floor(Math.random() * thankReplies.length)]);
            return true;
        }
        // ── UNKNOWN: FAQ fallback, then website link ──────────────────────────
        const faq = (0, faqKnowledgeBase_1.findFaqAnswer)(text);
        if (faq) {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, faq.answer);
            if (faq.quickReplies && faq.quickReplies.length > 0) {
                const rows = [faq.quickReplies.slice(0, 2), faq.quickReplies.slice(2, 4)].filter(r => r.length > 0);
                await (0, sendMessageToTgUser_1.sendTgInlineKeyboard)(chatId, "আরো কিছু জানতে চান?", rows);
            }
            return true;
        }
        await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "🩸 আপনার প্রশ্নটি বুঝতে পারিনি, তবে আমাদের ওয়েবসাইটে গিয়ে সহজেই রক্তদাতা খুঁজে পাবেন।");
        await (0, sendMessageToTgUser_1.sendTgUrlButton)(chatId, "ওয়েবসাইটে সকল বিভাগ অনুযায়ী রক্তদাতা খুঁজুন:", "রক্তদাতা খুঁজুন →", `${process.env.FRONTEND_URL}/blood-donation`);
        return true;
    }
    catch (err) {
        console.error("[TG AI] handleTgAiMessage error:", err);
        try {
            await (0, sendMessageToTgUser_1.sendTgMessage)(chatId, "⚠️ কিছু একটা সমস্যা হয়েছে।");
            await (0, sendMessageToTgUser_1.sendTgUrlButton)(chatId, "ওয়েবসাইট থেকে রক্তদাতা খুঁজুন:", "ওয়েবসাইটে যান →", `${process.env.FRONTEND_URL}/blood-donation`);
        }
        catch ( /* ignore */_a) { /* ignore */ }
        return true;
    }
}
