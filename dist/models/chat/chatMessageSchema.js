"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chatMessageSchema = new mongoose_1.Schema({
    ticketId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ChatTicket",
        required: true,
        index: true,
    },
    senderType: {
        type: String,
        enum: ["guest", "admin"],
        required: true,
    },
    senderName: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 2000,
    },
}, { timestamps: true });
const ChatMessage = (0, mongoose_1.model)("ChatMessage", chatMessageSchema);
exports.default = ChatMessage;
