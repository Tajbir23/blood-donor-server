"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reportSchema = new mongoose_1.Schema({
    reportedUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reporterUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Organization",
        default: null
    },
    reason: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['fake_donation', 'inappropriate_behavior', 'spam', 'wrong_info', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    adminNote: {
        type: String,
        default: ''
    }
}, { timestamps: true });
reportSchema.index({ organizationId: 1, status: 1 });
reportSchema.index({ reportedUserId: 1 });
const reportModel = (0, mongoose_1.model)("Report", reportSchema);
exports.default = reportModel;
