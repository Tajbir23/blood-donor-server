"use strict";
/**
 * AI Conversation Handler for Facebook Messenger Bot
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles natural-language messages in Bengali and English.
 * Uses a locally-trained TensorFlow.js intent classifier combined with
 * a rule-based entity extractor – NO third-party AI API keys required.
 *
 * Supported intents:
 *   FIND_BLOOD      – searches nearby donors (with hospital, bag count, urgency)
 *   BLOOD_INFO      – answers FAQ about eligibility, intervals, tattoo, food etc.
 *   REGISTER_DONOR  – directs to registration page
 *   UPDATE_DONATION – triggers donation-date update flow
 *   REQUEST_BLOOD   – directs to blood request form
 *   GREET / HELP    – standard welcome / menu
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAiMessage = handleAiMessage;
exports.clearAiState = clearAiState;
const intentClassifier_1 = require("./intentClassifier");
const entityExtractor_1 = require("./entityExtractor");
const faqKnowledgeBase_1 = require("./faqKnowledgeBase");
const fbUserSchema_1 = __importDefault(require("../../../models/user/fbUserSchema"));
const sendMessageToFbUser_1 = __importStar(require("../sendMessageToFbUser"));
const quickReply_1 = __importDefault(require("../quickReply"));
const findNearAvailableDonor_1 = __importDefault(require("../../donor/findNearAvailableDonor"));
const findNearFbDonar_1 = __importDefault(require("../findNearFbDonar"));
// In-memory state per user (psId → state)
const aiStateMap = new Map();
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
function getState(psId) {
    const existing = aiStateMap.get(psId);
    if (existing && Date.now() - existing.lastUpdated < STATE_TTL_MS) {
        return existing;
    }
    const fresh = {
        intent: null,
        bloodGroup: null,
        location: null,
        bagCount: null,
        isUrgent: false,
        awaitingInput: null,
        lastUpdated: Date.now(),
    };
    aiStateMap.set(psId, fresh);
    return fresh;
}
function updateState(psId, updates) {
    const state = getState(psId);
    Object.assign(state, updates, { lastUpdated: Date.now() });
    aiStateMap.set(psId, state);
}
function clearState(psId) {
    aiStateMap.delete(psId);
}
// ── Helper: load user's registered profile location ───────────────────────────
async function getProfileLocation(psId) {
    try {
        const profile = await fbUserSchema_1.default.findOne({ psId }).lean();
        if (profile && profile.latitude && profile.longitude) {
            return { lat: profile.latitude, lon: profile.longitude };
        }
        return null;
    }
    catch (_a) {
        return null;
    }
}
// ── Helper: find donors and send results ─────────────────────────────────────
async function sendDonorResults(psId, lat, lon, bloodGroup, bagCount, isUrgent) {
    const urgentTag = isUrgent ? "🚨 জরুরি! " : "";
    const bagInfo = bagCount ? ` (${bagCount} ব্যাগ প্রয়োজন)` : "";
    await (0, sendMessageToFbUser_1.default)(psId, `${urgentTag}🔍 ${bloodGroup} রক্তের ডোনার খোঁজা হচ্ছে${bagInfo}…`);
    try {
        // Search website donors first, then FB-registered donors
        const { donors: siteDonors } = await (0, findNearAvailableDonor_1.default)(lat, lon, bloodGroup);
        const fbDonors = await (0, findNearFbDonar_1.default)(lat, lon, bloodGroup);
        const allDonors = [
            ...siteDonors.slice(0, 3),
            ...fbDonors.slice(0, 2),
        ];
        if (allDonors.length === 0) {
            let noResultMsg = `😔 দুঃখিত! আপনার কাছাকাছি ১৫ কিমি এর মধ্যে কোনো ${bloodGroup} রক্তের ডোনার পাওয়া যায়নি।\n\n`;
            if (isUrgent) {
                noResultMsg += "⚠️ জরুরি অবস্থায়: নিকটস্থ হাসপাতালের ব্লাড ব্যাংকে যোগাযোগ করুন।\n\n";
            }
            noResultMsg += "আরো বড় এলাকায় খুঁজতে আমাদের ওয়েবসাইট ব্যবহার করুন।";
            await (0, sendMessageToFbUser_1.default)(psId, noResultMsg);
            await (0, sendMessageToFbUser_1.sendUrlButtonToFbUser)(psId, "ওয়েবসাইটে আরো ডোনার খুঁজুন", "ডোনার খুঁজুন", `${process.env.FRONTEND_URL}/blood-donation?bloodGroup=${encodeURIComponent(bloodGroup)}`);
        }
        else {
            let msg = `✅ ${bloodGroup} রক্তের ${allDonors.length}জন ডোনার পাওয়া গেছে!\n`;
            if (bagCount)
                msg += `📋 আপনার প্রয়োজন: ${bagCount} ব্যাগ\n`;
            msg += "\n";
            allDonors.slice(0, 5).forEach((donor, i) => {
                var _a;
                const name = donor.fullName || donor.name || "ডোনার";
                const phone = donor.phoneNumber || donor.phone || "";
                const distKm = (_a = donor.distanceKm) !== null && _a !== void 0 ? _a : (donor.distance ? (donor.distance / 1000).toFixed(1) + " km" : "");
                msg += `${i + 1}. 👤 ${name}`;
                if (distKm)
                    msg += `  📍 ${distKm}`;
                if (phone)
                    msg += `\n   📞 ${phone}`;
                msg += "\n\n";
            });
            msg += "আরো ডোনার খুঁজতে আমাদের ওয়েবসাইট ব্যবহার করুন।";
            await (0, sendMessageToFbUser_1.default)(psId, msg);
            await (0, sendMessageToFbUser_1.sendUrlButtonToFbUser)(psId, "আরো ডোনার দেখুন", "ওয়েবসাইটে দেখুন", `${process.env.FRONTEND_URL}/blood-donation?bloodGroup=${encodeURIComponent(bloodGroup)}`);
        }
    }
    catch (err) {
        console.error("[AI] Donor search error:", err);
        await (0, sendMessageToFbUser_1.default)(psId, "ডোনার খুঁজতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
    clearState(psId);
}
// ── Get coordinates from location entity ─────────────────────────────────────
function resolveCoordinates(loc) {
    let coords = null;
    if (loc.type === "thana") {
        coords = (0, entityExtractor_1.getThanaCoordinates)(loc.id);
    }
    else if (loc.type === "district") {
        coords = (0, entityExtractor_1.getDistrictCoordinates)(loc.id);
    }
    else if (loc.type === "division") {
        coords = (0, entityExtractor_1.getDivisionCoordinates)(loc.id);
    }
    if (!coords ||
        coords.latitude === "0" ||
        coords.longitude === "0") {
        return null;
    }
    return {
        latitude: parseFloat(coords.latitude),
        longitude: parseFloat(coords.longitude),
    };
}
// ── Main AI message handler ───────────────────────────────────────────────────
async function handleAiMessage(psId, text) {
    /**
     * Returns true  → AI handled the message (caller should not run fallback).
     * Returns false → AI could not handle it (caller runs normal flow).
     */
    try {
        const state = getState(psId);
        // ── If we're waiting for specific input, handle it directly ──────────
        if (state.awaitingInput === "blood_group") {
            const bg = (0, entityExtractor_1.extractBloodGroup)(text);
            if (bg) {
                updateState(psId, { bloodGroup: bg, awaitingInput: null });
                const fresh = getState(psId);
                // 1. Location already in conversation state
                if (fresh.location) {
                    const coords = resolveCoordinates(fresh.location);
                    if (coords) {
                        await sendDonorResults(psId, coords.latitude, coords.longitude, bg, fresh.bagCount, fresh.isUrgent);
                        return true;
                    }
                }
                // 2. Fallback: use location stored in user's registered profile
                const profile = await getProfileLocation(psId);
                if (profile) {
                    await (0, sendMessageToFbUser_1.default)(psId, `${bg} রক্তের গ্রুপ বোঝা গেছে। আপনার প্রোফাইলে সংরক্ষিত এলাকায় ডোনার খোঁজা হচ্ছে…`);
                    await sendDonorResults(psId, profile.lat, profile.lon, bg, fresh.bagCount, fresh.isUrgent);
                    return true;
                }
                // 3. Ask for location
                await (0, sendMessageToFbUser_1.default)(psId, `আপনার রক্তের গ্রুপ ${bg} বোঝা গেছে। এখন আপনার এলাকার নাম বলুন (যেমন: ঢাকা, মিরপুর, চট্টগ্রাম):`);
                updateState(psId, { awaitingInput: "location" });
                return true;
            }
            else {
                await (0, quickReply_1.default)(psId, "রক্তের গ্রুপ সঠিকভাবে বুঝতে পারিনি। নিচের বোতাম থেকে বেছে নিন:", ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]);
                return true;
            }
        }
        if (state.awaitingInput === "location") {
            const { entity: loc } = (0, entityExtractor_1.extractLocation)(text);
            if (loc) {
                updateState(psId, { location: loc, awaitingInput: null });
                const fresh = getState(psId);
                if (fresh.bloodGroup) {
                    const coords = resolveCoordinates(loc);
                    if (coords) {
                        await sendDonorResults(psId, coords.latitude, coords.longitude, fresh.bloodGroup, fresh.bagCount, fresh.isUrgent);
                        return true;
                    }
                    else {
                        await (0, sendMessageToFbUser_1.default)(psId, `${loc.name} এর জন্য সঠিক অবস্থান পাওয়া যায়নি। আরো নির্দিষ্ট এলাকার নাম দিন (যেমন: মিরপুর, গুলশান):`);
                        updateState(psId, { awaitingInput: "location" });
                        return true;
                    }
                }
                await (0, quickReply_1.default)(psId, `${loc.name} বোঝা গেছে। এখন রক্তের গ্রুপ বেছে নিন:`, ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]);
                updateState(psId, { awaitingInput: "blood_group" });
                return true;
            }
            else {
                // Exact match failed → fuzzy suggestions
                const suggestions = (0, entityExtractor_1.suggestLocations)(text, 5);
                if (suggestions.length > 0) {
                    const names = suggestions.map(s => s.name.slice(0, 20)); // FB quick-reply max 20 chars
                    await (0, quickReply_1.default)(psId, "এলাকাটি সঠিকভাবে বোঝা যায়নি। এগুলোর মধ্যে কোনটি বোঝাতে চেয়েছেন?", names);
                }
                else {
                    await (0, sendMessageToFbUser_1.default)(psId, "এলাকার নাম বুঝতে পারিনি। অনুগ্রহ করে বাংলায় বা ইংরেজিতে এলাকার নাম বলুন (যেমন: ঢাকা, মিরপুর, Chittagong):");
                }
                return true;
            }
        }
        // ── Fresh message: classify intent ────────────────────────────────────
        const prediction = await (0, intentClassifier_1.predictIntent)(text);
        console.log(`[AI] Intent: ${prediction.intent} (conf: ${prediction.confidence}) for: "${text}"`);
        // ── BLOOD_INFO – FAQ / general questions ──────────────────────────────
        if (prediction.intent === "BLOOD_INFO") {
            const faqEntry = (0, faqKnowledgeBase_1.findFaqAnswer)(text);
            if (faqEntry) {
                await (0, sendMessageToFbUser_1.default)(psId, faqEntry.answer);
                if (faqEntry.quickReplies && faqEntry.quickReplies.length > 0) {
                    await (0, quickReply_1.default)(psId, "আরো কিছু জানতে চান?", faqEntry.quickReplies);
                }
            }
            else {
                await (0, sendMessageToFbUser_1.default)(psId, "🩸 রক্তদান সম্পর্কে আপনার প্রশ্নটি আরো স্পষ্ট করে লিখুন।\n\n" +
                    "উদাহরণ:\n" +
                    "• \"রক্ত দেওয়ার বয়স কত?\"\n" +
                    "• \"কতদিন পর রক্ত দেওয়া যায়?\"\n" +
                    "• \"ট্যাটু করলে কি রক্ত দেওয়া যায়?\"\n" +
                    "• \"রক্ত দেওয়ার পর কি খাব?\"");
                await (0, quickReply_1.default)(psId, "অথবা মেনু থেকে বেছে নিন:", [
                    "Find Blood", "Register", "Donate Blood",
                ]);
            }
            return true;
        }
        // ── FIND_BLOOD ────────────────────────────────────────────────────────
        if (prediction.intent === "FIND_BLOOD") {
            const entities = (0, entityExtractor_1.extractEntities)(text);
            console.log("[AI] Entities:", entities);
            updateState(psId, {
                intent: "FIND_BLOOD",
                bloodGroup: entities.bloodGroup,
                location: entities.location,
                bagCount: entities.bagCount,
                isUrgent: entities.isUrgent,
            });
            const freshState = getState(psId);
            // ── Resolve coordinates: text-extracted location takes priority ──
            const resolvedCoords = freshState.location ? resolveCoordinates(freshState.location) : null;
            // ── If both blood group and coordinates are known, search now ─────
            if (freshState.bloodGroup && resolvedCoords) {
                await sendDonorResults(psId, resolvedCoords.latitude, resolvedCoords.longitude, freshState.bloodGroup, freshState.bagCount, freshState.isUrgent);
                return true;
            }
            // ── No blood group in text → ask (profile location will be used later) ──
            if (!freshState.bloodGroup) {
                const locationHint = freshState.location
                    ? ` (${freshState.location.name} এলাকায়)` : "";
                const urgentPrefix = freshState.isUrgent ? "🚨 " : "";
                await (0, quickReply_1.default)(psId, `${urgentPrefix}আপনি রক্তদাতা খুঁজছেন${locationHint}। কোন গ্রুপের রক্ত দরকার?`, ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]);
                updateState(psId, { awaitingInput: "blood_group" });
                return true;
            }
            // ── Blood group known but no location in text ─────────────────────
            if (!freshState.location || !resolvedCoords) {
                const bagHint = freshState.bagCount ? ` (${freshState.bagCount} ব্যাগ)` : "";
                const urgentPrefix = freshState.isUrgent ? "🚨 " : "";
                // Try profile location first
                const profile = await getProfileLocation(psId);
                if (profile) {
                    await (0, sendMessageToFbUser_1.default)(psId, `${urgentPrefix}আপনার প্রোফাইলে সংরক্ষিত এলাকায় ${freshState.bloodGroup} ডোনার খোঁজা হচ্ছে${bagHint}…`);
                    await sendDonorResults(psId, profile.lat, profile.lon, freshState.bloodGroup, freshState.bagCount, freshState.isUrgent);
                    return true;
                }
                // No profile — ask for location
                await (0, sendMessageToFbUser_1.default)(psId, `${urgentPrefix}আপনি ${freshState.bloodGroup} রক্তের ডোনার খুঁজছেন${bagHint}। আপনার এলাকার নাম বলুন (যেমন: ঢাকা, মিরপুর, চট্টগ্রাম):`);
                updateState(psId, { awaitingInput: "location" });
                return true;
            }
            return true;
        }
        // ── REGISTER_DONOR ────────────────────────────────────────────────────
        if (prediction.intent === "REGISTER_DONOR") {
            clearState(psId);
            await (0, sendMessageToFbUser_1.sendUrlButtonToFbUser)(psId, "রক্তদাতা হিসেবে নিবন্ধন করতে নিচের বোতামে ক্লিক করুন 👇", "রেজিস্ট্রেশন করুন", `${process.env.FRONTEND_URL}/register?source=bot`);
            return true;
        }
        // ── UPDATE_DONATION ───────────────────────────────────────────────────
        if (prediction.intent === "UPDATE_DONATION") {
            clearState(psId);
            await (0, quickReply_1.default)(psId, "শেষ রক্তদানের তারিখ আপডেট করতে নিচের বোতামে ক্লিক করুন:", ["Update Last Donation"]);
            return true;
        }
        // ── REQUEST_BLOOD ─────────────────────────────────────────────────────
        if (prediction.intent === "REQUEST_BLOOD") {
            clearState(psId);
            await (0, sendMessageToFbUser_1.sendUrlButtonToFbUser)(psId, "রক্তের জন্য আবেদন করতে নিচের বোতামে ক্লিক করুন:", "রক্তের আবেদন করুন", `${process.env.FRONTEND_URL}/blood-donation`);
            return true;
        }
        // ── GREET ─────────────────────────────────────────────────────────────
        if (prediction.intent === "GREET") {
            clearState(psId);
            await (0, quickReply_1.default)(psId, "👋 আস্সালামু আলাইকুম! আমি LifeDrop Bot।\n\nবাংলা বা ইংরেজিতে সরাসরি লিখুন, যেমন:\n\"A+ রক্ত দরকার ঢাকায়\"\n\"রক্তদানের বয়স কত?\"\n\nঅথবা নিচের মেনু থেকে বেছে নিন:", ["Find Blood", "Register", "Donate Blood", "Update Last Donation", "Request for Blood"]);
            return true;
        }
        // ── HELP ──────────────────────────────────────────────────────────────
        if (prediction.intent === "HELP") {
            clearState(psId);
            await (0, sendMessageToFbUser_1.default)(psId, "🩸 LifeDrop Bot যা করতে পারে:\n\n" +
                "🔍 রক্তদাতা খোঁজা:\n" +
                "   \"A+ রক্ত দরকার ঢাকায়\"\n" +
                "   \"চট্টগ্রাম মেডিকেলে B+ ব্লাড লাগবে\"\n\n" +
                "📝 ডোনার নিবন্ধন:\n" +
                "   \"আমি রক্তদাতা হতে চাই\"\n\n" +
                "📅 ডোনেশন তারিখ আপডেট:\n" +
                "   \"আজ রক্ত দিয়েছি\"\n\n" +
                "❓ রক্তদান সম্পর্কে প্রশ্ন:\n" +
                "   \"কতদিন পর রক্ত দেওয়া যায়?\"\n" +
                "   \"ট্যাটু করলে কি রক্ত দেওয়া যায়?\"\n" +
                "   \"রক্ত দেওয়ার পর কী খাব?\"");
            return true;
        }
        // ── UNKNOWN: try FAQ fallback, then always redirect to website ──────
        const faqEntry = (0, faqKnowledgeBase_1.findFaqAnswer)(text);
        if (faqEntry) {
            await (0, sendMessageToFbUser_1.default)(psId, faqEntry.answer);
            if (faqEntry.quickReplies && faqEntry.quickReplies.length > 0) {
                await (0, quickReply_1.default)(psId, "আরো কিছু জানতে চান?", faqEntry.quickReplies);
            }
            return true;
        }
        // Last resort – send website link so user never hits a dead end
        await (0, sendMessageToFbUser_1.default)(psId, "🩸 আপনার প্রশ্নটি বুঝতে পারিনি, তবে আমাদের ওয়েবসাইটে গিয়ে সহজেই রক্তদাতা খুঁজে পাবেন।");
        await (0, sendMessageToFbUser_1.sendUrlButtonToFbUser)(psId, "ওয়েবসাইটে সকল বিভাগ অনুযায়ী রক্তদাতা খুঁজুন:", "রক্তদাতা খুঁজুন", `${process.env.FRONTEND_URL}/blood-donation`);
        return true;
    }
    catch (err) {
        console.error("[AI] handleAiMessage error:", err);
        // Even on unexpected errors, guide the user to the website
        try {
            await (0, sendMessageToFbUser_1.default)(psId, "⚠️ কিছু একটা সমস্যা হয়েছে। আমাদের ওয়েবসাইট থেকে রক্তদাতা খুঁজুন:");
            await (0, sendMessageToFbUser_1.sendUrlButtonToFbUser)(psId, "ওয়েবসাইটে রক্তদাতা খুঁজুন:", "রক্তদাতা খুঁজুন", `${process.env.FRONTEND_URL}/blood-donation`);
        }
        catch ( /* ignore secondary errors */_a) { /* ignore secondary errors */ }
        return true;
    }
}
/** Reset AI conversation state for a user (call when they start a structured flow) */
function clearAiState(psId) {
    clearState(psId);
}
