"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chatTicketSchema = new mongoose_1.Schema({
    guestId: {
        type: String,
        required: true,
        index: true,
    },
    guestName: {
        type: String,
        default: "অতিথি",
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        index: { expires: 0 }, // MongoDB TTL index — auto deletes at expiresAt
    },
}, { timestamps: true });
const ChatTicket = (0, mongoose_1.model)("ChatTicket", chatTicketSchema);
exports.default = ChatTicket;
