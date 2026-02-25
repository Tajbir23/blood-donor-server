"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleTgBotMessage_1 = require("../../handler/telegramBotHandler/handleTgBotMessage");
const sendMessageToTgUser_1 = require("../../handler/telegramBotHandler/sendMessageToTgUser");
const telegramMessageSchema_1 = __importDefault(require("../../models/telegram/telegramMessageSchema"));
const telegramChatBot = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    // Always respond 200 immediately so Telegram doesn't retry
    res.sendStatus(200);
    try {
        const update = req.body;
        if (!update)
            return;
        // ── Inline keyboard button press ──────────────────────────────────────
        if (update.callback_query) {
            const cq = update.callback_query;
            const chatId = String((_b = (_a = cq.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id);
            const data = (_c = cq.data) !== null && _c !== void 0 ? _c : "";
            if (!chatId || chatId === "undefined")
                return;
            // Save to DB
            await telegramMessageSchema_1.default.create({
                chatId,
                username: (_e = (_d = cq.from) === null || _d === void 0 ? void 0 : _d.username) !== null && _e !== void 0 ? _e : null,
                firstName: (_g = (_f = cq.from) === null || _f === void 0 ? void 0 : _f.first_name) !== null && _g !== void 0 ? _g : null,
                callbackData: data,
                direction: "incoming",
                rawPayload: cq,
            });
            await (0, sendMessageToTgUser_1.answerCallbackQuery)(cq.id);
            await (0, handleTgBotMessage_1.handleTgCallbackQuery)(chatId, data, (_j = (_h = cq.from) === null || _h === void 0 ? void 0 : _h.username) !== null && _j !== void 0 ? _j : undefined, (_l = (_k = cq.from) === null || _k === void 0 ? void 0 : _k.first_name) !== null && _l !== void 0 ? _l : undefined);
            return;
        }
        // ── Regular message (text / command) ──────────────────────────────────
        if (update.message) {
            const msg = update.message;
            const chatId = String((_m = msg.chat) === null || _m === void 0 ? void 0 : _m.id);
            const text = (_o = msg.text) !== null && _o !== void 0 ? _o : "";
            if (!chatId || chatId === "undefined" || !text)
                return;
            // Save to DB
            await telegramMessageSchema_1.default.create({
                chatId,
                username: (_q = (_p = msg.from) === null || _p === void 0 ? void 0 : _p.username) !== null && _q !== void 0 ? _q : null,
                firstName: (_s = (_r = msg.from) === null || _r === void 0 ? void 0 : _r.first_name) !== null && _s !== void 0 ? _s : null,
                messageText: text,
                direction: "incoming",
                rawPayload: msg,
            });
            await (0, handleTgBotMessage_1.handleTgTextMessage)(chatId, text, (_u = (_t = msg.from) === null || _t === void 0 ? void 0 : _t.username) !== null && _u !== void 0 ? _u : undefined, (_w = (_v = msg.from) === null || _v === void 0 ? void 0 : _v.first_name) !== null && _w !== void 0 ? _w : undefined);
        }
    }
    catch (err) {
        console.error("[TG] Webhook processing error:", err);
    }
};
exports.default = telegramChatBot;
