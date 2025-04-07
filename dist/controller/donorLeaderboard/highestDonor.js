"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const highestDonor = async (req, res) => {
    try {
        const donor = await userSchema_1.default.find({})
            .sort({ donationCount: -1 }) // Sort by donation count in descending order
            .limit(10); // Get top 10 donors with highest donation count
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
