"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const highestDonor = async (req, res) => {
    try {
        const donor = await userSchema_1.default.find({
            isActive: true,
            isVerified: true,
            isBanned: false,
        })
            .select('fullName thanaId districtId profileImageUrl totalDonationCount bloodGroup')
            .sort({ totalDonationCount: -1 })
            .limit(10);
        res.status(200).json({
            success: true,
            message: "Highest Donor Leaderboard",
            data: donor || []
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
};
exports.default = highestDonor;
