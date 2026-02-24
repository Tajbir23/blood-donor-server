"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const donationHistorySchema_1 = __importDefault(require("../../models/user/donationHistorySchema"));
const getDonationHistory = async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const [donations, total] = await Promise.all([
            donationHistorySchema_1.default
                .find({ userId })
                .sort({ donationDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            donationHistorySchema_1.default.countDocuments({ userId }),
        ]);
        res.status(200).json({
            success: true,
            donations,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("[getDonationHistory]", error);
        res.status(500).json({ success: false, message: "রক্তদানের ইতিহাস লোড করতে ব্যর্থ হয়েছে" });
    }
};
exports.default = getDonationHistory;
