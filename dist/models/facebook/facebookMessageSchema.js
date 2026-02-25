"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const facebookMessageSchema = new mongoose_1.Schema({
    psId: { type: String, required: true, index: true },
    messageText: { type: String, default: null },
    postback: { type: String, default: null },
    quickReplyPayload: { type: String, default: null },
    direction: { type: String, enum: ["incoming", "outgoing"], default: "incoming" },
    rawPayload: { type: mongoose_1.Schema.Types.Mixed, default: null },
    botReply: { type: String, default: null },
}, { timestamps: true });
const FacebookMessage = (0, mongoose_1.model)("FacebookMessage", facebookMessageSchema);
exports.default = FacebookMessage;
