"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reportSchema_1 = __importDefault(require("../../models/user/reportSchema"));
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const reportUser = async (req, res) => {
    try {
        const reporterId = req.user._id;
        const { reportedUserId, organizationId, reason, category, description } = req.body;
        if (!reportedUserId || !reason) {
            res.status(400).json({
                success: false,
                message: "রিপোর্টকৃত ব্যবহারকারী এবং কারণ আবশ্যক"
            });
            return;
        }
        if (reporterId.toString() === reportedUserId.toString()) {
            res.status(400).json({
                success: false,
                message: "আপনি নিজেকে রিপোর্ট করতে পারবেন না"
            });
            return;
        }
        // Check if this user already reported this person
        const existingQuery = {
            reporterUserId: reporterId,
            reportedUserId,
            status: { $in: ['pending', 'reviewed'] }
        };
        if (organizationId)
            existingQuery.organizationId = organizationId;
        const existingReport = await reportSchema_1.default.findOne(existingQuery);
        if (existingReport) {
            res.status(409).json({
                success: false,
                message: "আপনি ইতোমধ্যে এই ব্যবহারকারীকে রিপোর্ট করেছেন"
            });
            return;
        }
        const report = await reportSchema_1.default.create({
            reporterUserId: reporterId,
            reportedUserId,
            ...(organizationId && { organizationId }),
            reason,
            category: category || 'other',
            description: description || ''
        });
        // Increment the user's reportCount
        await userSchema_1.default.findByIdAndUpdate(reportedUserId, { $inc: { reportCount: 1 } });
        res.status(201).json({
            success: true,
            message: "রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে",
            report
        });
    }
    catch (error) {
        console.error("Report user error:", error);
        res.status(500).json({
            success: false,
            message: "সার্ভার ত্রুটি হয়েছে"
        });
    }
};
exports.default = reportUser;
