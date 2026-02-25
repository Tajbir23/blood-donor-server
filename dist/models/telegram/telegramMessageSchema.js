"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const telegramMessageSchema = new mongoose_1.Schema({
    chatId: { type: String, required: true, index: true },
    username: { type: String, default: null },
    firstName: { type: String, default: null },
    messageText: { type: String, default: null },
    callbackData: { type: String, default: null },
    direction: { type: String, enum: ["incoming", "outgoing"], default: "incoming" },
    rawPayload: { type: mongoose_1.Schema.Types.Mixed, default: null },
}, { timestamps: true });
const TelegramMessage = (0, mongoose_1.model)("TelegramMessage", telegramMessageSchema);
exports.default = TelegramMessage;
